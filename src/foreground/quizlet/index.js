// Copyright 2021-2022 rospino74 and contributors
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

import deleteQuizletAccount from './import/accountDeleter';
import makeQuizletAccount from './import/accountMaker';

const consolePrefixStyles = [
    'color: #fff',
    'background-color: #4255ff',
    'padding: 4px 6px',
    'border-radius: 5px',
].join(';');

const consoleBigStyles = [
    'color: #4255ff',
    'font-size: xx-large',
].join(';');

console.log('%cQuizlet%c v%s', consolePrefixStyles, 'color: gray; font-style: italic;', process.env.VERSION);

let banner = null;
let notLoggedInPaywall = null;

function handleMutation(mutation) {
    banner = mutation.target.querySelector('.BannerWrapper');
    if (banner) {
        try {
            banner.parentElement.remove();
            mutation.target.querySelector('img[data-testid="premiumBrandingBadge-lock"]').remove();
        } catch (err) {
            if (process.env.NODE_ENV !== 'production') {
                console.error(err);
            }
        }
    }

    try {
        const upgradeButtons = mutation.target.querySelectorAll('.AssemblyPrimaryButton--upgrade');
        upgradeButtons.forEach((e) => e.remove());
    } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
            console.error(err);
        }
    }

    // Finding paywall banners
    notLoggedInPaywall = mutation.target.querySelector('.t15hde6e');

    if (notLoggedInPaywall) {
        // Cancello i bottoni social per il login
        notLoggedInPaywall.parentElement.removeChild(
            notLoggedInPaywall.parentElement.querySelector('.lfyx4xv'),
        );

        // Aggiorno lo stile
        notLoggedInPaywall.style.maxWidth = 'unset';
        notLoggedInPaywall.parentElement.style.backgroundColor = '#df1326';
        notLoggedInPaywall.parentElement.style.backgroundImage = 'none';

        // Cambio il testo nel paywall
        const bigTitle = notLoggedInPaywall.querySelector('.t1qexa4p');
        const smallTitle = notLoggedInPaywall.querySelector('.ssg8684');

        // Se lingua del browser è l'Italiano cambio il testo
        if (/^it\b/.test(navigator.language)) {
            bigTitle.innerText = 'Questo contenuto è bloccato ancora per poco.';
            smallTitle.innerHTML = '<a href=# onclick=document.location.reload()>Aggiorna la pagina</a> per visualizzare la soluzione completa.';
        } else {
            bigTitle.innerText = 'This content will be unlocked in no time.';
            smallTitle.innerHTML = 'All you have to do is <a href=# onclick=document.location.reload()>reload the page</a>';
        }
    }
}

// remove banner/paywalls on creation
const observer = new MutationObserver((mutationList) => {
    mutationList.forEach(handleMutation);
});

// Start observing
observer.observe(document, { childList: true, subtree: true });
// stop observing
setTimeout(observer.disconnect, 1500);

// check once at load
handleMutation({ target: document });

// check paywall when main document has loaded
async function loadedHandler() {
    // Verifico che il banner esista e che non abbia un figlio
    // con la classe "WithAccent"
    if (/* !Quizlet.LOGGED_IN || */ !banner || !banner.querySelector('.WithAccent')) {
        if (process.env.NODE_ENV !== 'production') {
            if (/^it\b/.test(navigator.language)) {
                console.log("%cSoluzioni scadute, rinnovo l'account", consoleBigStyles);
            } else {
                console.log("%cThe free solutions have expired, I'm renewing the account", consoleBigStyles);
            }
        }

        // Removing the old account
        deleteQuizletAccount();

        // Creating a new Quizlet account
        await makeQuizletAccount();

        // Copying the account auth cookies

        chrome.runtime.sendMessage({
            action: 'copyCookies',
            value: document.cookie,
        });

        // Refreshing the page to get the new account logged in
        if (notLoggedInPaywall) {
            chrome.runtime.sendMessage({
                action: 'refresh',
            });
        }

        // Warning about remaining solutions
    } else if (banner.querySelector('.WithAccent') && process.env.NODE_ENV !== 'production') {
        const remainingSolutions = banner.querySelector('.WithAccent').innerText;
        const text = (/^it\b/.test(navigator.language)) ? 'Soluzioni Rimanenti:' : 'Remaining Solutions:';
        console.log(
            '%cQuizlet%c %s %c%s',
            consolePrefixStyles,
            'color: white;',
            text,
            'color: orange; font-weight: bold;',
            remainingSolutions,
        );
    }
}

setTimeout(loadedHandler, 1000);
