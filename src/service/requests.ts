import axiosInstance from './axios'
axiosInstance.defaults.timeout=2700000;

const CARBONETES_WRAPPER_API = 'https://api.carbonetes.com';

const request = {
  signIn: (data: any) => axiosInstance.post(
    CARBONETES_WRAPPER_API + '/auth/signin',
    data
  ),

  getAndReloadCompayRegistry: (config: any) =>  axiosInstance.get(
    CARBONETES_WRAPPER_API + '/api/v1/company_registry/by_uri',
    config
  ),

  getRegistries: (config: any) => axiosInstance.get(
    CARBONETES_WRAPPER_API + '/api/v1/company_registry',
    config
  ),
  reloadRegistry: (config: any) => axiosInstance.post(
    CARBONETES_WRAPPER_API + '/api/v1/company_registry/reload_by_registryUri',
    {
      ...config.data,
    },
    {
      headers: config.headers
    }

  ),
  checkAnalysisResult: (config: any) => axiosInstance.get(
    // CARBONETES_WRAPPER_API + '/api/v1/analysis/full-tag',
    CARBONETES_WRAPPER_API + '/api/v1/analysis/current-image',
    config
  ),
  analyzeImage: (data: any) => axiosInstance.post(
    CARBONETES_WRAPPER_API + '/api/v1/analysis/',
    data
  ),
  getAnalysisResult: (data: any) => axiosInstance.post(
    CARBONETES_WRAPPER_API + '/api/v1/analysis/get-result',
    data
  ),
}

export default request;