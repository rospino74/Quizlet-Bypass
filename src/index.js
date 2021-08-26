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

import deleteQuizletAccount from './scripts/content/accountDeleter';
import makeQuizletAccount from './scripts/content/accountMaker';

const consolePrefixStyles = [
    'color: #fff',
    'background-color: #4257b2',
    'padding: 4px 6px',
    'border-radius: 5px',
].join(';');

const consoleBigStyles = [
    'color: #4257b2',
    'font-size: xx-large',
].join(';');

// aspetto 2 secondi prima di iniziare
setTimeout(() => {
    // Cerco un banner con l'ultima soluzione
    const banner = document.querySelector('.BannerWrapper');

    // Nascondo il paywall
    if (banner) {
        banner.style.display = 'none';
    }

    // Verifico che il banner esista e che non abbia un figlio
    // con la classe "WithAccent"
    // eslint-disable-next-line no-undef
    if (/* !Quizlet.LOGGED_IN || */ !banner || !banner.querySelector('.WithAccent')) {
        console.log("%cSoluzioni scadute, rinnovo l'account", consoleBigStyles);

        // Notifico il background script di rinnovare i cookies
        // eslint-disable-next-line no-undef
        // chrome.runtime.sendMessage({
        //     // eslint-disable-next-line no-undef
        //     tab: chrome.tabs.getCurrent(),
        //     action: 'renew',
        // });

        // Cancello l'account corrente
        deleteQuizletAccount();

        // Rinnovo l'account
        makeQuizletAccount();

        // Copio i cookies
        // eslint-disable-next-line no-undef
        chrome.runtime.sendMessage({
        // eslint-disable-next-line no-undef
            tab: chrome.tabs.getCurrent(),
            action: 'copyCookies',
            value: document.cookie,
        });

        // Ricarico la pagina
        window.location.reload();
        // eslint-disable-next-line no-undef
        // chrome.runtime.sendMessage({
        // // eslint-disable-next-line no-undef
        //     tab: chrome.tabs.getCurrent(),
        //     action: 'refresh',
        // });

        // Avviso delle soluzioni rimanenti
    } else if (banner.querySelector('.WithAccent')) {
        const remainingSolutions = banner.querySelector('.WithAccent').innerText;
        console.log('%cQuizlet%c %s %c%s', consolePrefixStyles,
            'color: white;', 'Soluzioni Rimanenti:',
            'color: orange; font-weight: bold;', remainingSolutions);
    }
}, 2000);
