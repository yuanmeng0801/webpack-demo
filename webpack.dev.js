const path = require('path')
const webpack = require('webpack')
const webpackCommonConf = require('./webpack.common.js')
const { smart } = require('webpack-merge')
const HotModuleReplacementPlugin = require('webpack/lib/HotModuleReplacementPlugin')
const DllReferencePlugin = require('webpack/lib/DllReferencePlugin')

module.exports = smart(webpackCommonConf, {
  mode: 'development',
  entry: {
    home: path.join(__dirname, './src/home.js'),
    other: path.join(__dirname, './src/other.js')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: ['babel-loader?cacheDirectory'],
        exclude: /node_modules/
      },
      // 直接引入图片 url
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        use: 'file-loader'
      },
      {
        test: /\.css$/,
        // loader 的执行顺序是：从后往前
        loader: ['style-loader', 'css-loader', 'postcss-loader'] // 加了 postcss
      }
    ]
  },
  plugins: [
    new DllReferencePlugin({
      // 描述 react 动态链接库的文件内容
      manifest: require(path.join(__dirname, './dll/react.manifest.json'))
    }),
    new webpack.DefinePlugin({
      ENV: JSON.stringify('development')
    }),
    new HotModuleReplacementPlugin()
  ],
  devServer: {
    port: 8080,
    contentBase: './dist', // 根目录
    open: true, // 自动打开浏览器
    compress: true, // 启动 gzip 压缩
    hot: true, //开启热更新
    // 设置代理
    proxy: {
      // 将本地 /api/xxx 代理到 localhost:3000/api/xxx
      '/api': 'http://localhost:3000',
      // 将本地 /api2/xxx 代理到 localhost:3000/xxx
      '/api2': {
        target: 'http://localhost:3000',
        pathRewrite: {
          '/api2': ''
        }
      }
    }
  }
  // 使用了webpack-dev-server后，就会开启默认配置，不需要我们手动配置了
  // watch: true, // 开启监听，默认为 false
  // watchOptions: {
  //     ignored: /node_modules/, // 忽略哪些
  //     // 监听到变化发生后会等300ms再去执行动作，防止文件更新太快导致重新编译频率太高
  //     // 默认为 300ms
  //     aggregateTimeout: 300,
  //     // 判断文件是否发生变化是通过不停的去询问系统指定文件有没有变化实现的
  //     // 默认每隔1000毫秒询问一次
  //     poll: 1000
  // }
})
