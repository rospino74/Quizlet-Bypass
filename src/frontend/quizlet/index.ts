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

import deleteQuizletAccount from './import/accountDeleter';
import makeQuizletAccount from './import/accountMaker';
import removeAnnoyance from './import/annoyanceRemover';

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

console.log('%cQuizlet%c v%s', consolePrefixStyles, 'color: gray; font-style: italic;', __EXTENSION_VERSION__);

let banner: HTMLElement | null = null;
let notLoggedInPaywall: HTMLElement | null = null;

function handleMutation(mutation: MutationRecord | { target: Node }) {
    const target = mutation.target as HTMLElement;

    // Remove all the fake classes to detect paywalls
    const baitElement = target.querySelector('.__isAdBlockerEnabled');
    if (baitElement) {
        baitElement.className = '__isAdBlockerEnabled';
    }

    // Annoyances remover
    removeAnnoyance(target, '.BannerWrapper'); // Hiding the paywall banner
    removeAnnoyance(target, 'img[data-testid="premiumBrandingBadge-lock"]', false); // Hiding lock icons
    removeAnnoyance(target, '.AssemblyPill--plus'); // Hiding premium badges
    removeAnnoyance(target, '.AssemblyPrimaryButton--upgrade', false); // Hiding the upgrade button
    removeAnnoyance(target, '.SiteAd'); // Hiding the ad box
    removeAnnoyance(target, '[data-testid="ExplanationsLayoutSidebarAd"]'); // Sidebar ad box
    removeAnnoyance(target, '.a6gg3x6.d1kk5e8p.e5u6j0y.thpfeyv', false); // QuizletPlus popup
    removeAnnoyance(target, '#toastId-Explanations-Textbook-0', false); // Remaining solutions toast

    // Finding paywall banners
    notLoggedInPaywall = target.querySelector('.LoginWall');
    if (notLoggedInPaywall) {
        const parent = notLoggedInPaywall.parentElement;

        if (parent) {
            // Removing the social login buttons
            removeAnnoyance(parent, '.lfyx4xv', false);
        }

        // Adjust the stile of the login wall
        notLoggedInPaywall.style.maxWidth = 'unset';
        notLoggedInPaywall.style.backgroundColor = '#df1326';
        notLoggedInPaywall.style.backgroundImage = 'none';

        // Changing the paywall banner text
        const bigTitle = notLoggedInPaywall.querySelector<HTMLElement>('.t1qexa4p');
        if (bigTitle && !bigTitle.dataset.modified) {
            bigTitle.innerText = chrome.i18n.getMessage('lockedContent');

            // Creating the reload button
            const smallTitle = document.createElement('h3');
            smallTitle.innerHTML = chrome.i18n.getMessage('pressToReload', [
                '<a href="#" onclick="window.location.reload();">',
                '</a>',
            ]);
            smallTitle.style.color = 'white';
            bigTitle.parentElement?.appendChild(smallTitle);

            // Marking the element as modified to prevent infinite reading
            bigTitle.dataset.modified = 'true';
        }
    }

    // Finding the paywall banner
    banner = target.querySelector('.BannerWrapper');
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
    const accent = banner?.querySelector<HTMLElement>('.WithAccent');
    if (/* !Quizlet.LOGGED_IN || */ !banner || !accent) {
        if (__EXTENSION_DEBUG_PRINTS__) {
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

        // Check if the paywalled-section exist
        const loggedInPaywall = document.querySelector('.paywalled-section [data-testid="PayWallOverlay"]');

        // Refreshing the page to get the new account logged in
        if (notLoggedInPaywall || loggedInPaywall) {
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
    } else if (accent && __EXTENSION_DEBUG_PRINTS__) {
        const debugRemainingSolutions = accent.innerText;
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

setTimeout(loadedHandler, 250);
