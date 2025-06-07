'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Receipt as ReceiptComponent } from '@/components/pos/receipt'

interface ReceiptData {
    items: Array<{
        id: string | number
        name: string
        price: number
        quantity: number
        sku?: string
    }>
    total: number
    paymentMethod: string
    cashGiven?: number
    change?: number
    timestamp: string
    receiptNumber: string
}

export default function ReceiptPage() {
    const params = useParams()
    const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)

    
    useEffect(() => {
        const savedReceipt = sessionStorage.getItem('currentReceipt')
        if (savedReceipt) {
            try {
                const data = JSON.parse(savedReceipt)
                // Verify the receipt ID matches the URL
                if (data.receiptNumber === params.receiptId) {
                    setReceiptData(data)
                    return
                }
            } catch (e) {
                console.error('Error parsing receipt data:', e)
            }
        }
    }, [params.receiptId])

    /*
        if (!receiptData) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            )
        }
    */
    return <ReceiptComponent
        data={{
            ...receiptData,
            timestamp: new Date(receiptData?.timestamp || new Date().toISOString()),
            items: receiptData?.items || [],
            total: receiptData?.total || 0,
            paymentMethod: receiptData?.paymentMethod || '',
            cashGiven: receiptData?.cashGiven || 0,
            change: receiptData?.change || 0,
            receiptNumber: receiptData?.receiptNumber || ''
        }}
    />
}