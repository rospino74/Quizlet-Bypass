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

import { makeJsonWebRequest } from '../../common/makeWebRequest';

export default async function getFileDownloadUrl(documentId: string): Promise<string> {
    // Post request to get the download url
    const body = `k=${documentId}`;
    const response = await makeJsonWebRequest('https://doc.studenti.it/ajax/download.php', 'POST', body, {
        'Content-Type': 'application/x-www-form-urlencoded',
    });

    // Response object
    if (__EXTENSION_DEBUG_PRINTS__) {
        console.log(response);
    }
    const { esito, messaggio, link } = response;

    if (esito !== 'OK') {
        throw new Error(`API Error: ${messaggio}`);
    }

    if (__EXTENSION_DEBUG_PRINTS__) {
        console.log(chrome.i18n.getMessage('debugDownloadURL'), 'color: #7ab700;', 'color: gray;', link);
    }

    return link;
}
