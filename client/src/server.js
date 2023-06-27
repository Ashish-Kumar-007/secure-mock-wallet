import axios from "axios";

const server = axios.create({
  // baseURL: "http://localhost:3042",
  baseURL: "https://smw-backend.vercel.app",
});

export default server;
