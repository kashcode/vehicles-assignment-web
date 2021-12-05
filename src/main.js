import "es6-promise/auto";
import Vue from "vue";
import App from "./App.vue";
import router from "./router";

import Buefy from "buefy";
//import "buefy/dist/buefy.css";

Vue.use(Buefy);

new Vue({
  router,
  el: "#app",
  render: (h) => h(App),
});
