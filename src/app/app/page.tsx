"use client"
import PosSystem from "@/components/pos/pos-system"
import useEcho from "@/hooks/echo"
import { useState } from "react"
import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useAxios } from '@/hooks/useAxios';

export default function Home() {
    const echo = useEcho()
    const axios = useAxios();

    const [unreadMessages, setUnreadMessages] = useState<number>(0)
    const [messages, setMessages] = useState<any[]>([])

    const { data: session } = useSession()

    const handleEchoCallback = () => {
        setUnreadMessages((prevUnread) => prevUnread + 1);
    };

    useEffect(() => {
        if (!session?.user?.id || !echo || !session) return;

        const channel = echo.private(`notification.${session.user.id}`)
            .listen('.notification.received', (event: any) => {
                console.log('Notification received:', event);
                handleEchoCallback();
            })
            .subscribed(() => {
                console.log('Successfully subscribed to channel');
            })
            .error((error: any) => {
                console.error('Error subscribing to channel:', error);
            });

        const fetchUnreadMessages = async () => {
            try {
                const response = await axios.post('/api/get-unread-messages', {
                    email: session.user.email,
                });
                // Ensure response.data is an array, fallback to 0 if not
                const count = Array.isArray(response.data) ? response.data.length : 0;
                setUnreadMessages(count);
                setMessages(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('Error fetching unread messages:', error);
                // Set fallback values on error
                setUnreadMessages(0);
                setMessages([]);
            }
        };

        fetchUnreadMessages();

        return () => {
            channel.stopListening('.notification.received');
        };
    }, [session, echo]);

    return (
        <main className="min-h-screen bg-gray-100">
            <PosSystem />
        </main>
    )
}
