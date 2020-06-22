const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  plugins: [
    // 多入口 - 生成 index.html
    new HtmlWebpackPlugin({
      template: path.join(__dirname, './template/home.html'),
      filename: 'home.html',
      // chunks 表示该页面要引用哪些 chunk （即上面的 index 和 other），默认全部引用
      chunks: ['home', 'vendor', 'common'] // 要考虑代码分割
    }),
    // 多入口 - 生成 other.html
    new HtmlWebpackPlugin({
      template: path.join(__dirname, './template/other.html'),
      filename: 'other.html',
      chunks: ['other', 'common'] // 考虑代码分割
    })
  ]
}
