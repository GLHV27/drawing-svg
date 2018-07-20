const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const NODE_ENV = process.env.NODE_ENV;

const pathToBuild = '/dist';

function addHash(template, hash) {
    return NODE_ENV === 'production' ? template : `${template}?v=[hash:6]`;
}

// Plugins
let plugins = [
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new ExtractTextPlugin(addHash(`drawing-svg.css`, 'contenthash')),
    new HtmlWebpackPlugin({
        title: 'svg-drawing',
        template: 'src/example.hbs',
        filename: 'index.html',
        inject: 'head',
        hash: false,
        alwaysWriteToDisk: true
    }),
    new HtmlWebpackHarddiskPlugin(),
    new CopyWebpackPlugin([
        {from:'_media', to: '_media'}
    ]),
];

if (NODE_ENV !== 'development') {
    plugins.push(new UglifyJsPlugin());
}
//

module.exports = {
    entry: {
        app: ['./src/js/index.js']
    },
    output: {
        path: __dirname + pathToBuild,
        publicPath: '/',
        filename: addHash(`drawing-svg.js`, 'contenthash')
    },

    externals: NODE_ENV === 'production' ? {'svg.js': 'svg.js'} : undefined,

    devtool: NODE_ENV === 'development' ? 'source-map' : false,

    resolve: {
        modules: ['node_modules', './src'],
        extensions: ['.js', '.jsx', '.json']
    },

    watchOptions: {
        aggregateTimeout: 300
    },

    devServer: {
        host: '0.0.0.0',
        port: 8085,
        hot: true,
        inline: true,
        watchContentBase: true,
        contentBase: pathToBuild,
        historyApiFallback: true
    },

    module: {
        rules: [
            {
                test: /\.(jsx|js)$/,
                loader: "babel-loader",
                exclude: [/node_modules/, /build/]
            },

            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'autoprefixer-loader']
                })
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'autoprefixer-loader', 'less-loader']
                })
            },

            {
                test: /\.json$/,
                loader: "json-loader"
            },

            {
                test: /\.ico$/,
                loader: "url-loader?limit=10000&mimetype=image/ico"
            },

            {
                test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)(\?.*$|$)/,
                loader: `file-loader?name=[name].[ext]?[hash]`
            },

            {
                test: /\.hbs$/,
                loader: "handlebars-loader"
            }
        ]
    },

    plugins: plugins
};
