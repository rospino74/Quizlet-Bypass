/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const { EnvironmentPlugin } = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');
const { version } = require('./package.json');
const manifest = require('./public/manifest.json');
const ManifestCompilationPlugin = require('./utils/manifest-plugin');

// Path to the dist folder
const distPath = path.resolve(__dirname, 'dist');
const buildPath = path.resolve(distPath, 'build');
const publicPath = path.resolve(__dirname, 'public');
const srcForegroundPath = path.resolve(__dirname, 'src', 'foreground');

// Array di informazioni sugli entrypoint
const entryScripts = {};
const contentScriptStruture = [];

function buildManifest() {
    // Leggo tutte le cartelle
    fs.readdirSync(srcForegroundPath).forEach((directory) => {
        // eslint-disable-next-line import/no-dynamic-require, global-require
        const structure = require(`${srcForegroundPath}/${directory}/structure.json`);
        const { entry } = structure;

        entryScripts[directory] = `./src/foreground/${directory}/${entry}`;
        contentScriptStruture.push({ ...structure, name: directory });
    });
}

async function zipExtensionFiles() {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = fs.createWriteStream(`${distPath}/extension.zip`);

    return new Promise((resolve, reject) => {
        archive
            .directory(buildPath, false)
            .on('error', (err) => reject(err))
            .pipe(stream);

        stream.on('close', () => {
            try {
                // Copyes the extension in the firefox format
                fs.copyFileSync(`${distPath}/extension.zip`, `${distPath}/extension-firefox.xpi`);

                resolve();
            } catch (err) {
                reject(err);
            }
        });
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
    output: {
        chunkLoadingGlobal: 'quizletBypassJsonp',
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
    optimization: {
        usedExports: true,
        innerGraph: true,
    },
};

const content = merge(commonConfig, {
    entry: () => entryScripts,
    output: {
        filename: '[name].content.js',
        path: buildPath,
    },
    plugins: [
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
        new ManifestCompilationPlugin({
            content: contentScriptStruture,
            model: manifest,
        }),
    ],
});

const background = merge(commonConfig, {
    entry: './src/background/background.ts',
    output: {
        filename: 'background.js',
        path: buildPath,
    },
});

module.exports = [
    content, background,
];
