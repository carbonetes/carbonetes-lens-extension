import axiosInstance from './axios'

const CARBONETES_WRAPPER_API = 'https://api.carbonetes.com';

const request = {
  signIn: (data: any) => axiosInstance.post(
    CARBONETES_WRAPPER_API + '/auth/signin',
    data
  ),
  getRegistries: (config: any) => axiosInstance.get(
    CARBONETES_WRAPPER_API + '/api/v1/company-registry/by_email',
    config
  ),
  reloadRegistry: (config: any) => axiosInstance.post(
    CARBONETES_WRAPPER_API + '/api/v1/repo-image/reload_by_registryUri',
    {
      ...config.data,
    },
    {
      headers: config.headers
    }

  ),
  checkAnalysisResult: (config: any) => axiosInstance.get(
    CARBONETES_WRAPPER_API + '/api/v1/analysis/full-tag',
    config
  ),
  analyzeImage: (data: any) => axiosInstance.post(
    CARBONETES_WRAPPER_API + '/api/v1/analysis/analyze',
    data
  ),
  getAnalysisResult: (data: any) => axiosInstance.post(
    CARBONETES_WRAPPER_API + '/api/v1/analysis/get-result',
    data
  ),
}

export default request;