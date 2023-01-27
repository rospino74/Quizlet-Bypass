// Copyright 2021-2023 rospino74 and contributors
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

// This file is a bit special, we don't have firefox typedef so we have to use @ts-ignore and friends
/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */

function removeUserSelectRules(str: string): string {
    // Regex to find all kind of user select
    const regex = /-?(moz|webkit|khtml|ms|o)?-?user-select: none;?/gm;

    // Just removes it
    return str.replace(regex, '');
}

function firefoxListener(details: chrome.webRequest.WebRequestBodyDetails) {
    // @ts-ignore
    const filter = browser.webRequest.filterResponseData(details.requestId);
    const decoder = new TextDecoder('utf-8');
    const encoder = new TextEncoder();

    filter.ondata = (event: any) => {
        let str = decoder.decode(event.data, { stream: true });

        // If the string is protected, we don't modify it
        if (str.includes('Protected')) {
            if (__EXTENSION_DEBUG_PRINTS__) {
                console.warn(
                    chrome.i18n.getMessage('debugProtectedPageDetected'),
                );
            }

            filter.write(encoder.encode(str));
            filter.disconnect();
            return;
        }

        // Elimino l'anty copy
        str = removeUserSelectRules(str);

        if (__EXTENSION_DEBUG_PRINTS__) {
            console.log(
                chrome.i18n.getMessage('debugModifiedHtml'),
                str,
            );
        }

        // Just send back the response
        filter.write(encoder.encode(str));
        filter.disconnect();
    };

    return {};
}

function chromeListener(details: chrome.webRequest.WebRequestBodyDetails) {
    // Fetching the response body via XMLHttpRequest
    const xhr = new XMLHttpRequest();
    xhr.open('GET', details.url, false);
    xhr.send();

    if (__EXTENSION_DEBUG_PRINTS__) {
        console.log(`Response recieved from ${details.url} with HTTP status code ${xhr.status} ${xhr.statusText}`);
    }

    if (xhr.status !== 200 || xhr.responseText.includes('Protected')) {
        if (__EXTENSION_DEBUG_PRINTS__) {
            console.warn(
                chrome.i18n.getMessage('debugProtectedPageDetected'),
            );
        }

        return {};
    }

    // Remove the anti-copy system
    const parsed = removeUserSelectRules(xhr.responseText);

    if (__EXTENSION_DEBUG_PRINTS__) {
        console.log(
            chrome.i18n.getMessage('debugModifiedHtml'),
            parsed,
        );
    }

    // Getting the modified data url and redirecting the user
    const dataURL = `data:text/html,${encodeURIComponent(parsed)}`;
    return {
        redirectUrl: dataURL,
    };
}

export default function installLatinAjaxInterceptor() {
    try {
        // @ts-ignore
        if (typeof browser !== 'undefined') {
            // @ts-ignore
            browser.webRequest.onBeforeRequest.addListener(
                firefoxListener,
                { urls: ['https://www.latin.it/ajax_traduzione_frase.php?*', 'https://www.latin.it/ajax_traduzione_versione.php?*'] },
                ['blocking'],
            );
            if (__EXTENSION_DEBUG_PRINTS__) {
                console.log(
                    chrome.i18n.getMessage('debugSuccessfullyInstalledLatinAjaxInterceptor'),
                    'color: #80f5ab;',
                    'color: gray; font-style: italic;',
                    'color: #009dd9;',
                    'color: gray; font-style: italic;',
                );
            }
        } else if (__EXTENSION_MV3__) {
            throw new Error('Manifest Version 3 not supported.');
        } else {
            chrome.webRequest.onBeforeRequest.addListener(
                chromeListener,
                { urls: ['https://www.latin.it/ajax_traduzione_frase.php?*', 'https://www.latin.it/ajax_traduzione_versione.php?*'] },
                ['blocking'],
            );

            if (__EXTENSION_DEBUG_PRINTS__) {
                console.log(
                    chrome.i18n.getMessage('debugSuccessfullyInstalledLatinAjaxInterceptorChrome'),
                    'color: #f5cf80;',
                    'color: gray; font-style: italic;',
                    'color: #009dd9;',
                    'color: gray; font-style: italic;',
                );
            }
        }
    } catch (e) {
        if (__EXTENSION_DEBUG_PRINTS__) {
            console.log(
                chrome.i18n.getMessage('debugUnableToInstallLatinAjaxInterceptor'),
                'color: #f04747;',
                'color: gray; font-style: italic;',
                'color: #009dd9;',
                'color: gray; font-style: italic;',
            );
            console.error(e);
        }
    }
}
