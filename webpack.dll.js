const path = require('path')
const DllPlugin = require('webpack/lib/DllPlugin')

module.exports = {
  mode: 'production',
  entry: {
    // 把 React、vue相关的东西单独打包
    react: ['react', 'react-dom', 'react-router-dom', 'redux', 'react-redux'],
    vue: ['vue', 'vue-router', 'vuex']
  },
  output: {
    filename: '[name].dll.js',
    path: path.join(__dirname, './dll'),
    library: '_dll_[name]' // 存放动态链接库的全局变量名称，例如对应 react 来说就是 _dll_react,之所以在前面加上 _dll_ 是为了防止全局变量冲突
  },
  plugins: [
    // 每个入口会生成一个对应的manifest.json文件
    new DllPlugin({
      name: '_dll_[name]', // 动态链接库的全局变量名称，需要和 output.library 中保持一致
      path: path.join(__dirname, './dll/[name].manifest.json') // 描述动态链接库的 manifest.json 文件输出时的文件名称
    })
  ]
}
