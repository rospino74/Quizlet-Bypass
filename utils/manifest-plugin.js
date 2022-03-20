const { execSync } = require('child_process');
const { version, description } = require('../package.json');

class ManifestCompilationPlugin {
    constructor({
        content,
        model: template,
        isMV3,
    } = {}) {
        if (!content) {
            throw new Error('Must provide at least one content script!');
        }

        if (!template) {
            throw new Error('Must provide a manifest template!');
        }

        this.content = content;
        this.manifest = template;
        this.isMV3 = isMV3 || false;
    }

    apply(compiler) {
        const pluginName = ManifestCompilationPlugin.name;
        const { webpack } = compiler;
        const { Compilation } = webpack;
        const { RawSource } = webpack.sources;

        compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
            compilation.hooks.processAssets.tap({
                name: pluginName,
                stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
            }, () => {
                this.buildContent();
                this.setManifestValues();

                const manifestString = JSON.stringify(this.manifest, null, 2);
                compilation.emitAsset(
                    'manifest.json',
                    new RawSource(manifestString),
                );
            });
        });
    }

    buildContent() {
        this.content.forEach(({
            permissions, matches, name, urls,
        }) => {
            this.manifest.content_scripts.push({
                matches,
                js: [`${name}.content.js`],
                run_at: name === 'quizlet' ? 'document_start' : 'document_idle',
            });

            // Add the permissions and the host_permissions if they exist
            this.manifest.permissions = [...new Set([
                ...this.manifest.permissions,
                ...(permissions || []),
                ...(!this.isMV3 ? urls : []),
            ])];
            if (this.isMV3) {
                this.manifest.host_permissions = [...new Set([
                    ...(this.manifest.host_permissions || []),
                    ...(urls || []),
                ])];
            }
        });
    }

    setManifestValues() {
        this.manifest.version = version || '1.0.0';
        this.manifest.description = description || '';

        // Check the number of commits from the last release, if any add it to the version
        try {
            const lastTagHash = execSync('git rev-list --tags --no-walk --max-count=1').toString().trim();
            const commitsCount = execSync(`git rev-list --count ${lastTagHash}..HEAD`).toString().trim();
            if (commitsCount || commitsCount !== '0') {
                this.manifest.version += `.${commitsCount}`;
            }
        } catch (e) {
            // Do nothing
        }

        if (this.isMV3) {
            this.manifest.manifest_version = 3;

            // Using a service worker
            // eslint-disable-next-line prefer-destructuring
            this.manifest.background.service_worker = this.manifest.background.scripts[0];
            delete this.manifest.background.scripts;

            // Migrating page action
            this.manifest.action = this.manifest.browser_action;
            delete this.manifest.browser_action;

            // Remove the webRequest permission
            this.manifest.permissions = this.manifest.permissions.filter((permission) => permission !== 'webRequestBlocking');
            this.manifest.permissions.push('declarativeNetRequest');
        }
    }
}

module.exports = ManifestCompilationPlugin;
