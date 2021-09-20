// Copyright 2021 rospino74
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

// @ts-ignore
import replaceQuizletCookies from './cookieReplacer';

chrome.runtime.onMessage.addListener((message: { action: string; tab: chrome.tabs.Tab; value: string; }) => {
    console.log('Richiesta ricevuta:', message);

    const { action, tab, value } = message;
    if (action === 'copyCookies') {
        console.warn('Account cookies recived: ', value);
        replaceQuizletCookies(value);
    } else if (action === 'refresh') {
        console.warn('Refresh received');
        chrome.tabs.reload(tab.id!!).catch(() => {
            chrome.tabs.update(tab.id!!, {url: tab.url});
        });
    }
});
