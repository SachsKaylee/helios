const NodemonPlugin = require( 'nodemon-webpack-plugin');
const path = require("path");

module.exports = {
    entry: './src/server.js',
    output: {
        path: path.resolve('./dist'),
        filename: 'server.js',
    },
    plugins: [
        new NodemonPlugin(),
    ],
}