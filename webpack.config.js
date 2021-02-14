const env = process.env.NODE_ENV
const path = require('path')
const TerserJSPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
	entry: {
		main: './src/index.js',
	},
	optimization: {
		moduleIds: 'hashed',
		runtimeChunk: {
			name: 'runtime'
		},
		splitChunks: {
			chunks: 'all',
			cacheGroups: {
				vendors: {
					test: /[\\/]node_modules[\\/]/i,
					chunks: 'all',
					name: 'vendor'
				}
			}
		},
		minimize: process.env.NODE_ENV === 'production',
		minimizer: [
			new TerserJSPlugin({
				cache: true,
				parallel: true
			})
		],
	},
	devServer: {
		contentBase: path.join(__dirname, 'docs'),
		compress: true,
		port: 3200,
	},
	devtool: 'source-map',
	performance: {
		hints: 'warning'
	},
	watch: process.env.NODE_ENV !== 'production',
	watchOptions: {
		ignored: /node_modules/
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			},
			{
				test: /\.s[c]ss$/,
				exclude: /node_modules/,
				use: [
					'style-loader',
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							sourceMap: true
						}
					},
					{
						loader: 'css-loader',
						options: {
							sourceMap: true
						}
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true
						}
					},
				]
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					MiniCssExtractPlugin.loader,
					'css-loader'
				]
			},
		]
	},
	plugins: [
		new MiniCssExtractPlugin({
			path: path.resolve(__dirname, 'docs'),
			filename: env === 'production' ? 'css/min/[name].min.css?[contenthash:8]' : 'css/[name].css'
		}),
		new HtmlWebpackPlugin({
			template: 'src/index.html'
		})
	],
	output: {
		path: path.resolve(__dirname, 'docs'),
		pathinfo: false,
		publicPath: '/',
		filename: env === 'production' ? 'js/min/[name].bundle.min.js?[contenthash:8]' : 'js/[name].bundle.js'
	}
}
