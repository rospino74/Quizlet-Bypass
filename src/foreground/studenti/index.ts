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

import getPageId from "./import/getPageId";
import getFileDownloadUrl from "./import/getFileDownloadUrl";

console.log('%cStudenti.it %cv%s', 'color: #7ab700;', 'color: gray; font-style: italic;', process.env.VERSION);

const appuntiRegex = /appunti\/[a-zA-Z0-9\-/]+\.html/gm;

const pageIdPromise = getPageId();
pageIdPromise.then(patchDownloadLink);

// Check if the page is an appunti page
if (appuntiRegex.test(window.location.href)) {
    pageIdPromise.then(removeAdvertisingLink);

    // Remove right arrow button
    const rightArrowButtons = document.querySelectorAll<HTMLLIElement>(".pager ul li:last-child");
    rightArrowButtons.forEach(btn => btn.parentElement?.removeChild(btn));
} else {
    const relatedPageButton = document.querySelectorAll<HTMLAnchorElement>(".pager ul li a[href*=correlati]");
    relatedPageButton.forEach(btn => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(chrome.i18n.getMessage('debugRemovingLastButton'), 'color: #7ab700', btn);
        }

        const li = btn.parentElement;
        li?.parentElement?.removeChild(li);
    });

    // Modifing the total count of pages
    const totalPageCounters = document.querySelectorAll<HTMLElement>(".pager span b:nth-child(2)");
    if (totalPageCounters) {
        totalPageCounters.forEach(counter => {
            const currentPageCount = parseInt(counter.innerText) - 1;
            counter.innerText = currentPageCount.toString();
        });
    }
}

function patchDownloadLink(pageId: string) {
    // Gets the download button
    const downloadButton = document.querySelector<HTMLAnchorElement>("a.download-doc");
    if (downloadButton) {
        downloadButton.href = '#';
        downloadButton?.addEventListener('click', (evt) => {
            evt.preventDefault();

            if (process.env.NODE_ENV !== 'production') {
                console.log(chrome.i18n.getMessage('debugAskForURL'), 'color: #7ab700;');
            }

            getFileDownloadUrl(pageId).then(url => {
                // Open the url
                window.location.href = url;
            });
        });
    }
}

function removeAdvertisingLink(id: string) {
    const baseUrl = `https://doc.studenti.it/vedi_tutto/index.php?h=${id}`;

    const nextPageButton = document.querySelectorAll<HTMLAnchorElement>(".pager ul li a");
    nextPageButton.forEach(btn => {
        let pageNumber = parseInt(btn.innerText);

        if (pageNumber === 1) {
            if (process.env.NODE_ENV !== 'production') {
                console.log(chrome.i18n.getMessage('debugSkippingFirstButton'), 'color: #7ab700', btn);
            }
            return;
        }

        if (process.env.NODE_ENV !== 'production') {
            console.log(chrome.i18n.getMessage('debugChangingButtonURL'), 'color: #7ab700;', 'color: red;', btn.href, 'color: gray;', 'color: green;', `${baseUrl}&pag=${pageNumber - 1}`);
        }
        btn.href = `${baseUrl}&pag=${pageNumber - 1}`;
    });
}
