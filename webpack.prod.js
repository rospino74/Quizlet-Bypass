/* eslint-disable import/no-extraneous-dependencies, import/extensions */
const { merge } = require('webpack-merge');
const WebpackObfuscator = require('webpack-obfuscator');
const common = require('./webpack.common.js');

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

module.exports = common;
