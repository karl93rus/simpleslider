const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'onemoreslider.js'
  },
  // watch: true,
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
		rules: [
			{
				test: /(\.ts)$|(\.js)$/,
				exclude: /node_modules/,
				loader: "ts-loader"
			},
		]
	},
}