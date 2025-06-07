"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, CreditCard } from "lucide-react"

interface PaymentProcessingModalProps {
    isOpen: boolean
    onCancel: () => void
    total: number
}

export function PaymentProcessingModal({ isOpen, onCancel, total }: PaymentProcessingModalProps) {
    const [isCancelling, setIsCancelling] = useState(false)

    const handleCancel = async () => {
        setIsCancelling(true)

        try {
            // Simulate API call to cancel transaction
            await new Promise((resolve) => setTimeout(resolve, 1500))

            // Here you would make the actual axios request to cancel
            // await axios.post('/api/mercadopago/cancel-transaction', { transactionId })

            onCancel()
        } catch (error) {
            console.error("Failed to cancel transaction:", error)
            // Handle error - maybe show error message
        } finally {
            setIsCancelling(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 bg-transparent flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white">
                <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <CreditCard className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    <CardTitle className="text-xl font-semibold">Processing Payment</CardTitle>
                    <p className="text-gray-600">Amount: ${total.toFixed(2)}</p>
                </CardHeader>

                <CardContent className="text-center space-y-6">
                    {/* Lottie Animation Placeholder - You can replace this with actual Lottie */}
                    <div className="flex justify-center">
                        <div className="w-24 h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-lg font-medium text-gray-900">Please wait...</p>
                        <p className="text-sm text-gray-500">Processing your card payment. This may take a few moments.</p>
                    </div>

                    <div className="pt-4">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isCancelling}
                            className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                        >
                            {isCancelling ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin mr-2"></div>
                                    Cancelling...
                                </>
                            ) : (
                                <>
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel Transaction
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="text-xs text-gray-400 pt-2">Do not close this window or navigate away</div>
                </CardContent>
            </Card>
        </div>
    )
}
