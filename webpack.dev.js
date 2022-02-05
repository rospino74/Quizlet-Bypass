/* eslint-disable import/no-extraneous-dependencies, import/extensions */
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const buildPath = path.resolve(__dirname, 'dist', 'build');
const publicPath = path.resolve(__dirname, 'public');

common.forEach((config, index) => {
    common[index] = merge(config, {
        mode: 'development',
        devtool: false,
    });
});

common[0].plugins.push(
    new CopyPlugin({
        patterns: [
            {
                from: `${publicPath}/locales`,
                to: `${buildPath}/_locales`,
            },
        ],
    }),
);

module.exports = common;
