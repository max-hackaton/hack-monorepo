import { Panel } from '@maxhub/max-ui'
import { Outlet, createRootRoute } from '@tanstack/react-router'

import { AppTabBar } from '@/components/AppTabBar'
import { CaseLaunchRedirect } from '@/modules/cases'
import { MaxSessionProvider } from '@/modules/auth'

const RootRoute = () => (
  <Panel mode="secondary" className="min-h-dvh">
    <MaxSessionProvider>
      <CaseLaunchRedirect />
      <Outlet />
      <AppTabBar />
    </MaxSessionProvider>
  </Panel>
)

export const Route = createRootRoute({ component: RootRoute })
