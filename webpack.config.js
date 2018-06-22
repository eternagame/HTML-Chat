const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');
const webpackMerge = require('webpack-merge');

const commonConfig = {
    devtool: 'cheap-eval-source-map',
    entry: {
        'chat-main': './src/js/chat.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.png$/,
                use: { loader: 'url-loader', options: { limit: 100000 } },
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/chat.html',
            filename: 'chat.html',
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'chat-vendor',
            minChunks: function (module) {
               return module.context && module.context.indexOf('node_modules') !== -1;
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'chat-manifest'
        }),
        new InlineManifestWebpackPlugin({
            name: 'webpackManifest'
        }),
    ]
}

const developmentConfig = {
    devServer: {
        contentBase: path.join(__dirname, 'www-dev'),
        compress: true,
        port: 9000,
        before(app){
            const request = require('request');
            const bodyParser = require('body-parser');

            app.use(bodyParser.json());
            app.post('/auth', function(req, res) {
                request.post({
                    url:'https://www.eternagame.org/login/',
                    form: {name:req.body.user, pass:req.body.pass, type:'login'}
                }, function(err,response,body){
                    data = JSON.parse(body).data;
                    if (data.success) {
                        request.get({
                            url: 'https://www.eternagame.org/get/',
                            qs: {uid: data.uid, type: 'user'}
                        }, function(err, response, body) {
                            data.name = JSON.parse(body).data.user.name;
                            res.json(data);
                        });
                    } else {
                        res.json(data);
                    }
                });
            });
        }
    },
    output: {
        filename: 'static/[name].bundle.js',
        sourceMapFilename: 'static/[name].map'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            }
        ]
    },
    plugins : [
        new ExtractTextPlugin({
            filename: 'static/[name].css',
            allChunks: true
        }),
        new webpack.NamedModulesPlugin(),
    ]
}

const productionConfig = {
    output: {
        filename: 'static/[name].[chunkhash].js',
        sourceMapFilename: 'static/[name].[chunkhash].map'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: {
                        loader: 'css-loader',
                        options: {
                            minimize: true
                        }
                    }
                })
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: true
        }),
        new ExtractTextPlugin({
            filename: 'static/[name].[contenthash].css',
            allChunks: true
        }),
        new webpack.HashedModuleIdsPlugin(),
    ]
}



module.exports = function(env) {
  if (env.target === 'dev') {
    return webpackMerge(commonConfig, developmentConfig);
  } else if (env.target === 'prod') {
    return webpackMerge(commonConfig, productionConfig);  
  }
};