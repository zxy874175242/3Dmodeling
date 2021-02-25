// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
// import store from './store'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import Antd from 'ant-design-vue'// 引入Ant Design Vue组件
import 'ant-design-vue/dist/antd.css' // 引入Ant Design Vue样式
Vue.use(Antd);

Vue.config.productionTip = false;
Vue.use(ElementUI);



/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
