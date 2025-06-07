"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, CreditCard, Banknote } from "lucide-react"
import { formatPrice } from "@/utils/price"

interface CheckoutProps {
    total: number
    onCancel: () => void
    onPaymentComplete: (details: {
        method: string
        cashGiven?: number
        change?: number
    }) => void
}

export function Checkout({ total, onCancel, onPaymentComplete }: CheckoutProps) {
    const [paymentMethod, setPaymentMethod] = useState<string>("card")
    const [cashAmount, setCashAmount] = useState<string>("")
    const [isProcessing, setIsProcessing] = useState(false)

    const handleCardPayment = () => {
        setIsProcessing(true)
        // Simulate card processing
        setTimeout(() => {
            setIsProcessing(false)
            onPaymentComplete({ method: "card" })
        }, 1500)
    }

    const handleCashPayment = () => {
        const cashGiven = Number.parseFloat(cashAmount)
        if (isNaN(cashGiven) || cashGiven < total) return

        const change = cashGiven - total
        onPaymentComplete({
            method: "cash",
            cashGiven,
            change,
        })
    }

    const calculateChange = () => {
        const cashGiven = Number.parseFloat(cashAmount)
        if (isNaN(cashGiven) || cashGiven < total) return 0
        return cashGiven - total
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center">
                <Button variant="ghost" size="icon" onClick={onCancel} className="mr-2">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Go back</span>
                </Button>
                <h2 className="text-xl font-bold">Checkout</h2>
            </div>

            <div className="flex-1 p-4 overflow-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Payment</CardTitle>
                        <CardDescription>Total amount: ${total.toFixed(2)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="card" value={paymentMethod} onValueChange={setPaymentMethod}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="card">
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Card
                                </TabsTrigger>
                                <TabsTrigger value="cash">
                                    <Banknote className="h-4 w-4 mr-2" />
                                    Cash
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="card" className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-500">Press the button below to process card payment.</p>
                                </div>
                            </TabsContent>
                            <TabsContent value="cash" className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cash-amount">Cash received</Label>
                                    <Input
                                        id="cash-amount"
                                        type="number"
                                        min={total}
                                        step="0.01"
                                        placeholder="Enter amount"
                                        value={cashAmount}
                                        onChange={(e) => setCashAmount(e.target.value)}
                                    />
                                </div>
                                {Number.parseFloat(cashAmount) >= total && (
                                    <div className="p-3 bg-green-50 text-green-700 rounded-md">
                                        <p className="font-medium">Change: {formatPrice(calculateChange())}</p>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                    <CardFooter>
                        {paymentMethod === "card" ? (
                            <Button className="w-full" onClick={handleCardPayment} disabled={isProcessing}>
                                {isProcessing ? "Processing..." : "Process Payment"}
                            </Button>
                        ) : (
                            <Button
                                className="w-full"
                                onClick={handleCashPayment}
                                disabled={!cashAmount || isNaN(Number.parseFloat(cashAmount)) || Number.parseFloat(cashAmount) < total}
                            >
                                Complete Cash Payment
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
