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

import removeAnnoyance from './annoyanceRemover';

export function handleNotLoggedInPopup(target: HTMLElement): boolean {
    const notLoggedInPaywall = target.querySelector<HTMLElement>('.LoginWall');
    if (!notLoggedInPaywall) {
        return false;
    }

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

    return true;
}

export function handleUpgradeToQuizletPlusPopup(target: HTMLElement): boolean {
    const popup = target.querySelector<HTMLElement>('[data-testid="PayWallOverlay"]');
    if (!popup) {
        return false;
    }

    // Adjusting the popup style
    const graphicalBox = popup.querySelector<HTMLElement>('.o3dpi86.pxrylku');
    if (graphicalBox) {
        graphicalBox.style.backgroundColor = '#df1326';
        graphicalBox.style.backgroundImage = 'none';
    }

    // Removing the logo and the price tag
    removeAnnoyance(popup, '[data-testid="PremiumLogo"]', false);
    removeAnnoyance(popup, '.umrthjm', false);

    // Changing the paywall banner text
    const bigTitle = popup.querySelector<HTMLElement>('.tukvi6d');
    if (bigTitle && !bigTitle.dataset.modified) {
        bigTitle.innerText = chrome.i18n.getMessage('lockedContent');

        // Creating the reload button
        const smallTitle = popup.querySelector<HTMLElement>('.v1bik2gd');
        if (smallTitle) {
            smallTitle.innerHTML = chrome.i18n.getMessage('pressToReload', [
                '<a href="#" onclick="window.location.reload();">',
                '</a>',
            ]);
        }

        // Marking the element as modified to prevent infinite reading
        bigTitle.dataset.modified = 'true';
    }

    return true;
}
