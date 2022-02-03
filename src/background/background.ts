// Copyright 2021-2022 rospino74 and contributors
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
import installLatinAjaxInterceptor from './latinAjaxInterceptor';
import installQuizletInterceptor from './quizletInterceptor';


// Provo ad intercettare le richieste
installLatinAjaxInterceptor();

// Install an interceptor to remove quizlet anti adblocker
installQuizletInterceptor();

// Listening for messages from the content script
chrome.runtime.onMessage.addListener((message: { action: string; value: string; }, sender: chrome.runtime.MessageSender, reply) => {

    if (process.env.NODE_ENV !== 'production') {
        console.info(
            chrome.i18n.getMessage("messageFromContentScript"),
            message
        );
    }

    const { action, value } = message;
    const { tab } = sender;
    switch (action) {
        case 'copyCookies': {
            if (process.env.NODE_ENV !== 'production') {
                console.info(
                    chrome.i18n.getMessage("cookiesReceived"),
                    value
                );
            }
            replaceQuizletCookies(value, tab?.url);
            break;
        }

        case 'refresh': {
            if (process.env.NODE_ENV !== 'production') {
                console.info(
                    chrome.i18n.getMessage("refreshRequested"),
                );
            }

            chrome.tabs.reload(tab?.id!!).catch(() => {
                chrome.tabs.update(tab?.id!!, { url: tab?.url });
            });
            break;
        }
        case 'incrementStats': {
            if (process.env.NODE_ENV !== 'production') {
                console.warn('Increment stats received');
            }

            const oldValue = parseInt(localStorage.getItem(`stats.${value}`) || '0', 10);
            const newValue = (oldValue + 1).toString();
            localStorage.setItem(`stats.${value}`, newValue);
            break;
        }
        case 'getStats': {
            if (process.env.NODE_ENV !== 'production') {
                console.warn('Get stats received');
            }

            const oldValue = parseInt(localStorage.getItem(`stats.${value}`) || '0', 10);
            reply(oldValue);
            break;
        }
    }
});

chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
    let { url } = changeInfo;

    if (!url) {
        url = tab.url!!;
    }

    if (url.includes('quizlet.com')) {
        chrome.browserAction.enable(tabId);
    } else {
        chrome.browserAction.disable(tabId);
    }
});
