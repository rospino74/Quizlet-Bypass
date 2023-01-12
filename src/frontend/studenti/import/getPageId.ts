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

export default async function getPageId(): Promise<string> {
    const id = getIdFromNextButton() ?? getIdFromCurrentLocation() ?? await getIdFromDownloadButton();
    if (!id) {
        throw new Error(chrome.i18n.getMessage('debugNoStudentiPageId'));
    }
    return id;
}

function getIdFromNextButton(): string | undefined {
    // Grabbing the url from the button
    const nextPageUrl = document.querySelector<HTMLAnchorElement>(".pager ul li:nth-child(2) a")?.href;

    // If the url is not present, return null
    if (!nextPageUrl) {
        return undefined;
    }

    // Log the url to the console
    if (!import.meta.env.PROD) {
        console.log(chrome.i18n.getMessage('debugNextPageAddress'), 'color: #7ab700;', nextPageUrl);
    }

    // Extract the page id from the url
    const pageIdRegex = /download(_2)?\/([\w\-]+)_1\.html/gm;
    return pageIdRegex.exec(nextPageUrl)?.[2];
}

function getIdFromCurrentLocation(): string | null {
    // Extract the page id from the url
    const urlPageIdRegex = /\?h=([a-zA-Z0-9\-]+)/gm;
    return urlPageIdRegex.exec(window.location.href)?.[1] ?? null;
}

async function getIdFromDownloadButton(): Promise<string | null> {
    // Grabbing the url from the button
    const downloadButton = document.querySelector<HTMLAnchorElement>("a.download-doc");

    // If the button is not present, return null
    if (!downloadButton) {
        return null;
    }

    const downloadURL = downloadButton.href;

    // Log the url to the console
    if (!import.meta.env.PROD) {
        console.log(chrome.i18n.getMessage('debugNextPageAddress'), 'color: #7ab700;', downloadURL);
    }

    try {
        // Fetch the page and analyze it with the template element
        const response = await fetch(downloadURL);
        const text = await response.text();
        const template = document.createElement('template');
        template.innerHTML = text;

        // Extract the page id from the url
        const link = template.content.querySelector<HTMLAnchorElement>(".continua-link");

        // If the a tag is not present, return null
        if (!link) {
            return null;
        }

        return link.getAttribute("onclick")?.split("'")[1] ?? null;
    } catch (error) {
        console.error(chrome.i18n.getMessage('fetchError'), 'color: #ff0000;', error);
        return null;
    }
}