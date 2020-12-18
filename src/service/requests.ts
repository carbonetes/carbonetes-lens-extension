import axiosInstance from './axios'

const CARBONETES_API = 'https://api-vulnerability.carbonetes.com';
const CARBONETES_WRAPPER_API = 'https://api.carbonetes.com';

const request = {
  signIn: (data: any) => axiosInstance.post(
    CARBONETES_API + '/auth/signin',
    data
  ),
  analyzeImage: (data: any) => axiosInstance.post(
    CARBONETES_WRAPPER_API + '/analyze',
    data
  ),
  getAnalysisResult: (data: any) => axiosInstance.post(
    CARBONETES_WRAPPER_API + '/get-result',
    data
  ),
  checkAnalysisResult: (config: any) => axiosInstance.get(
    CARBONETES_WRAPPER_API + '/api/v1/analysis/full-tag',
    config
  )
}

export default request;