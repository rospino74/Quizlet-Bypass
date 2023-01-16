// Copyright 2021-2023 rospino74 and contributors
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

export default function userSelectRemover(element: HTMLElement | NodeListOf<HTMLElement>): void {
    if (element instanceof NodeList) {
        element.forEach(remove);
    } else {
        remove(element);
    }
}

function remove(element: HTMLElement): void {
    // Proprietà non standard
    try {
        /// @ts-ignore
        element.style.MozUserSelect = 'text';
        /// @ts-ignore
        element.style.WebkitUserSelect = 'text';
    } catch { }

    // Proprietà standard
    element.style.userSelect = 'text';
}
