import axios from "axios";

const http = axios.create({
  baseURL: process.env.TRUSTLESS_WORK_API_URL || "",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.TRUSTLESS_WORK_API_KEY}`,
  },
});

export default http;
