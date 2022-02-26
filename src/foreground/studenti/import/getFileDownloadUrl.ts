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

export default async function getFileDownloadUrl(documentId: string): Promise<string> {
    const apiUrl = `https://doc.studenti.it/ajax/download.php`;
    const body = `k=${documentId}`;

    // Post request to get the download url
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': body.length.toString(),
        },
        body
    });

    // Watch out for http errors
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
    }

    const json = await response.json();

    // Response object
    if (process.env.NODE_ENV !== 'production') {
        console.log(json)
    }

    if (json.esito != 'OK') {
        throw new Error(`${response.status} ${response.statusText}: ${json.messaggio}`);
    }

    if (process.env.NODE_ENV !== 'production') {
        if (/^it\b/.test(navigator.language)) {
            console.log('%cIndirizzo del download: %c%s', 'color: #7ab700;', 'color: gray;', json.link);
        } else {
            console.log('%cDownload url: %c%s', 'color: #7ab700;', 'color: gray;', json.link);
        }
    }

    return json.link;
}