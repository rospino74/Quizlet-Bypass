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
import userSelectRemover from './userSelectRemover';
import { makeWebRequest } from '../../common/makeWebRequest';

const latinBaseUrl = 'https://www.latin.it/';
const googleBaseUrl = 'https://www-latin-it.translate.goog/';

function purifyHTML(html: string): string | undefined {
    const template = document.createElement('template');
    template.innerHTML = html;

    // User select remover
    const noCopyBoxes = template.content.querySelectorAll<HTMLElement>('[style*=user-select]');
    userSelectRemover(noCopyBoxes);

    // Scrape text from the second div ind the fifth child of the div with class 'corpo'
    const body = template.content.querySelector<HTMLDivElement>('div.corpo > :nth-child(5) > div:nth-child(2)');
    const content = body?.innerHTML;

    // Replace the google url with the original url
    return content?.replace(googleBaseUrl, latinBaseUrl);
}

async function getPageWithBaseAndParams(base: string, path: string, params = ''): Promise<string | undefined> {
    let url = base + path;
    if (params) {
        url += (path.indexOf('?') !== -1 ? '&' : '?') + params;
    }

    const headers = {
        'User-Agent': UserAgent.getRandom(),
        'Cache-Control': 'max-age=0',
        Pragma: 'no-cache',
    };
    const html = await makeWebRequest(url, 'GET', undefined, headers, false);
    return purifyHTML(html);
}

export default async function getHTMLFromTranslate(url: string): Promise<string | undefined> {
    // Google translate params
    const getParams = {
        '_x_tr_sl': 'it',
        '_x_tr_tl': 'it',
        '_x_tr_hl': 'it',
        '_x_tr_pto': 'ajax,op,elem'
    };
    const getParamsUrl = Object.entries(getParams).map(([k, v]) => `${k}=${v}`).join('&');
    return getPageWithBaseAndParams(googleBaseUrl, url, getParamsUrl);
}

