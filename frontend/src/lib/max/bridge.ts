import type { MaxWebApp } from './types'

declare global {
  interface Window {
    WebApp?: MaxWebApp
  }
}

export type MaxBridge = {
  initData: string
  startParam?: string
}

export function getMaxBridge(): MaxBridge | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  const initData = window.WebApp?.initData

  if (!initData) {
    return undefined
  }

  return {
    initData,
    startParam: new URLSearchParams(initData).get('start_param') ?? undefined,
  }
}
