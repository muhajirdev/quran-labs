import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'

export const getServerTheme = createServerFn({ method: 'GET' }).handler(async () => {
    const parsed = getCookie('vite-ui-theme')
    if (parsed === 'light' || parsed === 'dark' || parsed === 'system') {
        return parsed
    }
    return 'system'
})
