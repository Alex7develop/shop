const path = require('path')
const webpack = require('webpack');
const miniCss = require('mini-css-extract-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ImageminWebpWebpackPlugin = require("imagemin-webp-webpack-plugin");

module.exports = {
    devServer: {
        port: 8800,
    },
    devtool: 'source-map',
    output: {
        path: __dirname + '/dist',
        filename: 'js/main.js',
        assetModuleFilename: (data) => {
            return `${/^.*content\.(png|jpg|jpeg|gif|webp)$/i.test(data.filename) ? (
              `img/content/[name][ext]`
            ) : 
            /\.(mov|mp4|webm)$/i.test(data.filename) ? (
              `video/[name][ext]`
            ) : 
            /^.*icon\.(png|jpg|jpeg|gif|webp)$/i.test(data.filename) ? (
              `img/icon/[name][ext]`
            ) : 
            /\.(svg)$/i.test(data.filename) ? (
              `svg/[name][ext]`
            ) : 
            (
              `img/[name][ext]`
            ) }`
        }, // [name] или [hash], путь куда сохранять изображения
        clean: true, // очищает папку dist
    },
    module: {
        rules: [
            {
              test: /\.(png|jpg|jpeg|gif|svg|mov|mpeg4|webp|mp4|webm)$/i,
              type: 'asset/resource',
            }, {
                test: /\.css$/, // /\.(s*)css$/
                use: [
                    miniCss.loader, 'css-loader', // sass-loader,
                ],
            }, {
                test: /\.html$/,
                use: [
                  {
                    loader: 'html-loader',
                    options: {
                      minimize: false,  // отключаем минификацию html
                    },
                  },
                ],
            }, {
              test: /\.(woff|woff2|eot|ttf|otf)$/i,
              type: 'asset/resource',
              generator: {
                filename: 'fonts/[name][ext]',  // указываем путь сборки
              }
            }, {
                test: /\.pug$/,
                // loader: 'pug-loader',
                exclude: /(node_modules|bower_components)/,
                use:[
                  {
                    loader: 'pug-loader', // чтобы нормально подтягивало картинки и собирало
                    options: {
                      exports: false,
                      pretty : false,  // не минифицировать
                    }
                  }
                  
                ]
            },
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            // title: '....' // здесь можно указать title конкретной страницы
            template: './src/pug/index.pug',
            filename: './index.html',   // куда компилировать
            // minify: {
            //   html: false // отключаем минификацию html, еще есть версия minify: false
            // },
            scriptLoading: 'blocking', // defer | module. можно также указать inject: 'body' скрипт будет в конце body но с defer
        }),
        new HtmlWebPackPlugin({
          // title: '....' // здесь можно указать title конкретной страницы
          template: './src/pug/about-us.pug',
          filename: './about-us.html',   // куда компилировать
          // minify: {
          //   html: false // отключаем минификацию html, еще есть версия minify: false
          // },
          scriptLoading: 'blocking', // defer | module. можно также указать inject: 'body' скрипт будет в конце body но с defer
        }),
        new HtmlWebPackPlugin({
          // title: '....' // здесь можно указать title конкретной страницы
          template: './src/pug/service.pug',
          filename: './service.html',   // куда компилировать
          // minify: {
          //   html: false // отключаем минификацию html, еще есть версия minify: false
          // },
          scriptLoading: 'blocking', // defer | module. можно также указать inject: 'body' скрипт будет в конце body но с defer
        }),
        new HtmlWebPackPlugin({
          // title: '....' // здесь можно указать title конкретной страницы
          template: './src/pug/delivery.pug',
          filename: './delivery.html',   // куда компилировать
          // minify: {
          //   html: false // отключаем минификацию html, еще есть версия minify: false
          // },
          scriptLoading: 'blocking', // defer | module. можно также указать inject: 'body' скрипт будет в конце body но с defer
        }),
        new HtmlWebPackPlugin({
          // title: '....' // здесь можно указать title конкретной страницы
          template: './src/pug/price.pug',
          filename: './price.html',   // куда компилировать
          // minify: {
          //   html: false // отключаем минификацию html, еще есть версия minify: false
          // },
          scriptLoading: 'blocking', // defer | module. можно также указать inject: 'body' скрипт будет в конце body но с defer
        }),
        new HtmlWebPackPlugin({
          // title: '....' // здесь можно указать title конкретной страницы
          template: './src/pug/account.pug',
          filename: './account.html',   // куда компилировать
          // minify: {
          //   html: false // отключаем минификацию html, еще есть версия minify: false
          // },
          scriptLoading: 'blocking', // defer | module. можно также указать inject: 'body' скрипт будет в конце body но с defer
        }),
        new HtmlWebPackPlugin({
          // title: '....' // здесь можно указать title конкретной страницы
          template: './src/pug/basket.pug',
          filename: './basket.html',   // куда компилировать
          // minify: {
          //   html: false // отключаем минификацию html, еще есть версия minify: false
          // },
          scriptLoading: 'blocking', // defer | module. можно также указать inject: 'body' скрипт будет в конце body но с defer
        }),
        new HtmlWebPackPlugin({
          // title: '....' // здесь можно указать title конкретной страницы
          template: './src/pug/place-an-order.pug',
          filename: './place-an-order.html',   // куда компилировать
          // minify: {
          //   html: false // отключаем минификацию html, еще есть версия minify: false
          // },
          scriptLoading: 'blocking', // defer | module. можно также указать inject: 'body' скрипт будет в конце body но с defer
        }),
        new HtmlWebPackPlugin({
          // title: '....' // здесь можно указать title конкретной страницы
          template: './src/pug/change-password.pug',
          filename: './change-password.html',   // куда компилировать
          // minify: {
          //   html: false // отключаем минификацию html, еще есть версия minify: false
          // },
          scriptLoading: 'blocking', // defer | module. можно также указать inject: 'body' скрипт будет в конце body но с defer
        }),
        new miniCss({
            filename: 'css/style.css',
        }),
        new CopyWebpackPlugin({
          patterns: [  
            { from: 'src/img/content/espresso-colombia-andino-content.webp', to: 'img/content' },
            { from: 'src/img/content/espresso-colombia-excelso-decaf-content.webp', to: 'img/content' },
            { from: 'src/img/content/espresso-colombia-excelso-ground-content.webp', to: 'img/content' },
            { from: 'src/img/content/espresso-guatemala-blue-ayarsa-content.webp', to: 'img/content' },
            { from: 'src/img/content/espresso-honduras-intibuca-content.webp', to: 'img/content' },
            { from: 'src/img/content/espresso-kenya-anfdb-kibendo-content.webp', to: 'img/content' },
            { from: 'src/img/content/filter-burundi-muranga-content.webp', to: 'img/content' },
            { from: 'src/img/content/filter-columbia-punch-content.webp', to: 'img/content' },
            { from: 'src/img/content/filter-ethiopia-banko-gotete-content.webp', to: 'img/content' },
            { from: 'src/img/content/drip-brasil-cocatrel-content.webp', to: 'img/content' },
            { from: 'src/img/content/drip-burundi-muranga-content.webp', to: 'img/content' },
            { from: 'src/img/content/drip-colombia-excelso-decaf-content.webp', to: 'img/content' },
            { from: 'src/img/content/drip-colombia-punch-content.webp', to: 'img/content' },
            { from: 'src/img/content/drip-ethiopia-banko-gotete-content.webp', to: 'img/content' },
            { from: 'src/img/content/drip-guatemala-blue-ayarza-content.webp', to: 'img/content' },
            { from: 'src/img/content/drip-honduras-otilo-garsias-content.webp', to: 'img/content' },
            { from: 'src/img/content/drip-kenya-anfdb-kibendo-content.webp', to: 'img/content' },
            { from: 'src/img/content/drip-peru-cajamarca-content.webp', to: 'img/content' },
            

            { from: 'src/img/content/merch-t-shirt-white-from-center-front-content.webp', to: 'img/content' },
            { from: 'src/img/content/merch-t-shirt-white-from-center-rear-content.webp', to: 'img/content' },
            { from: 'src/img/content/merch-t-shirt-black-from-center-front-content.webp', to: 'img/content' },
            { from: 'src/img/content/merch-t-shirt-black-from-center-rear-content.webp', to: 'img/content' },

            { from: 'src/img/content/merch-t-shirt-white-black-inside-front-content.webp', to: 'img/content' },
            { from: 'src/img/content/merch-t-shirt-white-black-inside-rear-content.webp', to: 'img/content' },
            { from: 'src/img/content/merch-t-shirt-black-black-inside-front-content.webp', to: 'img/content' },
            { from: 'src/img/content/merch-t-shirt-black-black-inside-rear-content.webp', to: 'img/content' },

            { from: 'src/img/content/merch-t-shirt-white-only-arabica-front-content.webp', to: 'img/content' },
            { from: 'src/img/content/merch-t-shirt-white-only-arabica-rear-content.webp', to: 'img/content' },
            { from: 'src/img/content/merch-t-shirt-black-only-arabica-front-content.webp', to: 'img/content' },
            { from: 'src/img/content/merch-t-shirt-black-only-arabica-rear-content.webp', to: 'img/content' },

            { from: 'src/img/content/merch-shopper-black-front-content.webp', to: 'img/content' },
            { from: 'src/img/content/merch-shopper-black-side-content.webp', to: 'img/content' },
            { from: 'src/img/content/merch-shopper-black-rear-content.webp', to: 'img/content' },

            { from: 'src/img/content/merch-hoodies-black-front-content.webp', to: 'img/content' },
            { from: 'src/img/content/merch-hoodies-black-rear-content.webp', to: 'img/content' },


            { from: 'src/img/content/accessories-neodisher-content.webp', to: 'img/content' },
            { from: 'src/img/content/accessories-neodisher-special-content.webp', to: 'img/content' },
            { from: 'src/img/content/accessories-nok-box-motta-105-content.webp', to: 'img/content' },
            { from: 'src/img/content/accessories-nok-box-motta-content.webp', to: 'img/content' },
            { from: 'src/img/content/accessories-pitcher-ascaso-content.webp', to: 'img/content' },
            { from: 'src/img/content/accessories-pitcher-motta-content.webp', to: 'img/content' },
            { from: 'src/img/content/accessories-scales-content.webp', to: 'img/content' },
            { from: 'src/img/content/accessories-temper-content.webp', to: 'img/content' },
            { from: 'src/img/content/accessories-thermometer-motta-content.webp', to: 'img/content' },

            { from: 'src/img/icons/cdek-pvz-icon.png', to: 'img/icon/cdek-pvz-icon.png' },
            { from: 'src/img/icons/cdek-postamat-icon.png', to: 'img/icon/cdek-postamat-icon.png' },

            { from: 'src/files/Политика_в_отношении_обработки_персональных_данных_R18.pdf', to: 'files/Политика_в_отношении_обработки_персональных_данных_R18.pdf' },
            { from: 'src/files/conditions-ctm.pdf', to: 'files/conditions-ctm.pdf' },
            { from: 'src/files/price.pdf', to: 'files/price.pdf' },

            { from: 'src/img/favicon/apple-touch-icon.png', to: 'img/favicon' },
            { from: 'src/img/favicon/32.png', to: 'img/favicon' },
            { from: 'src/img/favicon/16.png', to: 'img/favicon' },

            { from: 'src/modals-html/__modal-is-delete-account.html', to: './__modal-is-delete-account.html' },
            { from: 'src/modals-html/__modal-deleted-account.html', to: './__modal-deleted-account.html' },
            { from: 'src/modals-html/__modal-edit-profile-successfully.html', to: './__modal-edit-profile-successfully.html' },
            { from: 'src/modals-html/__modal-log-reg.html', to: './__modal-log-reg.html' },
            { from: 'src/modals-html/__modal-login.html', to: './__modal-login.html' },
            { from: 'src/modals-html/__modal-recover.html', to: './__modal-recover.html' },
            { from: 'src/modals-html/__modal-recover-success.html', to: './__modal-recover-success.html' },
            { from: 'src/modals-html/__modal-registration.html', to: './__modal-registration.html' },
            { from: 'src/modals-html/__modal-basket.html', to: './__modal-basket.html' },
            { from: 'src/modals-html/__modal-order-successfully.html', to: './__modal-order-successfully.html' },
            { from: 'src/modals-html/__modal-failed.html', to: './__modal-failed.html' },
            { from: 'src/modals-html/__modal-code.html', to: './__modal-code.html' },

            { from: 'src/robots/robots.txt', to: './robots.txt' },
            { from: 'src/robots/sitemap.xml', to: './sitemap.xml' },
          ],
        }),
        // new ImageminWebpWebpackPlugin({
        //   config: [{
        //     test: /.(jpe?g|png)/,
        //     options: {
        //       quality: 90,
        //     },
        //   }],
        //   overrideExtension: true,
        //   detailedLogs: false,
        //   silent: false,
        //   strict: true,
        // }),
    ]
}