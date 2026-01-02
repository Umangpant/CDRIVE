import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api", // direct backend URL — recommended for debugging
  // timeout: 10000,
});

delete API.defaults.headers.common["Authorization"];
export default API;