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

export default async function makeBackgroundWebRequest(url: string, method: 'GET' | 'POST', body?: BodyInit, headers: HeadersInit = {}): Promise<Response> {
    const defaultHeaders = {
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
    };
    const newHeaders = Object.assign({}, defaultHeaders, headers);

    if (!import.meta.env.PROD) {
        console.log('makeBackgroundWebRequest', url, method, body, newHeaders);
    }

    const request = await fetch(url, {
        credentials: 'include',
        headers: newHeaders,
        method,
        body,
        mode: 'cors'
    });

    if (!import.meta.env.PROD) {
        console.log(request);
    }

    if (!request.ok) {
        throw new Error(request.statusText);
    } else {
        return request;
    }
}