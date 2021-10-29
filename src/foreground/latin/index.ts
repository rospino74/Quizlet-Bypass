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

import getHTMLFromTranslate from './import/translateGrabber';

console.log('%cSplash Latino Evader %cv%s', 'color: #009dd9;', 'color: gray; font-style: italic;', process.env.VERSION);

const solutionBox = document.querySelector('div.corpo')?.children.item(4)?.children.item(1);

// prendo l'url con una regex
const url = /https?:\/\/www\.latin\.it\/([^\s]+)/g.exec(window.location.href);

if (!url || !solutionBox)
    if (/^it\b/.test(navigator.language)) {
        console.log("%cNon sono stato caricato in una pagina valida! %cSono davanti a delle frasi, una versione o un brano d'autore?", 'color: #f04747;', 'color: gray; font-style: italic;');
    } else {
        console.log("%cI was not loaded on a valid page! %cAm I in front of a phrase, a version or an author's piece?", 'color: #f04747;', 'color: gray; font-style: italic;');
    }
else {
    // Ottengo il numero di soluzioni rimaste
    const solutionsText = solutionBox.querySelector('.tdbox')?.children?.item(3)?.textContent ?? '1 brani 0 brani';
    const soluzionsCount = Array.from(solutionsText.matchAll(/([0-9\.]+) brani/g))

    if(soluzionsCount.length < 2) {
        substituteText(url[1], solutionBox);
    } else {
        const [[, soluzioniUsate], [, soluzioniTotali]] = soluzionsCount;

        // Controllo se ci sono soluzioni
        if (parseInt(soluzioniUsate) > parseInt(soluzioniTotali)) {
            substituteText(url[1], solutionBox);
        } else {
            if (/^it\b/.test(navigator.language)) {
                console.log("%cHai ancora %s soluzioni disponibili su %s", 'color: #80f5ab', parseInt(soluzioniTotali) - parseInt(soluzioniUsate), soluzioniTotali);
            } else {    
                console.log("%cYou have %s solutions available on %s", 'color: #80f5ab', parseInt(soluzioniTotali) - parseInt(soluzioniUsate), soluzioniTotali);
            }
        }
    }
}

function substituteText(url: string, solutionBox: Element) {
    if (/^it\b/.test(navigator.language)) {
        console.log("%cSoluzioni terminate!", 'color: #F5AB80');
    } else {
        console.log("%cYou have reached the maximum number of solutions for today!", 'color: #F5AB80');
    }

    for(let success = false, i = 0; i <= 5 && !success; i++)
        getHTMLFromTranslate(url).then(html => {
                // Sostituisco il brano con la soluzione
                if(html) {
                    if(url.indexOf('autore') != -1) {
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