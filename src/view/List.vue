<template>
<div>
  <aside class="menu">
  <p class="menu-label" style="font-size: 18px;">
    Users
  </p>
  <ul class="menu-list">
    <router-link v-for="item in list" :key="item.userid" :to="{ name: 'map', params: {id: item.userid, vehicles: item.vehicles} }">
      <div class="columns">
        <div class="column is-1" style="width: 20px;">
          <b-tooltip type="is-light" position="is-left">
            <span style="color: #7957d5;"><i class="mdi mdi-image"></i></span>
            <template v-slot:content>
                <img :src="item.owner.foto" class="owner-foto" />
            </template>
        </b-tooltip>
        </div>
        <div class="column is-1">
          {{ item.owner.name }}
        </div>
        <div class="column is-1">
          {{ item.owner.surname }}
        </div>
        <div class="column is-1" style="width: 20px;">
          <span style="color: #7957d5;"><i class="mdi mdi-car-side"></i></span>
        </div>
        <div class="column is-1">
          {{ item.vehicles.length }}
        </div>
      </div>
    </router-link>
  </ul>
  <div v-if="error" class="notification is-danger is-light has-text-centered">
    <p>Something went wrong!</p>
    <p><a href="/">Reload</a></p>
  </div>
  </aside>
</div>
</template>
<style scoped>
.owner-foto {
  height: auto;
  width: auto;
  max-width: 150px;
  max-height: 150px;
}
</style>
<script>
import { mobiService } from "../services/dataServices";
import Cache from "../services/cache";
import VehiclesTable  from '../components/list/VehiclesTable.vue'

const cache = new Cache();
const USER_LIST = "USER_LIST";

export default {
  name: "List",
  components: { VehiclesTable },
  data: () => {
    return {
      list: [],
      error: false
    };
  },
  watch: {    
    $route: "fetchData",
  },
  methods: {
    fetchData() {
      let $self = this;

      let users = cache.get(USER_LIST);      
      if (users) {        
        $self.list = users;
        return;
      }

      mobiService
        .get("api", { params: { op: "list" } })
        .then(function (response) {
          var users = response.data.data;

          if (users) {
            var usersFiltered = users.filter((ele) => {
              return ele.constructor === Object && Object.keys(ele).length > 0;
            });

            cache.set(USER_LIST, usersFiltered, 5 * 60000);

            $self.list = usersFiltered;
          } else {
            $self.$buefy.toast.open({
              message: `Something went wrong!`,
              type: "is-danger",
            });

            $self.error = true;
          }
        })
        .catch(function (error) {
          $self.$buefy.toast.open({
            message: `Something went wrong!`,
            type: "is-danger",
          });

          $self.error = true;
        });
    },
  },
  mounted() {
    this.fetchData();
  },
};
</script>
