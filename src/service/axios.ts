import axios  from 'axios';
axios.defaults.timeout = 200000;

const axiosInstance = axios.create({
  timeout: 200000,
  headers : {
    'Access-Control-Allow-Origin'   : '*',
    'Access-Control-Allow-Headers'  : 'Origin, X-Requested-With, Content-Type',
    'Access-Control-Allow-Methods'  : 'DELETE, GET, OPTIONS, PATCH POST PUT',  
  }
});

axiosInstance.interceptors.request.use(
  async (config) => {
    return config;
  },
  (error) => {
    return Promise.reject (error);
  }
);

export default axiosInstance;