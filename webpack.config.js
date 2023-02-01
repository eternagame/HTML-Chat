const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function(env) {
    return {
        entry: './src/js/chat.js',
        mode: env.target === 'dev' ? 'development' : 'production',
        output: env.target === 'prod' ? {publicPath: 'static/'} : {},
        module: {
            rules: [
                {
                    test: /\.(png|jpg|gif|svg|mp3|ttf)$/,
                    type: 'asset/resource',
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                }
            ]
        },
        devServer: {
            static: [path.join(__dirname, 'www-dev')],
            port: 9000,
            hot: false,
            proxy: [
                {
                    context: ['/get', '/post', '/login', '/authenticate.php', '/eterna_logout.php'],
                    target: 'https://eternagame.org',
                    changeOrigin: true,
                }
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/chat.html',
                filename: 'chat.html',
                scriptLoading: 'blocking',
            })
        ],
        optimization: {
            splitChunks: {
                chunks: 'all',
            },      
        },
    }
};