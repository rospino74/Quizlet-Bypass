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

import replaceQuizletCookies from './cookieReplacer';
import installLatinAjaxInterceptor from './interceptors/latin';
import makeBackgroundWebRequest from './makeBackgroundWebRequest';

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

// Provo ad intercettare le richieste
installLatinAjaxInterceptor();

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
        replaceQuizletCookies(value as string, tab?.url);
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

        chrome.storage.sync.get('stats', (result: any) => {
            const key = value as string;
            const newValue = (result[key] ?? 0) + 1;
            result[key] = newValue;
            chrome.storage.sync.set({ stats: result });
        });

        break;
    }
    case 'getStats': {
        if (__EXTENSION_DEBUG_PRINTS__) {
            console.info('Get stats received');
        }

        chrome.storage.sync.get('stats', (result: any) => {
            const key = value as string;
            const statsValue = result[key] ?? 0;
            sendResponse(statsValue);
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
            method, url, body, headers,
        } = value as { method: 'GET' | 'POST'; url: string; body?: BodyInit; headers?: HeadersInit; };
        makeBackgroundWebRequest(url, method, body, headers).then((response: Response): void => {
            response.text().then((text: string): void => {
                sendResponse(text);
            });
        }).catch((e) => {
            console.error(e);
            sendResponse(e);
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
