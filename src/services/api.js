// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:3001/api",
//   withCredentials: true,
// });

// export default api;

import axios from "axios";

const api = axios.create({
  baseURL: "https://school-management-system-backend-8tjk.onrender.com/api",
  withCredentials: true,
});

export default api;
