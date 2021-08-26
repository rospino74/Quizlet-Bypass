const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

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

const commonConfig = {
    mode: 'production',
    resolve: {
        fallback: {
            https: require.resolve('https-browserify'),
            http: require.resolve('stream-http'),
            url: require.resolve('url/'),
            buffer: require.resolve('buffer/'),
        },
    },
    plugins: [
        {
            apply: (compiler) => {
                compiler.hooks.afterEmit.tap('ZipItPlugin', zipExtensionFiles);
            },
        },
    ],
};

const content = {
    ...commonConfig,
    entry: './src/index.js',
    output: {
        path: distPath,
        filename: 'content.js',
    },
};

const background = {
    ...commonConfig,
    entry: './src/background.js',
    output: {
        path: distPath,
        filename: 'background.js',
    },
};

module.exports = [
    content, background,
];
