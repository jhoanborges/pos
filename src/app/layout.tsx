// app/layout.tsx
import '@/app/globals.css'
import { ReduxProvider } from '@/redux/Provider'
import { auth } from '@/auth'
import { ToastContainer } from 'react-toastify'


export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    return (
        <html lang="en">
            <body>
                <ReduxProvider>
                    <ToastContainer />
                    {children}
                </ReduxProvider>
            </body>
        </html>
    )
}