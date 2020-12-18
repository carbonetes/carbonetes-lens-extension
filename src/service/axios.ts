import axios  from 'axios';

const axiosInstance = axios.create({
  headers : {
    'Access-Control-Allow-Origin'   : '*',
    'Access-Control-Allow-Headers'  : 'Origin, X-Requested-With, Content-Type',
    'Access-Control-Allow-Methods'  : 'DELETE, GET, OPTIONS, PATCH POST PUT', 
    
  }
});

axiosInstance.interceptors.request.use(
  async (config) => {
    console.log('config : ', config)

    return config;
  },
  (error) => {
    console.log('error : ', error);

    return Promise.reject (error);
  }
);

export default axiosInstance;