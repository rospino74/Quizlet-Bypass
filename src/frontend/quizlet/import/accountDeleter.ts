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

import getCSRFToken from './CSRFTokenGrabber';
import makeWebRequest from '../../common/makeWebRequest';

export default async function deleteQuizletAccount() {
    const CSRFToken = await getCSRFToken();

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache',
    };
    const body = `doDelete=&cstoken=${CSRFToken}&cstokenV2=${CSRFToken}&cstokenFieldCount=1&cstokenSetByJs=1`;

    return makeWebRequest('https://quizlet.com/delete-account', 'POST', body, headers);
}
