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

import getCSRFToken from './CSRFTokenGrabber';

export default async function deleteQuizletAccount() {
    const CSRFToken = await getCSRFToken();

    return fetch('https://quizlet.com/delete-account', {
        credentials: 'include',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Upgrade-Insecure-Requests': '1',
            Pragma: 'no-cache',
            'Cache-Control': 'no-cache',
        },
        referrer: 'https://quizlet.com/delete-account',
        body: `doDelete=&cstoken=${CSRFToken}&cstokenV2=${CSRFToken}&cstokenFieldCount=1&cstokenSetByJs=1`,
        method: 'POST',
        mode: 'cors',
    });
}
