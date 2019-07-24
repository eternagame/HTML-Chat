// vue.config.js
const path = require('path');

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src/app/'),
      },
    },
  },
};
