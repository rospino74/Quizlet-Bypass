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

import Chance from 'chance';
import getCSRFToken from './CSRFTokenGrabber.ts';
import makeWebRequest from '../../common/makeWebRequest.ts';

async function makeAccountCreationRequest(email) {
    const randomizer = new Chance();

    // Creo il compleanno
    const birthDay = randomizer.birthday();

    // CSRF Token per il signup
    const token = await getCSRFToken();

    if (!import.meta.env.PROD) {
        console.log('CSRF Token: ', token);
    }

    const headers = {
        Accept: 'application/json',
        'CS-Token': token,
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache',
    };

    const body = {
        TOS: true,
        birth_day: birthDay.getDate(),
        birth_month: birthDay.getMonth(),
        birth_year: birthDay.getFullYear(),
        email,
        is_free_teacher: '0',
        is_parent: false,
        password1: 'nrka6TWF86FPScH',
        redir: 'https://quizlet.com/',
        signupOrigin: 'signup-tab-on-login-modal',
        screenName: 'Logout/logoutMobileSplash',
        username: `${randomizer.name().replaceAll(' ', '_').slice(0, 15)}_${birthDay.getFullYear()}`,
        marketing_opt_out: true,
    };

    const content = await makeWebRequest('https://quizlet.com/webapi/3.2/direct-signup', 'POST', JSON.stringify(body), headers);

    return JSON.parse(content);
}

export default async function makeQuizletAccount() {
    const address = new Chance().email();

    // Creo un account
    const result = await makeAccountCreationRequest(address);

    if (!import.meta.env.PROD) {
        console.log(
            chrome.i18n.getMessage('debugAccountCreationResult'),
            result,
        );
    }
}
