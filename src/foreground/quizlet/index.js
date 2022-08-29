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
import './import/annoyanceRemover.ts';

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

    // Hiding the paywall banner
    mutation.target.removeAnnoyance('.BannerWrapper');

    // Hiding lock icons
    mutation.target.removeAnnoyance('img[data-testid="premiumBrandingBadge-lock"]', false);

    // Hiding premium badges
    mutation.target.removeAnnoyance('.AssemblyPill--plus');

    // Hiding the upgrade button
    mutation.target.removeAnnoyance('.AssemblyPrimaryButton--upgrade', false);

    // Hiding the ad box
    mutation.target.removeAnnoyance('.SiteAd');

    // QuizletPlus popup
    mutation.target.removeAnnoyance('.a6gg3x6.d1kk5e8p.e5u6j0y.thpfeyv', false);

    // Finding paywall banners
    notLoggedInPaywall = mutation.target.querySelector('.LoginWall');

    if (notLoggedInPaywall) {
        // Removing the social login buttons
        notLoggedInPaywall.parentElement.removeAnnoyance('.lfyx4xv', false);

        // Adjust the stile of the login wall
        notLoggedInPaywall.style.maxWidth = 'unset';
        notLoggedInPaywall.parentElement.style.backgroundColor = '#df1326';
        notLoggedInPaywall.parentElement.style.backgroundImage = 'none';

        // Changing the paywall banner text
        const bigTitle = notLoggedInPaywall.querySelector('.t1qexa4p');
        if (bigTitle) { bigTitle.innerText = chrome.i18n.getMessage('lockedContent'); }

        const smallTitle = notLoggedInPaywall.querySelector('.ssg8684');
        if (smallTitle) {
            smallTitle.innerHtml = chrome.i18n.getMessage('pressToReload', [
                '<a href="#" onclick="window.location.reload();">',
                '</a>',
            ]);
        }
    }
}

// remove banner/paywalls on creation
const observer = new MutationObserver((mutationList) => {
    mutationList.forEach(handleMutation);
});

// Start observing
observer.observe(document, { childList: true, subtree: true });

// check once at load
handleMutation({ target: document });

// check paywall when main document has loaded
async function loadedHandler() {
    // Verifico che il banner esista e che non abbia un figlio
    // con la classe "WithAccent"
    if (/* !Quizlet.LOGGED_IN || */ !banner || !banner.querySelector('.WithAccent')) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(
                '%c%s',
                consoleBigStyles,
                chrome.i18n.getMessage('debugExpiredSolutions'),
            );
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

        // Increases the statistics counter
        chrome.runtime.sendMessage({
            action: 'incrementStats',
            value: 'accounts_created',
        });

        // Warning about remaining solutions
    } else if (banner.querySelector('.WithAccent') && process.env.NODE_ENV !== 'production') {
        const debugRemainingSolutions = banner.querySelector('.WithAccent').innerText;
        console.log(
            '%cQuizlet%c %s %c%s',
            consolePrefixStyles,
            'color: white;',
            chrome.i18n.getMessage('debugRemainingSolutions'),
            'color: orange; font-weight: bold;',
            debugRemainingSolutions,
        );
    }
}

setTimeout(loadedHandler, 1000);
