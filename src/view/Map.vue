<template>
  <div>
    <h5 class="title is-5">
      <router-link to="/" title="Back to user list">
        <i class="mdi mdi-keyboard-return"></i>
      </router-link>
    </h5>
    <div class="columns">
      <div class="column is-one-quarter is-narrow">
        <aside class="menu">
          <p class="menu-label" style="font-size: 18px">Vehicles</p>
          <ul class="menu-list" v-for="v in vehicles" :key="v.vehicleid">
            <li v-on:click="vehicleSelected(v.vehicleid)">
              <a>
                <span class="tag" :style="{ 'background-color': v.color }" style="border: 1px solid #7a7a7a">&nbsp;</span>
                <span style="padding-left: 6px" >{{ v.make }} {{ v.model }}</span>
              </a>
            </li>
          </ul>
        </aside>
      </div>
      <div class="column">
        <div ref="map-root" class="map"></div>
        <div id="popup" class="ol-popup">
          <a href="#" id="popup-closer" class="ol-popup-closer"></a>
          <div id="popup-content"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.map {
  width: 100%;
  height: 900px;
  border: 1px solid #7a7a7a;
  border-radius: 4px;
}
.ol-popup {
  position: absolute;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  padding-top: 28px;
  border-radius: 10px;
  border: 1px solid #cccccc;
  bottom: 12px;
  left: -50px;
  min-width: 280px;
}
.ol-popup:after,
.ol-popup:before {
  top: 100%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}
.ol-popup:after {
  border-top-color: white;
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}
.ol-popup:before {
  border-top-color: #cccccc;
  border-width: 11px;
  left: 48px;
  margin-left: -11px;
}
.ol-popup-closer {
  text-decoration: none;
  position: absolute;
  top: 2px;
  right: 8px;
}
.ol-popup-closer:after {
  content: "✖";
}
</style>
<script>
import View from "ol/View";
import Map from "ol/Map";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import Fill from "ol/style/Fill";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Circle from "ol/style/Circle";
import Overlay from "ol/Overlay";

import { mobiService, nominatimService } from "../services/dataServices";
import Cache from "../services/cache";

// importing the OpenLayers stylesheet is required for having
// good looking buttons!
import "ol/ol.css";

const cache = new Cache();

