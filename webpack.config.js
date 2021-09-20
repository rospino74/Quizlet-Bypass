const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const WebpackObfuscator = require('webpack-obfuscator');
const { EnvironmentPlugin } = require('webpack');
const { version } = require('./package.json');

// Path to the dist folder
const distPath = path.resolve(__dirname, 'dist');

async function zipExtensionFiles() {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = fs.createWriteStream(`${__dirname}/extension.zip`);

    return new Promise((resolve, reject) => {
        archive
            .directory(distPath, false)
            .on('error', (err) => reject(err))
            .pipe(stream);

        stream.on('close', () => resolve());
        archive.finalize();
    });
}

function resolveAllForegroundScripts() {
    const scripts = {};

    // Leggo tutte le cartelle
    fs.readdirSync(`${__dirname}/src/foreground`).forEach((directory) => {
        scripts[directory] = `./src/foreground/${directory}/index.js`;
    });

    return scripts;
}

const commonConfig = {
    mode: 'production',
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
        new WebpackObfuscator({
            renameGlobals: false,
            rotateStringArray: true,
            identifierNamesGenerator: 'mangled-shuffled',
            selfDefending: true,
            compact: true,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.2,
        }),
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
    entry: resolveAllForegroundScripts,
    output: {
        path: distPath,
        filename: '[name].content.js',
    },
};

const background = {
    ...commonConfig,
    entry: './src/background/background.ts',
    output: {
        path: distPath,
        filename: 'background.js',
    },
};

module.exports = [
    content, background,
];
