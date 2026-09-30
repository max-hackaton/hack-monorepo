import { createFileRoute } from '@tanstack/react-router'

import { ProfilePage } from '@/modules/profile'

export const Route = createFileRoute('/profile')({ component: ProfilePage })
