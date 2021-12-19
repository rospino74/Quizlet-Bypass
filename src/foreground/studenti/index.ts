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

console.log('%cStudenti.it %cv%s', 'color: #7ab700', 'color: gray; font-style: italic;', process.env.VERSION);

const appuntiRegex = /appunti\/[a-zA-Z0-9\-/]+\.html/gm;

// Check if the page is an appunti page
if (appuntiRegex.test(window.location.href)) {
    const nextPageId = getNextPageId();
    removeAdvertisingLink(nextPageId);

    // Remove right arrow button
    const rightArrowButtons = document.querySelectorAll(".pager ul li:last-child") as NodeListOf<HTMLLIElement>;
    rightArrowButtons.forEach(btn => btn.parentElement?.removeChild(btn));
} else {
    const relatedPageButton = document.querySelectorAll(".pager ul li a[href*=correlati]") as NodeListOf<HTMLAnchorElement>;
    relatedPageButton.forEach(btn => {
        if (process.env.NODE_ENV !== 'production') {
            if (/^it\b/.test(navigator.language)) {
                console.log("%cRimuovo l'ultimo bottone: %o", 'color: #7ab700', btn);
            } else {
                console.log("%cRemoving last button: %o", 'color: #7ab700', btn);
            }
        }

        const li = btn.parentElement;
        li?.parentElement?.removeChild(li);
    });
}

function getNextPageId(): string {
    // Grabbing the url from the button
    const nextPageUrl = (document.querySelector(".pager ul li:nth-child(2) a") as HTMLAnchorElement).href;
    const pageId = /download_2\/([a-zA-Z0-9\-]+)_1\.html/gm;

    if (process.env.NODE_ENV !== 'production') {
        if (/^it\b/.test(navigator.language)) {
            console.log('%cIndirizzo prossima pagina: %s', 'color: #7ab700', nextPageUrl);
        } else {
            console.log('%cNext page url: %s', 'color: #7ab700', nextPageUrl);
        }
    }

    return pageId.exec(nextPageUrl)!![1];
}


function removeAdvertisingLink(id: string) {
    const baseUrl = `https://doc.studenti.it/vedi_tutto/index.php?h=${id}`;

    const nextPageButton = document.querySelectorAll(".pager ul li a") as NodeListOf<HTMLAnchorElement>;
    nextPageButton.forEach(btn => {
        let pageNumber = parseInt(btn.innerText);

        if (pageNumber === 1) {
            if (process.env.NODE_ENV !== 'production') {
                if (/^it\b/.test(navigator.language)) {
                    console.log('%cSalto il primo bottone: %o', 'color: #7ab700', btn);
                } else {
                    console.log('%cSkipping first button: %o', 'color: #7ab700', btn);
                }
            }
            return;
        }

        if (process.env.NODE_ENV !== 'production') {
            if (/^it\b/.test(navigator.language)) {
                console.log("%cCambio URL %c%s %c-> %c%s", 'color: #7ab700', 'color: red;', btn.href, 'color: gray;', 'color: green;', `${baseUrl}&pag=${pageNumber - 1}`);
            } else {
                console.log("%cChanging URL %c%s %c-> %c%s", 'color: #7ab700', 'color: red;', btn.href, 'color: gray;', 'color: green;', `${baseUrl}&pag=${pageNumber - 1}`);
            }
        }
        btn.href = `${baseUrl}&pag=${pageNumber - 1}`;
    });
}
