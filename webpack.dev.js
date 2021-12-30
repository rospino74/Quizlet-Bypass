/* eslint-disable import/no-extraneous-dependencies, import/extensions */
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

common.forEach((config, index) => {
    common[index] = merge(config, {
        mode: 'development',
        devtool: false,
    });
});

module.exports = common;
