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

import substituteTranslationFromSourceURL from './import/substituteTranslationFromSourceURL';
import userSelectRemover from './import/userSelectRemover';

console.log('%cSplash Latino Evader %cv%s', 'color: #009dd9;', 'color: gray; font-style: italic;', __EXTENSION_VERSION__);

const solutionBox = document.querySelector<HTMLDivElement>('div.corpo > :nth-child(5) > :nth-child(2)');
const translationBox = solutionBox?.querySelector<HTMLDivElement>('#traduzione1') ?? solutionBox?.querySelector<HTMLDivElement>('div:nth-child(1) > div:nth-child(6)');

// match latin.it urls
const url = /https?:\/\/www\.latin\.it\/([^\s]+)/g.exec(window.location.href)?.[1];

if (!url || !solutionBox || !translationBox) {
    if (__EXTENSION_DEBUG_PRINTS__) {
        console.log(chrome.i18n.getMessage('debugNotLoadedOnAValidPage'), 'color: #f04747;', 'color: gray; font-style: italic;');
    }
} else {
    // Getting the count of the remaining solutions
    const remainingSolutionsTextElement = solutionBox.querySelector('.tdbox > :nth-child(4)') ?? solutionBox.querySelector('div[style*="color: #000 !important;"]');
    const remainingSolutionsText = remainingSolutionsTextElement?.textContent ?? '1 brani 0 brani';
    const remainingSolutionsCount = [...remainingSolutionsText.matchAll(/([0-9.]+) brani/g)];

    const replaceTextOrPrintError = async () => {
        if (!await substituteTranslationFromSourceURL(url, translationBox) && remainingSolutionsTextElement) {
            const span = document.createElement('span');
            span.style.color = '#f04747';
            span.textContent = chrome.i18n.getMessage('latinErrorWhenFetchingTranslation');
            remainingSolutionsTextElement.appendChild(span);
        }
    };

    if (remainingSolutionsCount.length < 2) {
        replaceTextOrPrintError();
    } else {
        const maxNumberOfSolutions = parseInt(remainingSolutionsCount[1][1], 10);

        // Checking if we still have solutions available
        if (maxNumberOfSolutions < 5) {
            replaceTextOrPrintError();
        } else if (__EXTENSION_DEBUG_PRINTS__) {
            console.log(`%c${chrome.i18n.getMessage('debugRemainingSolutions')}`, 'color: #80f5ab', maxNumberOfSolutions);
        }
    }
}

userSelectRemover(document.querySelectorAll('[style*=user-select]'));
