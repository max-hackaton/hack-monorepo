import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MaxUI, useColorScheme } from '@maxhub/max-ui'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import '@maxhub/max-ui/dist/styles.css'
import './styles.css'
import { queryClient } from './lib/query/queryClient'
import { router } from './router'

const AppTheme = () => {
  const colorScheme = useColorScheme()

  return (
    <div className="app-theme min-h-dvh" data-app-theme={colorScheme}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
      <div id="modal-root" />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MaxUI>
      <AppTheme />
    </MaxUI>
  </StrictMode>,
)
