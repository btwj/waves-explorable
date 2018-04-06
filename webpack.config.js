const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Is the current build a development build
const IS_DEV = (process.env.NODE_ENV === 'dev');

const dirNode = 'node_modules';
const dirApp = path.join(__dirname, 'app');
const dirPages = path.join(__dirname, 'pages');
const dirAssets = path.join(__dirname, 'assets');

const appHtmlTitle = 'Waves';

module.exports = {
	entry: {
		vendor: [
			'lodash'
		],
		common: path.join(dirApp, 'common.js'),
		introduction: path.join(dirApp, 'introduction.js'),
		interference: path.join(dirApp, 'interference.js')
	},
	resolve: {
		modules: [
			dirNode,
			dirApp,
			dirAssets
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			IS_DEV: IS_DEV
		}),
		new HtmlWebpackPlugin({
			template: path.join(dirPages, 'introduction.ejs'),
			filename: 'introduction.html',
			title: appHtmlTitle,
			chunks: ['common', 'introduction']
		}),
		new HtmlWebpackPlugin({
			template: path.join(dirPages, 'interference.ejs'),
			filename: 'interference.html',
			title: appHtmlTitle,
			chunks: ['common', 'interference']
		})
	],
	module: {
		rules: [
			// BABEL
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /(node_modules)/,
				options: {
					compact: true
				}
			},

			// STYLES
			{
				test: /\.css$/,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							sourceMap: IS_DEV
						}
					},
				]
			},

			// CSS / SASS
			{
				test: /\.scss/,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							sourceMap: IS_DEV
						}
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: IS_DEV,
							includePaths: [dirAssets]
						}
					}
				]
			},

			// IMAGES
			{
				test: /\.(jpe?g|png|gif)$/,
				loader: 'file-loader',
				options: {
					name: '[path][name].[ext]'
				}
			},

			{
				test: /\.(html)$/,
				loader: 'html-loader'
			}
		]
	}
};
