import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue'
import './assets/Iconfont/iconfont.css'

Vue.use(ElementUI);
Vue.config.productionTip = false


import axios from "axios"
axios.defaults.baseURL = "http://localhost:3000/"
Vue.prototype.$http = axios

new Vue({
  render: h => h(App),
}).$mount('#app')
