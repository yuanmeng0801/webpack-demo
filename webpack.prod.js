const path = require('path')
const webpack = require('webpack')
const { smart } = require('webpack-merge')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserJSPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const HappyPack = require('happypack')
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')
const webpackCommonConf = require('./webpack.common.js')
const DllReferencePlugin = require('webpack/lib/DllReferencePlugin')
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const smp = new SpeedMeasurePlugin()

module.exports = smp.wrap(
  smart(webpackCommonConf, {
    mode: 'production',
    entry: {
      home: path.join(__dirname, './src/home.js'),
      other: path.join(__dirname, './src/other.js')
    },
    output: {
      filename: '[name].[contentHash:8].js',
      path: path.join(__dirname, './dist')
      // publicPath: 'http://cdn.abc.com'  // 修改所有静态文件 url 的前缀（如 cdn 域名）
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          // 把对 .js 文件的处理转交给 id 为 babel 的 HappyPack 实例
          use: ['happypack/loader?id=babel'],
          exclude: /node_modules/
        },
        // 图片 - 考虑 base64 编码的情况
        {
          test: /\.(png|jpg|jpeg|gif)$/,
          use: {
            loader: 'url-loader',
            options: {
              // 小于 5kb 的图片用 base64 格式产出
              // 否则，依然延用 file-loader 的形式，产出 url 格式
              limit: 5 * 1024,
              outputPath: '/img1/'
              // 设置图片的 cdn 地址（也可以统一在外面的 output 中设置，那将作用于所有静态资源）publicPath: 'http://cdn.abc.com'
            }
          }
        },
        // 抽离 css
        {
          test: /\.css$/,
          loader: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin(),
      new webpack.DefinePlugin({
        ENV: JSON.stringify('production')
      }),
      // 抽离 css 文件
      new MiniCssExtractPlugin({
        filename: 'css/main.[contentHash:8].css'
      }),
      // 忽略 moment 下的 /locale 目录
      new webpack.IgnorePlugin(/\.\/locale/, /moment/),
      // happyPack 开启多进程打包
      new HappyPack({
        // 用唯一的标识符 id 来代表当前的 HappyPack 是用来处理一类特定的文件
        id: 'babel',
        // 如何处理 .js 文件，用法和 Loader 配置中一样
        loaders: ['babel-loader?cacheDirectory']
      }),
      // 使用 ParallelUglifyPlugin 并行压缩输出的 JS 代码
      new ParallelUglifyPlugin({
        // 传递给 UglifyJS 的参数（还是使用 UglifyJS 压缩，只不过帮助开启了多进程）
        uglifyJS: {
          output: {
            beautify: false, // 最紧凑的输出
            comments: false // 删除所有的注释
          },
          compress: {
            drop_console: true, // 删除所有的 `console` 语句，可以兼容ie浏览器
            collapse_vars: true, // 内嵌定义了但是只用到一次的变量
            reduce_vars: true // 提取出出现多次但是没有定义成变量去引用的静态值
          }
        }
      })
    ],

    optimization: {
      // 压缩 css
      minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
      // 分割代码块
      splitChunks: {
        // initial 入口chunk，对于异步导入的文件不处理，async 异步chunk，只对异步导入的文件处理，all 全部chunk
        chunks: 'all',
        cacheGroups: {
          // 通过minChunks、minSize、test、priority等条件来筛选要打包的模块。例如：最少被引用过一次，且大于体积大于0的，在node_modules文件夹下的包，就打包到vendor.js中。
          vendor: {
            name: 'vendor', // chunk 名称
            priority: 1, // 权限更高，优先抽离
            test: /node_modules/,
            minSize: 0, // 大小限制
            minChunks: 1 // 最少复用过几次
          },
          // 公共的模块
          common: {
            name: 'common',
            priority: 0,
            minSize: 0,
            minChunks: 2
          }
        }
      }
    }
  })
)
