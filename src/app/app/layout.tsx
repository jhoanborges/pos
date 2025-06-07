// app/layout.tsx
"use client"
import '@/app/globals.css'
import { SessionProvider } from 'next-auth/react';
import { Session } from "@auth/core/types";

interface RootLayoutClientProps {
    children: React.ReactNode;
    session: Session | null;
}

export default function AppLayout({ children, session }: RootLayoutClientProps) {
    return (
        <SessionProvider session={session}>
            {children}
        </SessionProvider>
    )
}