export default {
  name: "Map",
  props: ["id", "vehicles"],
  data: () => {
    return {
      locations: [],
      olMap: null,
      vectorLayer: null,
      timerTask: null,
      overlay: null,
      content: null,
    };
  },
  watch: {
    locations: {
      handler: function (val, oldVal) {
        this.updateSource();
      },
      deep: true,
    },
  },
  created() {
    this.fetchData();
  },
  mounted() {
    let $self = this;    

    /**
     * Elements that make up the popup.
     */
    const container = document.getElementById("popup");
    this.content = document.getElementById("popup-content");
    const closer = document.getElementById("popup-closer");

    /**
     * Create an overlay to anchor the popup to the map.
     */
    this.overlay = new Overlay({
      element: container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });

    /**
     * Add a click handler to hide the popup.
     * @return {boolean} Don't follow the href.
     */
    closer.onclick = function () {
      $self.overlay.setPosition(undefined);
      closer.blur();
      return false;
    };

    this.vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [], // the vector layer is now created empty
      }),
    });

    // this is where we create the OpenLayers map
    this.olMap = new Map({
      // the map will be created using the 'map-root' ref
      target: this.$refs["map-root"],
      overlays: [this.overlay],
      layers: [
        // adding a background tiled layer
        new TileLayer({
          source: new OSM(), // tiles are served by OpenStreetMap
        }),
        this.vectorLayer,
      ],

      // the map view will initially show the whole world
      view: new View({
        zoom: 16,
        center: [0, 0],
        constrainResolution: true,
      }),
    });

    /**
     * Add a click handler to the map to render the popup.
     */
    this.olMap.on("singleclick", function (event) {
      if (event.map.hasFeatureAtPixel(event.pixel) === true) {
        var feature = event.map.forEachFeatureAtPixel(
          event.pixel,
          function (feature, layer) {
            return feature;
          }
        );

        $self.showPopup(feature);
      } else {
        $self.overlay.setPosition(undefined);
        closer.blur();
      }
    });

    this.olMap.on("pointermove", function (evt) {
    var hit = evt.map.hasFeatureAtPixel(evt.pixel);
    evt.map.getTargetElement().style.cursor = (hit ? 'pointer' : '');
});

    this.updateSource();

    this.timerTask = setInterval(() => this.fetchData(), 1 * 60000);
  },
  methods: {
    fetchData() {
      let $self = this;

      let data = cache.get(`USER_${$self.id}`);
      if (data) {
        $self.locations = data;

        return;
      }

      mobiService
        .get("api", { params: { op: "getlocations", userid: $self.id } })
        .then(function (response) {
          var data = response.data.data;

          if (data) {
            cache.set(`USER_${$self.id}`, data, 5000);

            $self.locations = data;
          } else {
            $self.$buefy.toast.open({
              message: `Something went wrong, try again`,
              type: "is-danger",
            });
          }
        })
        .catch(function (error) {
          $self.$buefy.toast.open({
            message: `Something went wrong, try again`,
            type: "is-danger",
          });
        });
    },
    updateSource() {
      const view = this.olMap.getView();
      const source = this.vectorLayer.getSource();
      const locations = this.locations;

      var features = [];
      for (var i = 0; i < locations.length; i++) {
        let vehicle = this.vehicles.find(
          (v) => v.vehicleid === locations[i].vehicleid
        );

        var feature = new Feature({
          geometry: new Point(fromLonLat([locations[i].lon, locations[i].lat])),
        });
        feature.setStyle(
          new Style({
            image: new Circle({
              stroke: new Stroke({
                color: "#000",
              }),
              fill: new Fill({
                color: vehicle.color,
              }),
              radius: 6,
            }),
          })
        );
        feature.set("vehicle", vehicle);
        feature.set("location", locations[i]);
        feature.setId(locations[i].vehicleid);

        features.push(feature);
      }

      if (features.length === 0) {
        return;
      }

      source.clear();
      source.addFeatures(features);

      view.fit(source.getExtent(), {
        size: this.olMap.getSize(),
        maxZoom: view.getZoom(),
      });
    },
    vehicleSelected(vehicleId) {
      const source = this.vectorLayer.getSource();
      var feature = source.getFeatureById(vehicleId);
      this.showPopup(feature);
    },
    showPopup(feature) {
      let $self = this;

      let vehicle = feature.get("vehicle");
      let location = feature.get("location");

      let template = `<div class="card">
                        <div class="card-image">
                          <figure class="image">
                            <img src="${vehicle.foto}" alt="vehicle foto">
                          </figure>
                        </div>
                        <div class="card-content">
                          <div class="media" style="margin-bottom: 10px;">      
                            <div class="media-content">
                              <p class="title is-4">${vehicle.make}</p>
                              <p class="subtitle is-6">${vehicle.model}</p>
                            </div>
                          </div>
                          <div class="content">
                            <p><span style="color: #7957d5;"><i class="mdi mdi-map-marker address"></i></span>$display_name$</p>
                            <table class="table is-bordered is-narrow is-striped vehicles" style="margin-top: 6px;">
                              <tr>
                                <td class="has-text-right"><strong>Vin<strong></td>
                                <td>${vehicle.vin}</td>
                              <tr>
                              <tr>
                                <td class="has-text-right"><strong>Year<strong></td>
                                <td>${vehicle.year}</td>
                              <tr>
                            <table>
                          </div>
                        </div>
                      </div>`;

      nominatimService
        .get("reverse", {
          params: {
            lat: location.lat,
            lon: location.lon,
            format: "json",
          },
        })
        .then(function (response) {
          $self.content.innerHTML = template.replace(/\$(.*?)\$/g, function (placeholder) {
            return (response.data[placeholder.substring(1, placeholder.length - 1)] || "N/A");
          });
        })
        .catch(function (error) {
          $self.content.innerHTML = template.replace(/\$(.*?)\$/g, function (placeholder) {
            return "error";
          });
        });

      let coordinate = feature.getGeometry().getCoordinates();

      const view = this.olMap.getView();
      view.setCenter(coordinate);

      this.overlay.setPosition(coordinate);
    },
  },
  beforeDestroy() {
    clearInterval(this.timerTask);
  },
};
</script>
