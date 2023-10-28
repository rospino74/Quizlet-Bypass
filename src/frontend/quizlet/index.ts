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

// import deleteQuizletAccount from './import/accountDeleter';
import makeQuizletAccount from './import/accountMaker';
import removeAnnoyance from './import/annoyanceRemover';
import { handleNotLoggedInPopup, handleUpgradeToQuizletPlusPopup } from './import/popups';

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

async function performAccountCreation() {
    if (__EXTENSION_DEBUG_PRINTS__) {
        console.log(
            '%c%s',
            consoleBigStyles,
            chrome.i18n.getMessage('debugExpiredSolutions'),
        );
    }

    // Remove the old account
    // deleteQuizletAccount();

    // Create a new Quizlet account
    await makeQuizletAccount();

    // Copy the account auth cookies
    chrome.runtime.sendMessage({
        action: 'copyCookies',
        value: document.cookie,
    });

    // Check if the paywalled-section exist{
    if (handleNotLoggedInPopup(document.body) || handleUpgradeToQuizletPlusPopup(document.body)) {
        chrome.runtime.sendMessage({
            action: 'refresh',
        });
    }

    // Increases the statistics counter
    chrome.runtime.sendMessage({
        action: 'incrementStats',
        value: 'accounts_created',
    });
}

function handleMutation(mutation: MutationRecord | { target: Node }) {
    const target = mutation.target as HTMLElement;

    // Remove all the fake classes to detect paywalls
    const baitElement = target.querySelector('.__isAdBlockerEnabled');
    if (baitElement) {
        baitElement.className = '__isAdBlockerEnabled';
    }

    // Annoyances remover
    removeAnnoyance(target, '#onetrust-banner-sdk'); // Cookie popup
    removeAnnoyance(target, '.BannerWrapper'); // Hiding the paywall banner
    removeAnnoyance(target, 'img[data-testid="premiumBrandingBadge-lock"]', false); // Hiding lock icons
    removeAnnoyance(target, '.AssemblyPill--plus'); // Hiding premium badges
    removeAnnoyance(target, '.AssemblyPrimaryButton--upgrade', false); // Hiding the upgrade button
    removeAnnoyance(target, '.SiteAd'); // Hiding the ad box
    removeAnnoyance(target, '[data-testid="ExplanationsLayoutSidebarAd"]'); // Sidebar ad box
    removeAnnoyance(target, '.a6gg3x6.d1kk5e8p.e5u6j0y.thpfeyv', false); // QuizletPlus popup
    removeAnnoyance(target, '#toastId-Explanations-Textbook-0', false); // Remaining solutions toast
    removeAnnoyance(target, '.mnlifen.o1cv2anc.l6ngt95'); // Confirm email popup
    removeAnnoyance(target, '#toastId-confirmEmailPrompt-0'); // Confirm email toast

    // Enable scrolling on body
    document.querySelectorAll<HTMLElement>('.b1yw38c3').forEach(e => {
        e.classList.remove('b1yw38c3');
    });
}

// remove banner/paywalls on creation
const observer = new MutationObserver((mutationList) => {
    mutationList.forEach(handleMutation);
});

// Start observing
observer.observe(document, { childList: true, subtree: true });

// check once at load
handleMutation({ target: document });

// store url on load
let currentPage = window.location.href;
setInterval(() => {
    if (currentPage === window.location.href) {
        return;
    }

    performAccountCreation();

    currentPage = window.location.href;
}, 1000);

performAccountCreation();
