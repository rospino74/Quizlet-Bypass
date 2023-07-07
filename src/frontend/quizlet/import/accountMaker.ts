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

import Chance from 'chance';
import getCSRFToken from './CSRFTokenGrabber';
import { makeJsonWebRequest } from '../../common/makeWebRequest';

const chance = new Chance();

export default async () => {
    // Account details
    const name = chance.name();
    const birthday = chance.birthday();
    const username = `${name.replaceAll(' ', '_').slice(0, 15)}_${birthday.getFullYear()}`;
    const email = `${username}@gmail.com`;

    // Create the account
    const body = JSON.stringify({
        TOS: true,
        birth_day: birthday.getDate(),
        birth_month: birthday.getMonth(),
        birth_year: birthday.getFullYear(),
        email,
        is_free_teacher: '0',
        is_parent: false,
        password1: 'nrka6TWF86FPScH',
        username,
        marketing_opt_out: true,
    });

    const content = await makeJsonWebRequest('https://quizlet.com/webapi/3.2/direct-signup', 'POST', body, {
        'CS-Token': await getCSRFToken(),
        'Content-Type': 'application/json',
    });

    if (__EXTENSION_DEBUG_PRINTS__) {
        console.log(
            chrome.i18n.getMessage('debugAccountCreationResult'),
            content,
        );
    }
};
