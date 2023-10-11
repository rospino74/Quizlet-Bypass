// Copyright 2021-2023 rospino74 and contributors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { clearCookies, replaceCookies } from './cookieReplacer';
import makeBackgroundWebRequest from './makeBackgroundWebRequest';
import { getStatistics, incrementStatistic } from './statsUtils';

// Shitty banner here
(() => {
    let specialStyle = [
        'font-weight: bold',
        'font-size: 32px',
        'color: white',
    ].join(';');

    // Text shadow styles
    specialStyle += '; text-shadow: ';
    [0, 40, 60, 100, 170, 230, 270, 360].forEach((hue, i, array) => {
        const ni = i + 1; // Start from 1, not 0 as we need the text-shadow offset multiplication not to be 0
        specialStyle += `${1.5 * ni}px ${1.2 * ni}px 0px hsl(${hue}, 70%, 60%)${ni < array.length ? ', ' : ';'}`;
    });

    console.log('%cQuizlet Bypass %cv%s\n\nhttps://github.com/rospino74/Quizlet-Bypass', specialStyle, 'color: gray; font-style: italic;', __EXTENSION_VERSION__);
})();

// Listening for messages from the content script
chrome.runtime.onMessage.addListener((message: { action: string; value: string | object }, sender, sendResponse) => {
    if (__EXTENSION_DEBUG_PRINTS__) {
        console.info(
            chrome.i18n.getMessage('messageFromContentScript'),
            message,
        );
    }

    const { action, value } = message;
    const { tab } = sender;
    switch (action) {
    case 'copyCookies': {
        if (__EXTENSION_DEBUG_PRINTS__) {
            console.info(
                chrome.i18n.getMessage('cookiesReceived'),
                value,
            );
        }
        const url = tab?.url ? new URL(tab.url).origin : undefined;
        replaceCookies(value as string, url);
        break;
    }
    case 'clearCookies': {
        if (__EXTENSION_DEBUG_PRINTS__) {
            console.info(
                chrome.i18n.getMessage('cookiesCleared'),
            );
        }

        const url = tab?.url ? new URL(tab.url).origin : undefined;
        clearCookies(url);
        break;
    }
    case 'refresh': {
        if (__EXTENSION_DEBUG_PRINTS__) {
            console.info(
                chrome.i18n.getMessage('debugRefreshRequested'),
            );
        }

        if (tab?.id) {
            const { id, url } = tab;
            chrome.tabs.reload(id).catch(() => {
                chrome.tabs.update(id, { url });
            });
        }
        break;
    }
    case 'incrementStats': {
        if (__EXTENSION_DEBUG_PRINTS__) {
            console.info('Increment stats received');
        }
        incrementStatistic(value as string);
        break;
    }
    case 'getStats': {
        if (__EXTENSION_DEBUG_PRINTS__) {
            console.info('Get stats received');
        }

        getStatistics().then((response) => {
            const key = value as string;
            sendResponse(response[key]);
        });
        break;
    }
    case 'makeWebRequest': {
        if (__EXTENSION_DEBUG_PRINTS__) {
            console.info(
                chrome.i18n.getMessage('debugWebRequestResponse'),
                value,
            );
        }

        const {
            method, url, body, headers, sendCredentials,
        } = value as { method: 'GET' | 'POST'; url: string; body?: BodyInit; headers?: HeadersInit; sendCredentials: boolean };
        makeBackgroundWebRequest(url, method, body, headers, sendCredentials).then((response: Response): void => {
            response.text().then((text: string): void => {
                sendResponse({
                    text,
                    error: false,
                });
            });
        }).catch((e) => {
            console.error(chrome.i18n.getMessage('fetchError'), 'color: #F5AB80', e);
            sendResponse({
                text: e,
                error: true,
            });
        });
        break;
    }
    default:
        break;
    }
    return true;
});

chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
    // If the url is undefined, use the tab url or the default quizlet url (so we can at least enable the browser action)
    const url = changeInfo.url ?? tab.url ?? 'quizlet.com';

    const actionAPI = __EXTENSION_MV3__ ? chrome.action : chrome.browserAction;
    if (url.includes('quizlet.com')) {
        actionAPI.enable(tabId);
    } else {
        actionAPI.disable(tabId);
    }
});
