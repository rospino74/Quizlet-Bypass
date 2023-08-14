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

import { readdirSync } from 'fs';
import { resolve } from 'path';
import pkg from '../package.json';

// Helper type
type Manifest = chrome.runtime.ManifestV2 | chrome.runtime.ManifestV3;

// Path to the src and public directory
const srcPath = resolve(__dirname, '..', 'src');

// Browser action definition
const browserAction = {
    default_icon: {
        48: 'icons/logo-48.png',
        96: 'icons/logo-96.png',
        192: 'icons/logo-192.png',
    },
    default_title: '__MSG_actionTitle__',
    default_popup: 'src/action/popup.html',
};

// Manifest presets
const commonManifest = {
    author: pkg.author,
    description: pkg.description,
    name: pkg.displayName ?? pkg.name,
    version: pkg.version,
    default_locale: 'en',
    icons: {
        48: 'icons/logo-48.png',
        96: 'icons/logo-96.png',
        192: 'icons/logo-192.png',
    },
    browser_specific_settings: {
        gecko: {
            id: 'quizletbypass@rospino74.github.io',
            strict_min_version: '57.0',
            update_url: 'https://github.com/rospino74/Quizlet-Bypass/raw/master/public/updates.json',
        },
    },
    content_scripts: Array<any>(),
    permissions: [
        'storage',
    ],
};

const ManifestV2 = {
    background: {
        scripts: ['src/backend/sw.ts'],
        persistent: false,
    },
    browser_action: browserAction,
};

const ManifestV3 = {
    action: browserAction,
    background: {
        service_worker: 'src/backend/sw.ts',
    },
};

export function getManifest(manifestVersion: 2 | 3): Manifest {
    let manifest = {
        ...commonManifest,
        manifest_version: manifestVersion,
    } as Manifest;

    // Various manifest versions
    if (manifestVersion === 2) {
        manifest = { ...manifest, ...ManifestV2 } as chrome.runtime.ManifestV2;
    } else if (manifestVersion === 3) {
        manifest = { ...manifest, ...ManifestV3, host_permissions: [] } as chrome.runtime.ManifestV3;
    } else {
        throw new Error(
            `Missing manifest definition for manifestVersion ${manifestVersion}`,
        );
    }

    // Entry scripts
    readdirSync(`${srcPath}/frontend`).forEach((directory) => {
    // Skipping common directory
        if (directory === 'common') {
            return;
        }

        // eslint-disable-next-line import/no-dynamic-require, global-require
        const structure = require(`${srcPath}/frontend/${directory}/structure.json`);
        const {
            urls, entry, matches, permissions, run_at,
        } = structure;

    // Content scripts entry
    manifest.content_scripts!.push({
        matches,
        js: [`src/frontend/${directory}/${entry}`], // Relative path is required here
        run_at: run_at ?? 'document_idle',
    });

    // Permissions entry (must be unique, so we use a Set)
    manifest.permissions = [...new Set([
        ...(manifest.permissions ?? []),
        ...(permissions ?? []),
        ...(manifestVersion == 2 ? urls : []),
    ])];

    // Host permissions entry (must be unique, so we use a Set)
    if (manifestVersion == 3) {
        manifest.host_permissions = [...new Set([
            ...manifest.host_permissions,
            ...(urls ?? []),
        ])];
    }
    });

    // Remove the webRequest permission
    if (manifestVersion == 3) {
        manifest.permissions = manifest.permissions?.filter((permission) => permission !== 'webRequestBlocking') ?? [];
        manifest.permissions.push('declarativeNetRequest');
    }

    return manifest as Manifest;
}
