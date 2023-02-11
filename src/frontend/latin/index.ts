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

import substituteText from './import/substituteTranslationFromSourceURL';
import userSelectRemover from './import/userSelectRemover';

console.log('%cSplash Latino Evader %cv%s', 'color: #009dd9;', 'color: gray; font-style: italic;', __EXTENSION_VERSION__);

const solutionBox = document.querySelector<HTMLDivElement>('div.corpo > :nth-child(5) > :nth-child(2)');

// match latin.it urls
const url = /https?:\/\/www\.latin\.it\/([^\s]+)/g.exec(window.location.href)?.[1];

if (!url || !solutionBox) {
    if (__EXTENSION_DEBUG_PRINTS__) {
        console.log(chrome.i18n.getMessage('debugNotLoadedOnAValidPage'), 'color: #f04747;', 'color: gray; font-style: italic;');
    }
} else {
    // Getting the count of the remaining solutions
    let solutionsTextElement = solutionBox.querySelector('.tdbox > :nth-child(4)') ?? solutionBox.querySelector('div[style*="color: #000 !important;"]');
    let solutionsText = solutionsTextElement?.textContent ?? '1 brani 0 brani';

    const soluzionsCount = [...solutionsText.matchAll(/([0-9.]+) brani/g)];

    if (soluzionsCount.length < 2) {
        substituteText(url, solutionBox);
    } else {
        const maxNumberOfSolutions = parseInt(soluzionsCount[1][1], 10);

        // Checking if we still have solutions available
        if (maxNumberOfSolutions < 5) {
            substituteText(url, solutionBox);
        } else if (__EXTENSION_DEBUG_PRINTS__) {
            console.log(`%c${chrome.i18n.getMessage('debugRemainingSolutions')}`, 'color: #80f5ab', maxNumberOfSolutions);
        }
    }
}

userSelectRemover(document.querySelectorAll('[style*=user-select]'));
