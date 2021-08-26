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

import Chance from 'chance';
import getCSRFToken from './CSRFTokenGrabber';

async function makeAccountCreationRequest(email) {
    const randomizer = new Chance();

    // Creo il compleanno
    const birthDay = randomizer.birthday();

    // CSRF Token per il signup
    const token = await getCSRFToken();
    console.log('CSRF Token: ', token);

    const request = await fetch('https://quizlet.com/webapi/3.2/direct-signup', {
        credentials: 'include',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0',
            Accept: 'application/json',
            'Accept-Language': 'it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3',
            'CS-Token': token,
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
            Pragma: 'no-cache',
            'Cache-Control': 'no-cache',
        },
        referrer: 'https://quizlet.com/login',
        body: `{"TOS":true,"birth_day":"${birthDay.getDate()}","birth_month":"${birthDay.getMonth()}","birth_year":"${birthDay.getFullYear()}","email":"${email}","is_free_teacher":"0","is_parent":false,"password1":"nrka6TWF86FPScH","redir":"https://quizlet.com/","signupOrigin":"signup-tab-on-login-modal","screenName":"Logout/logoutMobileSplash","username":"${randomizer.name().replaceAll(' ', '_')}_${birthDay.getFullYear()}","marketing_opt_out":true}`,
        method: 'POST',
        mode: 'cors',
    });

    return request.json();
}

export default async function makeQuizletAccount(tab) {
    const address = new Chance().email();

    // Creo un account
    const result = await makeAccountCreationRequest(address, tab);
    console.warn('Account creation result: ', result);
}
