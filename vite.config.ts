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

// We can allow this file to include dependencies that are not in package.json
/* eslint-disable import/no-extraneous-dependencies */
// @ts-nocheck

import { defineConfig, loadEnv } from 'vite';
import topLevelAwait from 'vite-plugin-top-level-await';
import webExtension from '@samrum/vite-plugin-web-extension';
import path from 'path';
import { getManifest } from './utils/manifest';
import localesManager from './utils/localesManager';
import { version } from './package.json';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const manifestVersion = Number(env.MANIFEST_VERSION ?? 3) as 2 | 3;
    const debugPrints = mode !== 'production' || Boolean(env.DEBUG_PRINTS ?? false);

    return {
        plugins: [
            webExtension({
                manifest: getManifest(manifestVersion),
            }),
            topLevelAwait({
                promiseExportName: '__tlawait_export__',
                promiseImportName: (i: number) => `__tlawait_import_${i}__`,
            }),
            localesManager({
                inputDir: './src/locales',
                outputDir: '_locales',
                excludeKeys: !debugPrints && [/debug[\w]+/]
            }),
        ],
        resolve: {
            alias: {
                '~': path.resolve(__dirname, './src'),
            },
        },
        define: {
            __EXTENSION_VERSION__: JSON.stringify(version ?? '1.0.0'),
            __EXTENSION_MV3__: manifestVersion === 3,
            __EXTENSION_MV2__: manifestVersion === 2,
            __EXTENSION_DEBUG_PRINTS__: debugPrints,
        },
    };
});
