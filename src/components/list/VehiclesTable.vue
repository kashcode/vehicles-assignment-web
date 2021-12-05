<template>
  <table class="table is-bordered is-narrow is-striped vehicles">
    <thead>
      <tr>
        <th>#</th>
        <th>Make</th>
        <th>Model</th>
        <th>Year</th>
        <th>Color</th>
        <th>Vin</th>
        <th>Foto</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(vehicle, index) in vehicles" :key="vehicle.vehicleid">
        <td>{{ index + 1 }}</td>
        <td>{{ vehicle.make }}</td>
        <td>{{ vehicle.model }}</td>
        <td>{{ vehicle.year }}</td>
        <td :style="{ 'background-color': vehicle.color }"></td>
        <td>{{ vehicle.vin }}</td>
        <td>
          <img
            :src="vehicle.foto"
            class="vehicle-foto"
            alt="vehicle photo"
            onerror="this.onerror=null;this.src='http://www.dermalina.com/wp-content/uploads/2020/12/no-image.jpg';"
          />
        </td>
      </tr>
    </tbody>
  </table>
</template>
<style scoped>
.vehicle-foto {
  height: auto;
  width: auto;
  max-width: 50px;
  max-height: 50px;
}
</style>
<script>
export default {
  name: "VehiclesTable",
  props: ["vehicles"],
};
</script>
