import Vue from "vue";
import Router from "vue-router";
import List from "./view/List.vue";
import Map from "./view/Map.vue";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",      
      component: List
    },
    {
      path: "/map/:id",
      name: "map",
      component: Map,
      props: true
    }
  ]
});
