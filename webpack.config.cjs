const path = require('path');

module.exports = {
  entry: './src/index.ts', // or './src/browser.ts' if that's your main file
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'module', // for ESM output, or 'commonjs' if you prefer
    },
  },
  experiments: {
    outputModule: true, // only needed for ESM output
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.hbs$/,
        use: 'raw-loader',
      },
    ],
  },
  mode: 'production', // or 'development'
};