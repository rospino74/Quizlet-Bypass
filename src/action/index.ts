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

try {
    // We are sure that the element exists, so we can disable the eslint rule
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const counterValue = document.querySelector<HTMLElement>('.counter-value')!;

    // Sets the counter subtitle based on the current language
    document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((e) => {
        // Wr can safely get the value of the attribute because we have queried only the elements that have it
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        e.innerText = chrome.i18n.getMessage(e.dataset.i18n!);
    });

    // Sets the counter value
    chrome.runtime.sendMessage({
        action: 'getStats',
        value: 'accounts_created',
    }, (response?: string) => {
        if (response) {
            console.log(response);
            counterValue.innerText = response;
        }
    });
} catch (e) {
    console.error(e);
}

// Detects if the user is uing dark mode
const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (isDarkMode) {
    document.documentElement.classList.add('dark');
}
