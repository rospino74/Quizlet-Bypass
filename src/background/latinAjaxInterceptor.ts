// Copyright 2021-2022 rospino74 and contributors
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import userSelectRemover from '../foreground/latin/import/userSelectRemover';

function firefoxListener(details: chrome.webRequest.WebRequestBodyDetails) {
    // @ts-ignore
    const filter = browser.webRequest.filterResponseData(details.requestId);
    const decoder = new TextDecoder('utf-8');
    const encoder = new TextEncoder();

    filter.ondata = (event: any) => {
        let str = decoder.decode(event.data, { stream: true });

        // If the string is protected, we don't modify it
        if (str.includes('Protected')) {
            if (process.env.NODE_ENV !== 'production') {
                console.warn(
                    chrome.i18n.getMessage("protectedPageDetected"),
                );
            }

            filter.write(encoder.encode(str));
            filter.disconnect();
            return;
        }

        // Elimino l'anty copy
        str = parseAndRemove(str);

        if (process.env.NODE_ENV !== 'production') {
            console.log(
                chrome.i18n.getMessage("modifiedHtml"),
                str
            );
        }

        // Invio la risposta
        filter.write(encoder.encode(str));
        filter.disconnect();
    }

    return {};
}

function chromeListener(details: chrome.webRequest.WebRequestBodyDetails) {
    // Fetching the response body via XMLHttpRequest
    const xhr = new XMLHttpRequest();
    xhr.open('GET', details.url, false);
    xhr.send();

    if (process.env.NODE_ENV !== 'production') {
        console.log(`Response recieved from ${details.url} with HTTP status code ${xhr.status} ${xhr.statusText}`);
    }

    if (xhr.status !== 200 || xhr.responseText.includes('Protected')) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(
                chrome.i18n.getMessage("protectedPageDetected"),
            );
        }

        return {};
    }

    // Remove the anti-copy system
    const parsed = parseAndRemove(xhr.responseText);

    if (process.env.NODE_ENV !== 'production') {
        console.log(
            chrome.i18n.getMessage("modifiedHtml"),
            parsed
        );
    }

    // Getting the modified data url and redirecting the user
    const dataURL = `data:text/html,${encodeURIComponent(parsed)}`;
    return {
        redirectUrl: dataURL,
    };
}

function parseAndRemove(str: string): string {
    // Creo un elemento template
    const template = document.createElement('template');
    template.innerHTML = str;

    // Elimino l'anty copy
    const noCopyBoxes = template.content.querySelectorAll('[style*=user-select]') as NodeListOf<HTMLElement>;
    userSelectRemover(noCopyBoxes);

    // Estraggo html
    return template.innerHTML;
}

export default function installLatinAjaxInterceptor() {
    try {
        // @ts-ignore
        if (typeof browser !== 'undefined') {
            // @ts-ignore
            browser.webRequest.onBeforeRequest.addListener(
                firefoxListener,
                { urls: ['https://www.latin.it/ajax_traduzione_frase.php?*', 'https://www.latin.it/ajax_traduzione_versione.php?*'] },
                ['blocking']
            );
            if (process.env.NODE_ENV !== 'production') {
                console.log(
                    chrome.i18n.getMessage('successfullyInstalledLatinAjaxInterceptor'),
                    'color: #80f5ab;',
                    'color: gray; font-style: italic;',
                    'color: #009dd9;',
                    'color: gray; font-style: italic;'
                );
            }

        } else {
            chrome.webRequest.onBeforeRequest.addListener(
                chromeListener,
                { urls: ['https://www.latin.it/ajax_traduzione_frase.php?*', 'https://www.latin.it/ajax_traduzione_versione.php?*'] },
                ['blocking']
            );

            console.log(
                chrome.i18n.getMessage('successfullyInstalledLatinAjaxInterceptorChrome'),
                'color: #f5cf80;',
                'color: gray; font-style: italic;',
                'color: #009dd9;',
                'color: gray; font-style: italic;'
            );
        }
    } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(
                chrome.i18n.getMessage('unableToInstallLatinAjaxInterceptor'),
                'color: #f04747;',
                'color: gray; font-style: italic;',
                'color: #009dd9;',
                'color: gray; font-style: italic;'
            );
        }
        console.error(e);
    }
}

