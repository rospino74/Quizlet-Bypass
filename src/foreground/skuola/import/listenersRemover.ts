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

// https://stackoverflow.com/questions/19469881 & https://stackoverflow.com/a/46986927
export default function removeListenersOfType(target: EventTarget, type: string | Array<string>): void {
    if (Array.isArray(type)) {
        type.forEach((t) => removeListenersOfType(target, t));
    } else {
        // This will NOT remove the listeners, but will force the browser to ignore them
        target.addEventListener(type, (event) => {
            event.stopImmediatePropagation();
            return true;
        }, true);
    }
}
