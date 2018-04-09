/* eslint-disable */
import Vue from "vue";
import axios from "axios";
import VueAxios from "vue-axios";
import App from "./App";
import router from "./router";
import BootstrapVue from 'bootstrap-vue';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import swal from "sweetalert2";
import "./assets/sass/main.scss";
import 'material-design-icons/iconfont/material-icons.css';


Vue.config.productionTip = false;

Vue.use(BootstrapVue);

Vue.use(VueAxios, axios);
axios.defaults.baseURL = "http://localhost:3000";
axios.defaults.headers.post["Content-Type"] =
	"application/x-www-form-urlencoded";


const reqInterceptor = axios.interceptors.request.use(config => {
	config.headers.common["Authorization"] = localStorage.getItem("token");
	console.log("Request Interceptor", config);
	return config;
});

const resInterceptor = axios.interceptors.response.use(res => {
	console.log("Response Interceptor", res);
	return res;
});

axios.interceptors.request.eject(reqInterceptor);
axios.interceptors.response.eject(resInterceptor);
/* eslint-disable no-new */
new Vue({
	el: "#app",
	router,
	components: { App },
	template: "<App/>"
});

