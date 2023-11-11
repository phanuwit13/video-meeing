import { config } from '@/configs/env'
import axios, { InternalAxiosRequestConfig } from 'axios'

const apiClient = axios.create({
  baseURL: config.apiEndpoint,
})

export { apiClient }
