import axios from "axios";

const server = axios.create({
  // baseURL: "http://localhost:3042",
  baseURL: "https://api-smw-1.vercel.app",
});

export default server;