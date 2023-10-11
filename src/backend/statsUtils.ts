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

type Statistics = {
    [key: string]: number;
};

export async function getStatistics(): Promise<Statistics> {
    // Prefer using the MV3 API if available
    let stats: { stats?: Statistics };
    if (__EXTENSION_MV3__) {
        stats = await chrome.storage.sync.get('stats');
    } else {
        stats = await new Promise((resolve) => { chrome.storage.sync.get('stats', resolve); });
    }
    return stats.stats ?? {};
}

async function setStatistic(stats: Statistics) {
    // Prefer using the MV3 API if available
    if (__EXTENSION_MV3__) {
        await chrome.storage.sync.set({ stats });
    } else {
        await new Promise<void>((resolve) => {
            chrome.storage.sync.set({ stats }, resolve);
        });
    }
}

export async function incrementStatistic(key: string) {
    const stats = await getStatistics();
    stats[key] = (stats[key] ?? 0) + 1;
    await setStatistic(stats);
}
