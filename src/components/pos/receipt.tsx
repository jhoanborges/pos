"use client"

import { Button } from "@/components/ui/button"
import type { CartItem } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Printer, ArrowRight } from "lucide-react"

interface ReceiptProps {
    data: {
        items: CartItem[]
        total: number
        paymentMethod: string
        cashGiven?: number
        change?: number
        timestamp: Date
        receiptNumber: string
    }
    onNewSale: () => void
}

export function Receipt({ data, onNewSale }: ReceiptProps) {
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date)
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <Card className="max-w-md w-full bg-white p-6 print:shadow-none">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold">ACME Store</h1>
                    <p className="text-gray-500 text-sm">123 Main Street, Anytown</p>
                    <p className="text-gray-500 text-sm">Tel: (555) 123-4567</p>
                </div>

                <div className="mb-4 text-sm">
                    <div className="flex justify-between">
                        <span>Receipt #:</span>
                        <span>{data.receiptNumber}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{formatDate(data.timestamp)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <span className="capitalize">{data.paymentMethod}</span>
                    </div>
                </div>

                <div className="border-t border-b py-4 my-4">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2">Item</th>
                                <th className="text-center py-2">Qty</th>
                                <th className="text-right py-2">Price</th>
                                <th className="text-right py-2">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((item) => (
                                <tr key={item.id} className="border-b border-dashed">
                                    <td className="py-2">{item.name}</td>
                                    <td className="text-center py-2">{item.quantity}</td>
                                    <td className="text-right py-2">${item.price.toFixed(2)}</td>
                                    <td className="text-right py-2">${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="space-y-1 text-sm mb-6">
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${data.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>$0.00</span>
                    </div>
                    <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>${data.total.toFixed(2)}</span>
                    </div>

                    {data.paymentMethod === "cash" && (
                        <>
                            <div className="flex justify-between pt-2">
                                <span>Cash given:</span>
                                <span>${data.cashGiven?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Change:</span>
                                <span>${data.change?.toFixed(2)}</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="text-center text-sm text-gray-500 mb-6">
                    <p>Thank you for your purchase!</p>
                    <p>Please come again</p>
                </div>

                <div className="flex gap-2 print:hidden">
                    <Button variant="outline" className="w-full" onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                    </Button>
                    <Button className="w-full" onClick={onNewSale}>
                        New Sale
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </Card>
        </div>
    )
}
