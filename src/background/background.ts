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
chrome.runtime.onMessage.addListener((message: { action: string; value: string; }, sender: chrome.runtime.MessageSender) => {

    if (process.env.NODE_ENV !== 'production') {
        console.log('Message received from content script:', message);
    }

    const { action, value } = message;
    const { tab } = sender;
    if (action === 'copyCookies') {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('Account cookies received: ', value);
        }

        replaceQuizletCookies(value, tab?.url);
    } else if (action === 'refresh') {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('Refresh received');
        }

        chrome.tabs.reload(tab?.id!!).catch(() => {
            chrome.tabs.update(tab?.id!!, { url: tab?.url });
        });
    }
});
