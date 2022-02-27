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

try {
    const counterValue = document.querySelector<HTMLElement>(".counter-value")!!;
    const counterSubtitle = document.querySelector<HTMLElement>(".counter-subtitle")!!;

    // Sets the counter subtitle based on the current language
    if (/^it\b/.test(navigator.language)) {
        counterSubtitle.textContent = "Paywall evitati";
    } else {
        counterSubtitle.textContent = "Avoided paywalls";
    }

    // Sets the counter value
    const count = localStorage.getItem("stats.accounts_created") || "0";
    counterValue.innerText = count;
} catch (e) {
    console.error(e);
}