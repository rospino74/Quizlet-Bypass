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

import getHTMLFromTranslate from './translateGrabber';

export default function substituteTranslationFromSourceURL(textSourceURL: string, destinationBoxElement: Element) {
    if (__EXTENSION_DEBUG_PRINTS__) {
        console.log(chrome.i18n.getMessage('debugExpiredSolutionsLatin'), 'color: #F5AB80');
    }

    for (let success = false, i = 0; i <= 5 && !success; i++) {
        getHTMLFromTranslate(textSourceURL).then((html) => {
        // Sostituisco il brano con la soluzione
            if (html) {
                if (textSourceURL.indexOf('autore') !== -1) {
                    destinationBoxElement.innerHTML = html;
                } else {
                    const iframe = document.createElement('iframe');
                    iframe.srcdoc = html;
                    iframe.style.width = '100%';
                    iframe.style.height = '150vh';
                    iframe.style.border = 'none';

                    destinationBoxElement.innerHTML = '';
                    destinationBoxElement.appendChild(iframe);
                }
            }

            success = true;
        });
    }
}
