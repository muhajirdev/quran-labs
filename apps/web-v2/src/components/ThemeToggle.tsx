import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import { Monitor, Moon, Sun } from 'lucide-react'

// 1. Define the Server Action
export const toggleThemeAction = createServerFn({ method: 'POST' }).handler(
    async () => {
        // Read current directly via Tanstack API
        const currentTheme = getCookie('vite-ui-theme') || 'system'

        // Cycle logic
        let nextTheme = 'system'
        if (currentTheme === 'system') nextTheme = 'light'
        else if (currentTheme === 'light') nextTheme = 'dark'
        else nextTheme = 'system'

        // Set the new cookie using Tanstack API
        setCookie('vite-ui-theme', nextTheme, {
            path: '/',
            maxAge: 31536000,
            sameSite: 'strict',
        })

        // Return the new theme
        return nextTheme
    }
)

// 2. Define the Pure HTML Form Component
export function ThemeToggle({ currentTheme }: { currentTheme: 'light' | 'dark' | 'system' }) {
    return (
        <form
            action={toggleThemeAction.url}
            method="POST"
            className="inline-block"
        >
            <button
                type="submit"
                className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title={`Current theme: ${currentTheme}. Click to change.`}
                aria-label="Toggle theme"
            >
                {currentTheme === 'system' ? (
                    <Monitor size={20} className="text-gray-500 dark:text-gray-400" />
                ) : currentTheme === 'light' ? (
                    <Sun size={20} className="text-orange-400" />
                ) : (
                    <Moon size={20} className="text-slate-300" />
                )}
            </button>
        </form>
    )
}
