const { version, description } = require('../package.json');

class ManifestCompilationPlugin {
    constructor({
        content,
        model: template,
    } = {}) {
        if (!content) {
            throw new Error('Must provide at least one content script!');
        }

        if (!template) {
            throw new Error('Must provide a manifest template!');
        }

        this.content = content;
        this.manifest = template;
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
            // eslint-disable-next-line camelcase
            permissions, matches, name,
        }) => {
            this.manifest.content_scripts.push({
                matches,
                js: [`${name}.content.js`],
            });

            // Aggiungo informazioni sui permessi
            this.manifest.permissions = [...new Set([...this.manifest.permissions, ...permissions])];
        });
    }

    setManifestValues() {
        this.manifest.version = version || '0.0.0';
        this.manifest.description = description || '';
    }
}

module.exports = ManifestCompilationPlugin;
