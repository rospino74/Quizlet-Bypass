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

export default function getCSRFToken(): string {
    // Search for the CSRF token value, Throws an error if the cookie is not found. We cannot go beyond this point without it
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [, cookieValue] = document.cookie.match('(?:^|;)\\s*qtkn=([^;]*)')!;

    if (__EXTENSION_DEBUG_PRINTS__) {
        console.log('CSRF Token: ', cookieValue);
    }

    return cookieValue;
}
