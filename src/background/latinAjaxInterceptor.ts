// Copyright 2021 rospino74
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

function listener(details: chrome.webRequest.WebRequestBodyDetails) {
    // @ts-ignore
    let filter = browser.webRequest.filterResponseData(details.requestId);
    let decoder = new TextDecoder('utf-8');
    let encoder = new TextEncoder();

    filter.ondata = (event: any) => {
        let str = decoder.decode(event.data, {stream: true});

        // Creo un elemento template
        const template = document.createElement('template');
        template.innerHTML = str;

        // Elimino l'anty copy
        const noCopyBoxes = template.content.querySelectorAll('[style*=user-select]') as NodeListOf<HTMLElement>;
        userSelectRemover(noCopyBoxes);

        // Estraggo html
        str = template.innerHTML;
        
        // Invio la risposta
        filter.write(encoder.encode(str));
        filter.disconnect();
    }

    return {};
}

export default function installLatinAjaxInterceptor() {
    try {
        // @ts-ignore
        if (browser) {
            chrome.webRequest.onBeforeRequest.addListener(
                listener,
                {urls: ['https://www.latin.it/ajax_traduzione_frase.php?*', 'https://www.latin.it/ajax_traduzione_versione.php?*']},
                ['blocking']
            );
            console.log("%cSistema anti-anti-copiatura installato. %cL'anti-copy evader è supportato solo su Firefox, per info: https://bugs.chromium.org/p/chromium/issues/detail?id=104058", 'color: #80f5ab;', 'color: gray; font-style: italic;');
        } else {
            throw new Error('Browser non supportato');
        }
    } catch (e) {
        console.log("%cImpossibile intercettare le risposte su un browser diverso da Firefox. %cL'anti-copy evader non sarà disponibile.\n\n%cPer info: %chttps://bugs.chromium.org/p/chromium/issues/detail?id=104058", 'color: #f04747;', 'color: gray; font-style: italic;', 'color: #009dd9;', 'color: gray; font-style: italic;');
    }
}
