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
            banner.parentElement.style.display = 'none';
        } catch (err) {
            if (process.env.NODE_ENV !== 'production') {
                console.error(err);
            }
        }
    }

    // Hiding lock icons
    try {
        const locks = mutation.target.querySelectorAll('img[data-testid="premiumBrandingBadge-lock"]');
        locks.forEach((e) => { e.style.display = 'none'; });
    } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
            console.error(err);
        }
    }

    // Hiding the upgrade button
    try {
        const upgradeButtons = mutation.target.querySelectorAll('.AssemblyPrimaryButton--upgrade');
        upgradeButtons.forEach((e) => { e.style.display = 'none'; });
    } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
            console.error(err);
        }
    }

    // Hiding the ad box
    try {
        const adboxes = mutation.target.querySelectorAll('.SiteAd');
        adboxes.forEach((e) => { e.parentElement.style.display = 'none'; });
    } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
            console.error(err);
        }
    }

    // Finding paywall banners
    notLoggedInPaywall = mutation.target.querySelector('.t15hde6e');

    if (notLoggedInPaywall) {
        // Cancello i bottoni social per il login
        const social = notLoggedInPaywall.parentElement.querySelector('.lfyx4xv');
        if (social) {
            social.style.display = 'none';
        }

        notLoggedInPaywall.style.maxWidth = 'unset';
        notLoggedInPaywall.parentElement.style.backgroundColor = '#df1326';
        notLoggedInPaywall.parentElement.style.backgroundImage = 'none';

        // Changing the paywall banner text
        const bigTitle = notLoggedInPaywall.querySelector('.t1qexa4p');
        const smallTitle = notLoggedInPaywall.querySelector('.ssg8684');

        bigTitle.innerText = chrome.i18n.getMessage('lockedContent');
        smallTitle.innerHtml = chrome.i18n.getMessage('pressToReload', [
            '<a href="#" onclick="window.location.reload();">',
            '</a>',
        ]);
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
