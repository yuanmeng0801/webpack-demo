import moment from 'moment'
import { add } from './utils.js'
import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import { BrowserRouter } from 'react-router-dom'
import { connect } from 'react-redux'
console.log(add(2, 6))

// 增加，开启热更新之后的代码逻辑
if (module.hot) {
  // 当utils文件夹下发生了变化，执行回调函数，所以在更改了add函数后，页面不会刷新
  module.hot.accept(['./utils'], () => {
    console.log(add(10, 40))
  })
}
