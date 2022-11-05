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

//@ts-ignore
import deleteQuizletAccount from './import/accountDeleter';
//@ts-ignore
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

console.log('%cQuizlet%c v%s', consolePrefixStyles, 'color: gray; font-style: italic;', process.env.VERSION);

let banner: HTMLElement | null = null;
let notLoggedInPaywall: HTMLElement | null = null;

function handleMutation(mutation: MutationRecord) {
    const target = mutation.target as HTMLElement;
    banner = target.querySelector('.BannerWrapper');

    // Hiding the paywall banner
    removeAnnoyance(target, '.BannerWrapper');

    // Hiding lock icons
    removeAnnoyance(target, 'img[data-testid="premiumBrandingBadge-lock"]', false);

    // Hiding premium badges
    removeAnnoyance(target, '.AssemblyPill--plus');

    // Hiding the upgrade button
    removeAnnoyance(target, '.AssemblyPrimaryButton--upgrade', false);

    // Hiding the ad box
    removeAnnoyance(target, '.SiteAd');

    // QuizletPlus popup
    removeAnnoyance(target, '.a6gg3x6.d1kk5e8p.e5u6j0y.thpfeyv', false);

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
}

// remove banner/paywalls on creation
const observer = new MutationObserver((mutationList) => {
    mutationList.forEach(handleMutation);
});

// Start observing
observer.observe(document, { childList: true, subtree: true });

// check once at load
//@ts-ignore
handleMutation({ target: document });

// check paywall when main document has loaded
async function loadedHandler() {
    // Verifico che il banner esista e che non abbia un figlio
    // con la classe "WithAccent"
    const accent = banner?.querySelector<HTMLElement>('.WithAccent');
    if (/* !Quizlet.LOGGED_IN || */ !banner || !accent) {
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
    } else if (accent && process.env.NODE_ENV !== 'production') {
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
