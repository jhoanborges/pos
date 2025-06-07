// app/layout.tsx
import '@/app/globals.css'
import { ReduxProvider } from '@/redux/Provider'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <ReduxProvider>
                    {children}
                </ReduxProvider>
            </body>
        </html>
    )
}