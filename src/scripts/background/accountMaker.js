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

async function getCSRFToken(tab) {
    // Faccio una richiesta a https://quizlet.com/login e ricerco le regex
    let CSRFCookieName = '';

    // eslint-disable-next-line no-undef
    chrome.tabs.sendMessage(tab, { action: 'getCSRFToken' });

    // Ottengo il nome del cookie
    CSRFCookieName = await new Promise((resolve) => {
        // eslint-disable-next-line no-undef
        chrome.runtime.onMessage.addListener((message) => {
            if (message.action === 'setCSRFToken') {
                resolve(message.value);
            }
        });
    });

    // Prendo il valore via chrome.tabs
    // eslint-disable-next-line no-undef
    return chrome.cookie.get({
        url: 'quizlet.com/',
        name: CSRFCookieName,
    });
}

async function makeAccountCreationRequest(email, tab) {
    const randomizer = new Chance();

    // Creo il compleanno
    const birthDay = randomizer.birthday();

    // CSRF Token per il signup
    const token = await getCSRFToken(tab);
    console.log('CSRF Token: ', token);

    let response = null;
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
    // Only run if the request is complete
        if (xhr.readyState !== 4) return;

        // Controllo che sia valida la risposta
        if (xhr.status >= 200 && xhr.status < 300) {
            // What do when the request is successful
            response = JSON.parse(xhr.responseText);
        } else {
            console.log('Richesta registrazione fallita:', xhr);
        }
    };

    xhr.withCredentials = true;
    xhr.open('POST', 'https://quizlet.com/webapi/3.2/direct-signup');

    xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('CS-Token', token);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Pragma', 'no-cache');
    xhr.setRequestHeader('Cache-Control', 'no-cache');

    xhr.send(`{"TOS":true,"birth_day":"${birthDay.getDate()}","birth_month":"${birthDay.getMonth()}","birth_year":"${birthDay.getFullYear()}","email":"${email}","is_free_teacher":"0","is_parent":false,"password1":"nrka6TWF86FPScH","redir":"https://quizlet.com/goodbye","signupOrigin":"signup-tab-on-login-modal","screenName":"Logout/logoutMobileSplash","username":"${randomizer.name().replaceAll(' ', '_')}","marketing_opt_out":true}`);

    // Aspetto che la richiesta venga esaudita
    for (let i = 0; (i < 25) && !response; i++) {
    // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return response;
}

export default async function makeQuizletAccount(tab) {
    const address = new Chance().email();

    // Creo un account
    const result = await makeAccountCreationRequest(address, tab);
    console.warn('Account creation result: ', result);
    console.warn('Account cookies: ', result);
}
