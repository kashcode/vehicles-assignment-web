import axios from "axios";

export const mobiService = axios.create({
  baseURL: "http://mobi.connectedcar360.net/",
});

export const nominatimService = axios.create({
  baseURL: "https://nominatim.openstreetmap.org/",
});
