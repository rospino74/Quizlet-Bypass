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

/* eslint-disable no-undef */
export default async function replaceQuizletCookies(extensionCookies) {
    // Ottengo la tab corrente
//   const currentTab = chrome.tabs.getCurrent();

    // Controllo che sia definita
    //   if (!currentTab) {
    //     console.error('Impossibile ottenere la Tab corrente!', currentTab);
    //     return;
    //   }

    // Itero tutti i cookies dell'estensione
    extensionCookies.split('; ').forEach(async (cookie) => {
    // Prendo il valore e il nome del cookie
        const [cookieName, cookieValue] = cookie.split('=');

        // Salvo il cookie nel browser
        await chrome.cookies.set({
            //   url: currentTab.url,
            url: 'quizlet.com',
            name: cookieName,
            value: cookieValue,
        });
    });
}
