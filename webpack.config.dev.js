const path = require('path');
const merge = require('webpack-merge');
const webpackConfig = require('./webpack.config');

module.exports = merge(webpackConfig, {

	devtool: 'eval',

	output: {
		path: path.join(__dirname, 'dev'),
		pathinfo: true,
		publicPath: '/',
		filename: '[name].js'
	},

	devServer: {
		index: 'introduction.html'
	}

});
