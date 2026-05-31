import axios from 'axios'
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { ElMessage, ElLoading } from 'element-plus'

interface RequestConfig extends AxiosRequestConfig {
  loading?: boolean
}

export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message?: string
  msg?: string
}

const defaultConfig: AxiosRequestConfig = {
  baseURL: import.meta.env.VITE_API_URL ?? '',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    Accept: 'application/json, text/plain, */*',
    'user-id': 'emp1001',
  },
  withCredentials: true,
}

class Request {
  private readonly instance: AxiosInstance
  private loadingInstance: ReturnType<typeof ElLoading.service> | null = null

  constructor() {
    this.instance = axios.create(defaultConfig)
    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig & { loading?: boolean }) => {
        if (config.loading) {
          this.showLoading()
        }
        const token = localStorage.getItem('token')
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        this.hideLoading()
        ElMessage.error('请求失败')
        return Promise.reject(error)
      },
    )

    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        this.hideLoading()
        const res = response.data
        if (res.code === 200) {
          return res.data as never
        }
        ElMessage.error(res.message || res.msg || '请求失败')
        return Promise.reject(res)
      },
      (error) => {
        this.hideLoading()
        let msg = '网络异常'
        if (!error.response) {
          msg = '服务器连接失败'
        } else {
          const status = error.response.status
          switch (status) {
            case 401:
              msg = '登录已过期'
              localStorage.removeItem('token')
              break
            case 403:
              msg = '权限不足'
              break
            case 404:
              msg = '接口不存在'
              break
            case 500:
              msg = '服务器错误'
              break
          }
        }
        if (error.message?.includes('timeout')) {
          msg = '请求超时'
        }
        ElMessage.error(msg)
        return Promise.reject(error)
      },
    )
  }

  private showLoading() {
    this.loadingInstance = ElLoading.service({
      lock: true,
      text: '加载中...',
      background: 'rgba(0,0,0,0.05)',
    })
  }

  private hideLoading() {
    this.loadingInstance?.close()
    this.loadingInstance = null
  }

  get<T = unknown>(url: string, config?: RequestConfig) {
    return this.instance.get<T, T>(url, config)
  }

  post<T = unknown>(url: string, data?: unknown, config?: RequestConfig) {
    return this.instance.post<T, T>(url, data, config)
  }

  put<T = unknown>(url: string, data?: unknown, config?: RequestConfig) {
    return this.instance.put<T, T>(url, data, config)
  }

  delete<T = unknown>(url: string, config?: RequestConfig) {
    return this.instance.delete<T, T>(url, config)
  }
}

export default new Request()
