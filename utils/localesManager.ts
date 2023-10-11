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

import fs from 'fs';
import type { PluginOption } from 'vite';

interface LocaleManagerConfig {
  /**
   * Input directory relative to the vite config file
   */
  inputDir: string;
  /**
   * Output directory relative to the build directory
   */
  outputDir: string;

  /**
   * Keys to exclude from the output
   */
  excludeKeys?: Array<RegExp>;
}

type Locale = Record<string, { message: string }>;

// Loads locales from a folder and adds them to the build process
export default function localeManager(pluginConfig: LocaleManagerConfig): PluginOption {
    let localeFiles: Array<string>;

    return {
        name: 'locales-manager',
        buildStart() {
            localeFiles = fs.readdirSync(pluginConfig.inputDir).filter((file) => file.endsWith('.json'));
        },
        generateBundle() {
            localeFiles.forEach((file) => {
                const localeName = file.replace('.json', '').replace('-', '_');
                const content = fs.readFileSync(`${pluginConfig.inputDir}/${file}`, 'utf-8');

                // JSON parsing
                const locale: Locale = JSON.parse(content);

                // Key filtering
                if (pluginConfig.excludeKeys) {
                    Object.keys(locale).forEach((key) => {
                        if (pluginConfig.excludeKeys?.some((r) => r.test(key))) {
                            delete locale[key];
                        }
                    });
                }
                // Write to file
                this.emitFile({
                    type: 'asset',
                    fileName: `${pluginConfig.outputDir}/${localeName}/messages.json`,
                    source: JSON.stringify(locale),
                });
            });
        },
    };
}
