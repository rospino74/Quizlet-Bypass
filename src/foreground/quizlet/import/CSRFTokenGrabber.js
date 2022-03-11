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

import makeWebRequest from '../../common/makeWebRequest.ts';

export default async function getCSRFToken() {
    const headers = {
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache',
    };
    const content = await makeWebRequest('https://quizlet.com/latest', 'GET', undefined, headers);

    // Cerco il nome del token
    const [, CSRFCookieName] = content.match(/"cstokenName":"(.+?)"/i);

    // Prendo il cookie di CSRF
    return document.cookie.match(`(?:^|;)\\s*${CSRFCookieName}=([^;]*)`)[1];
}
