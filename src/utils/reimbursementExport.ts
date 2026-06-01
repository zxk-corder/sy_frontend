import axios from 'axios'
import { ElLoading, ElMessage } from 'element-plus'
import { exportReimAsync, getExportStatus } from '@/api/reim/main'
import type { ExportStatusResult } from '@/api/types/reim'
import type { ReimbursementQuery } from '@/types/reimbursement'
import { toExportQueryParams } from '@/utils/reimbursementApiMapper'

const POLL_INTERVAL_MS = 2000
const MAX_POLL_COUNT = 150

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function resolveDownloadUrl(taskId: string, downloadUrl?: string) {
  const base = import.meta.env.VITE_API_URL ?? '/api'
  if (downloadUrl) {
    return downloadUrl.startsWith('http')
      ? downloadUrl
      : `${base}${downloadUrl.startsWith('/') ? downloadUrl : `/${downloadUrl}`}`
  }
  return `${base}/fccapi/REIM_ExportDownload?taskId=${taskId}`
}

function parseFilename(contentDisposition?: string, fallback?: string) {
  if (!contentDisposition) return fallback ?? '报销单导出.xlsx'
  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition)
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1])
  }
  const asciiMatch = /filename="?([^";]+)"?/i.exec(contentDisposition)
  return asciiMatch?.[1] ?? fallback ?? '报销单导出.xlsx'
}

async function downloadExportFile(taskId: string, downloadUrl?: string) {
  const url = resolveDownloadUrl(taskId, downloadUrl)
  const res = await axios.get(url, {
    responseType: 'blob',
    headers: {
      'user-id': 'emp1001',
    },
    withCredentials: true,
  })

  const blob = res.data as Blob
  const filename = parseFilename(
    res.headers['content-disposition'] as string | undefined,
    `Reimbursement_Export_${taskId}.xlsx`,
  )
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(objectUrl)
}

/** 按当前列表筛选条件发起异步导出并轮询下载 */
export async function runReimbursementListExport(query: ReimbursementQuery) {
  const loading = ElLoading.service({
    lock: true,
    text: '正在提交导出任务...',
    background: 'rgba(0,0,0,0.05)',
  })

  try {
    const { taskId } = await exportReimAsync(toExportQueryParams(query))
    if (!taskId) {
      throw new Error('未获取到导出任务 ID')
    }

    for (let i = 0; i < MAX_POLL_COUNT; i++) {
      if (i > 0) {
        await sleep(POLL_INTERVAL_MS)
      }

      const status: ExportStatusResult = await getExportStatus(taskId)
      const progress = status.progress ?? 0

      if (status.status === 'SUCCESS') {
        loading.setText('导出完成，正在下载...')
        await downloadExportFile(taskId, status.downloadUrl)
        ElMessage.success(status.message ?? '导出成功')
        return
      }

      if (status.status === 'FAILED') {
        throw new Error(status.errorMsg ?? '导出失败')
      }

      loading.setText(`导出处理中 ${progress}%`)
    }

    throw new Error('导出超时，请稍后重试')
  } finally {
    loading.close()
  }
}
