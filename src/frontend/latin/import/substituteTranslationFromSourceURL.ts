// Copyright 2021-2023 rospino74 and contributors
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import UserAgent from 'random-useragent';
import { makeWebRequest } from '../../common/makeWebRequest';

const latinBaseUrl = 'https://www.latin.it';

function getTranslationUrlFromHTML(html: string): string | undefined {
    const template = document.createElement('template');
    template.innerHTML = html;

    // We obtain the script tag that contains the translation
    const sourceScriptTag = template.content.querySelector<HTMLScriptElement>('script[src*="ajax_traduzione_versione.js.php"]');
    const functionCallerScriptTag = template.content.querySelector<HTMLScriptElement>('script[src*="ajax_traduzione_versione.js.php"] + script + script');

    // If the script tag is not found, we return undefined
    if (!sourceScriptTag) {
        return undefined;
    }

    // Then we extract the r get parameter from the script tag src
    const scriptURL = new URL(sourceScriptTag.src, latinBaseUrl);
    const r = scriptURL.searchParams.get('r');

    // Now we just need to get the translation id from the function caller script tag
    const functionCalleParamRegex = /traduzione\([\d]+, ?([\d]+)\)/i;
    const secondParametersOfFunctionCaller = functionCallerScriptTag?.innerHTML?.match(functionCalleParamRegex)?.[1];

    if (!r || !secondParametersOfFunctionCaller) {
        return undefined;
    }

    // Now we just return the url to get the translation html
    return `${latinBaseUrl}/ajax_traduzione_versione.php?id=${secondParametersOfFunctionCaller}&r=${r}`;
}

async function getPageWithBaseAndParams(base: string, path: string, params = ''): Promise<string | undefined> {
    let url = `${base}/${path}`;
    if (params) {
        url += (path.indexOf('?') !== -1 ? '&' : '?') + params;
    }

    const headers = {
        'User-Agent': UserAgent.getRandom(),
        'Cache-Control': 'max-age=0',
        Pragma: 'no-cache',
    };
    const html = await makeWebRequest(url, 'GET', undefined, headers, false);
    const translationURL = getTranslationUrlFromHTML(html);

    if (!translationURL) {
        return undefined;
    }

    return makeWebRequest(translationURL, 'GET', undefined, headers);
}

export default async function substituteTranslationFromSourceURL(textSourceURL: string, destinationBoxElement: HTMLElement): Promise<boolean> {
    if (__EXTENSION_DEBUG_PRINTS__) {
        console.log(chrome.i18n.getMessage('debugExpiredSolutionsLatin'), 'color: #F5AB80');
    }

    try {
        const html = await getPageWithBaseAndParams(latinBaseUrl, textSourceURL);
        if (!html) {
            return false;
        }

        destinationBoxElement.innerHTML = html;
        return true;
    } catch (e) {
        if (__EXTENSION_DEBUG_PRINTS__) {
            console.log(chrome.i18n.getMessage('fetchError'), 'color: #F5AB80', e);
        }

        return false;
    }
}
