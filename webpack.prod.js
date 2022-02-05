/* eslint-disable import/no-extraneous-dependencies, import/extensions */
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');
const WebpackObfuscator = require('webpack-obfuscator');
const common = require('./webpack.common.js');

const buildPath = path.resolve(__dirname, 'dist', 'build');
const publicPath = path.resolve(__dirname, 'public');

common.forEach((config, index) => {
    common[index] = merge(config, {
        mode: 'production',
        plugins: [
            new WebpackObfuscator({
                renameGlobals: false,
                identifierNamesGenerator: 'mangled-shuffled',
                selfDefending: true,
                compact: true,
                deadCodeInjection: true,
                deadCodeInjectionThreshold: 0.1,
            }),
        ],
    });
});

common[0].plugins.push(
    new CopyPlugin({
        patterns: [
            {
                from: `${publicPath}/locales`,
                to: `${buildPath}/_locales`,
                transform(fileContentBuffer) {
                    const parsedObject = JSON.parse(
                        fileContentBuffer.toString(),
                    );

                    // If the key starts with the "debug" prefix, remove it
                    Object.keys(parsedObject).forEach((key) => {
                        if (key.startsWith('debug')) {
                            delete parsedObject[key];
                        }
                    });

                    return JSON.stringify(parsedObject);
                },
            },
        ],
    }),
);

module.exports = common;
