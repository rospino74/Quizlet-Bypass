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

export async function replaceCookies(extensionCookies: string, url = 'https://quizlet.com'): Promise<void> {
    // Itero tutti i cookies dell'estensione
    extensionCookies.split('; ').forEach(async (cookie: string): Promise<void> => {
        // Prendo il valore e il nome del cookie
        const [cookieName, cookieValue] = cookie.split('=');

        // Salvo il cookie nel browser
        await chrome.cookies.set({
            url,
            name: cookieName,
            value: cookieValue,
        });
    });
}

export function clearCookies(url = 'https://quizlet.com'): void {
    // Prendo tutti i cookies di Quizlet
    chrome.cookies.getAll({ url }, (cookies) => {
        // Itero tutti i cookies
        cookies.forEach(async (cookie) => {
            // Elimino il cookie
            await chrome.cookies.remove({
                url,
                name: cookie.name,
            });
        });
    });
}
