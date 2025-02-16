import axios from "axios";

export const http = axios.create({
  baseURL: process.env.TRUSTLESS_WORK_API_URL || "",
  timeout: 60000, // 1 minute
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.TRUSTLESS_WORK_API_KEY}`,
  },
});
