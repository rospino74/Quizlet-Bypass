/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const { EnvironmentPlugin } = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const { version, description } = require('./package.json');
const manifest = require('./public/manifest.json');

// Path to the dist folder
const distPath = path.resolve(__dirname, 'dist');
const buildPath = path.resolve(distPath, 'build');
const publicPath = path.resolve(__dirname, 'public');
const srcForegroundPath = path.resolve(__dirname, 'src', 'foreground');

// Array di informazioni sugli entrypoint
const entryScripts = {};

function buildManifest() {
    // Leggo tutte le cartelle
    fs.readdirSync(srcForegroundPath).forEach((directory) => {
        const {
            // eslint-disable-next-line camelcase
            permissions, host_permissions, matches, entry,
            // eslint-disable-next-line import/no-dynamic-require, global-require
        } = require(`${srcForegroundPath}/${directory}/structure.json`);

        // Aggiungo informazioni sui permessi
        manifest.permissions = [...new Set([...manifest.permissions, ...permissions])];

        // eslint-disable-next-line camelcase
        if (host_permissions) {
            // eslint-disable-next-line camelcase
            manifest.host_permissions = [...new Set([...manifest.host_permissions, ...host_permissions])];
        }

        // e quelle sull'entrypoint
        manifest.content_scripts.push({
            matches,
            js: [`${directory}.content.js`],
        });
        entryScripts[directory] = `./src/foreground/${directory}/${entry}`;
    });

    // Aggiorna versione e descrizione nel manifest
    manifest.version = version;
    manifest.description = description;

    if (!fs.existsSync(buildPath)) {
        fs.mkdirSync(buildPath, { recursive: true });
    }

    // salvo il manifest nella cartella di distribuzione
    fs.writeFileSync(`${buildPath}/manifest.json`, JSON.stringify(manifest, null, 2));
}

async function zipExtensionFiles() {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = fs.createWriteStream(`${distPath}/extension.zip`);

    return new Promise((resolve, reject) => {
        archive
            .directory(buildPath, false)
            .on('error', (err) => reject(err))
            .pipe(stream);

        stream.on('close', () => resolve());
        archive.finalize();
    });
}

const commonConfig = {
    resolve: {
        fallback: {
            https: require.resolve('https-browserify'),
            http: require.resolve('stream-http'),
            url: require.resolve('url/'),
            buffer: require.resolve('buffer/'),
        },
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        {
            apply: (compiler) => {
                compiler.hooks.afterEmit.tap('ZipItPlugin', zipExtensionFiles);
            },
        },
        new EnvironmentPlugin({
            VERSION: version,
        }),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    performance: {
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
    },
};

const content = {
    ...commonConfig,
    entry: () => entryScripts,
    output: {
        filename: '[name].content.js',
        path: buildPath,
    },
    plugins: [
        ...commonConfig.plugins,
        {
            apply: (compiler) => {
                compiler.hooks.compile.tap('BuildManifest', buildManifest);
            },
        },
        new CopyPlugin({
            patterns: [
                { from: `${publicPath}/icons`, to: `${buildPath}/icons` },
            ],
        }),
    ],
};

const background = {
    ...commonConfig,
    entry: './src/background/background.ts',
    output: {
        filename: 'background.js',
        path: buildPath,
    },
};

module.exports = [
    content, background,
];
