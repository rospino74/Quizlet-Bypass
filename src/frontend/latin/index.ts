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

import getHTMLFromTranslate from './import/translateGrabber';

console.log('%cSplash Latino Evader %cv%s', 'color: #009dd9;', 'color: gray; font-style: italic;', __EXTENSION_VERSION__);

const solutionBox = document.querySelector('div.corpo')?.children.item(4)?.children.item(1);

// prendo l'url con una regex
const url = /https?:\/\/www\.latin\.it\/([^\s]+)/g.exec(window.location.href);

if (!url || !solutionBox) {
    if (__EXTENSION_DEBUG_PRINTS__) {
        console.log(chrome.i18n.getMessage('debugNotLoadedOnAValidPage'), 'color: #f04747;', 'color: gray; font-style: italic;');
    }
} else {
    // Getting the count of the remaining solutions
    let solutionsText = solutionBox.querySelector('.tdbox')?.children?.item(3)?.textContent;
    if (!solutionsText) {
        solutionsText = solutionBox.querySelector('div[style*="color: #000 !important;"]')?.textContent ?? '1 brani 0 brani';
    }

    const soluzionsCount = Array.from(solutionsText.matchAll(/([0-9\.]+) brani/g))

    if (soluzionsCount.length < 2) {
        substituteText(url[1], solutionBox);
    } else {
        const [[, soluzioniUsate], [, soluzioniTotali]] = soluzionsCount;

        // Checking if we still have solutions available
        if (parseInt(soluzioniTotali) < 5) {
            substituteText(url[1], solutionBox);
        } else {
            if (__EXTENSION_DEBUG_PRINTS__) {
                console.log(`%c${chrome.i18n.getMessage('debugRemainingSolutions')}`, 'color: #80f5ab', soluzioniTotali);
            }
        }
    }
}

function substituteText(url: string, solutionBox: Element) {
    if (__EXTENSION_DEBUG_PRINTS__) {
        console.log(chrome.i18n.getMessage('debugExpiredSolutionsLatin'), 'color: #F5AB80');
    }

    for (let success = false, i = 0; i <= 5 && !success; i++)
        getHTMLFromTranslate(url).then(html => {
            // Sostituisco il brano con la soluzione
            if (html) {
                if (url.indexOf('autore') != -1) {
                    solutionBox.innerHTML = html;
                } else {
                    const iframe = document.createElement('iframe');
                    iframe.srcdoc = html;
                    iframe.style.width = '100%';
                    iframe.style.height = '150vh';
                    iframe.style.border = 'none';

                    solutionBox.innerHTML = '';
                    solutionBox.appendChild(iframe);
                }
            }

            success = true;
        });
}