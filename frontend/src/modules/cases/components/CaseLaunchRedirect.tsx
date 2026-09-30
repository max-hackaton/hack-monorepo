import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { getMaxBridge } from '@/lib/max/bridge'

let launchHandled = false

export const CaseLaunchRedirect = () => {
  const navigate = useNavigate()

  useEffect(() => {
    if (launchHandled) return
    launchHandled = true

    const match = /^case_([1-9]\d{0,18})$/.exec(
      getMaxBridge()?.startParam ?? '',
    )
    if (!match) return

    navigate({
      to: '/cases/$id',
      params: { id: match[1] },
      replace: true,
    })
  }, [navigate])

  return null
}
