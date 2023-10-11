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

export function makeWebRequest(url: string, method: 'GET' | 'POST', body?: BodyInit, headers?: HeadersInit, sendCredentials = true): Promise<string> {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            action: 'makeWebRequest',
            value: {
                url,
                method,
                body,
                headers,
                sendCredentials,
            },
        }, (response: { text: string, error: boolean}) => {
            if (__EXTENSION_DEBUG_PRINTS__) {
                console.log(
                    chrome.i18n.getMessage('debugWebRequestResponse'),
                    'color: #ff9900',
                    'color: gray',
                    response,
                );
            }

            if (response.error) {
                reject(response.text);
            } else {
                resolve(response.text);
            }
        });
    });
}

export async function makeJsonWebRequest(url: string, method: 'GET' | 'POST', body?: BodyInit, headers?: HeadersInit, sendCredentials = true): Promise<object> {
    const response = await makeWebRequest(url, method, body, headers, sendCredentials);
    try {
        return JSON.parse(response);
    } catch (e) {
        throw new Error(`Invalid JSON response: ${response}`);
    }
}
