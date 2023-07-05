import axios from "axios";

const server = axios.create({
  // baseURL: "http://localhost:3042",
  baseURL: "api-smw.vercel.app",
});

export default server;