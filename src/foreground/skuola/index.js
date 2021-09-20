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
import removeListenersOfType from './import/listenersRemover.ts';

const consoleBigStyles = [
    'color: #fee300',
    'font-size: xx-large',
].join(';');

const noRightClickElement = document.querySelectorAll('[data-rightclick]');

console.log('%cSkuola Evader %cv%s', 'color: #fee300', 'color: gray; font-style: italic;', process.env.VERSION);

// Rimuovo il box
const copyWallBox = document.querySelector('#rightclick');
if (copyWallBox) {
    copyWallBox.parentElement.removeChild(copyWallBox);
}

// Permetto di usare il tasto destro del mouse
noRightClickElement.forEach((element) => {
    // Abilito il menu a tendina e cut, copy & paste
    removeListenersOfType(element, ['cut', 'copy', 'paste', 'contextmenu']);
});

console.log('%cOra puoi copiare tutti i testi che vuoi 😉', consoleBigStyles);