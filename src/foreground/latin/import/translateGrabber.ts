// Copyright 2021 rospino74
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

const baseUrl = 'https://www-latin-it.translate.goog/';
const getParams = '_x_tr_sl=it&_x_tr_tl=it&_x_tr_hl=it&_x_tr_pto=ajax,op,elem';

export default async function getHTMLFromTranslate(url: string): Promise<string | null> {
    // Prendo il contenuto da Google Traduttore
    const request = await fetch(baseUrl + url + (url.indexOf('?') == -1 ? '?' : '&') + getParams, {
        'credentials': 'include',
        'headers': {
            'User-Agent': UserAgent.getRandom() as string,
            'Accept': 'text/html,*/*;q=0.8',
            'Accept-Language': 'it-IT,it;q=0.8,en;q=0.3',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
        },
        'method': 'GET',
        'mode': 'cors'
    });

    if (request.status != 200) {
        return null;
    }

    // Creo un elemento template
    const template = document.createElement('template');
    template.innerHTML = await request.text();

    // Rimuovo il no copy
    const noCopyBoxes = template.content.querySelectorAll("[style*=user-select]") as NodeListOf<HTMLElement>;
    userSelectRemover(noCopyBoxes);

    // Prendo il contenuto del div con classe corpo
    const body = template.content.querySelector('div.corpo') as HTMLElement;

    // Prendo il contenuto del secondo div nel quinto elemento di body
    const content = body?.children.item(4)?.children.item(1);

    // Rimuovo url a google translate
    return content?.innerHTML?.replace(baseUrl, '') ?? null;
}
