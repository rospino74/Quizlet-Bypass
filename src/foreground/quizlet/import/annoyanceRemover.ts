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

interface HTMLElement {
    removeAnnoyance(selector: string, hideParent: boolean): boolean;
}

HTMLElement.prototype.removeAnnoyance = function (selector: string, hideParent: boolean = true): boolean {
    try {
        const children = this.querySelectorAll<HTMLElement>(selector);
        children.forEach((e) => {
            e.style.display = 'none';

            if (e.parentElement && hideParent) {
                e.parentElement.style.display = 'none';
            }
        });
        return true;
    } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
            console.error(err);
        }
        return false;
    }
}   