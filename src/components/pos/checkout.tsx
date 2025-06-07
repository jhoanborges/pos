"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, CreditCard, Banknote } from "lucide-react"
import { formatPrice } from "@/utils/price"
import { axios } from "@/lib/axios"
import { useAppSelector } from "@/redux/hooks"
import { PaymentProcessingModal } from "./payment-processing-modal"
import useEcho from "@/hooks/echo"
import { useSession } from "next-auth/react"
import { toast } from "react-toastify"

interface CheckoutProps {
    total: number
    cartItems: Array<{
        id: string | number
        name: string
        price: number
        quantity: number
        sku?: string
    }>
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
    const [error, setError] = useState<string | null>(null)
    const [showProcessingModal, setShowProcessingModal] = useState(false)
    const echo = useEcho()
    const { data: session } = useSession()

    const cartItems = useAppSelector((state) => state.cart.items)

    const handleCancelPayment = () => {
        setShowProcessingModal(false)
        setIsProcessing(false)
        // Reset any payment state if needed
    }


    const handleCardPayment = async () => {
        setIsProcessing(true)

        setShowProcessingModal(true)
        try {
            // Prepare the payload with required fields
            const payload = {
                items: cartItems.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    name: item.name,
                    sku: item.sku
                })),
                payment_method: 'card',
                total_amount: total,
                // Add any additional fields required by your API
            }

            // Make the API call
            const response = await axios.post('/api/mercadopago/orders', payload, {
                headers: {
                    'Content-Type': 'application/json',
                    // Add any required authentication headers
                }
            })

            // If the API call is successful, complete the payment
            if (response.status === 200 || response.status === 201) {
                //just call if we get events
                //operacion procesada esperando backend aca
                //onPaymentComplete({ method: "card", paymentId: response.data.id })

            } else {
                throw new Error('Payment failed')
            }
        } catch (err: any) {
            console.error('Payment error:', err)
            console.log(err.response)
            if (err.response) {
                // The request was made and the server responded with a status code
                const { data } = err.response

                // Handle 409 Conflict specifically
                if (err.response.status === 409) {
                    const errorMessage = data?.error?.errors?.[0]?.message ||
                        data?.message ||
                        'There is already a pending order on the terminal'
                    toast.error(errorMessage, {
                        autoClose: 5000,
                        position: 'top-right',
                    })
                }
                // Handle other error statuses
                else {
                    const errorMessage = data?.message || 'Payment processing failed'
                    toast.error(errorMessage, {
                        autoClose: 5000,
                        position: 'top-right',
                    })
                }
            }
            // Network errors or other issues
            else if (err.request) {
                toast.error('Network error. Please check your connection.', {
                    autoClose: 5000,
                    position: 'top-right',
                })
            }
            // Other errors
            else {
                toast.error(err.message || 'An unexpected error occurred', {
                    autoClose: 5000,
                    position: 'top-right',
                })
            }

            setError('Payment processing failed. Please try again.')
        }
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


    useEffect(() => {
        if (!session?.user?.id || !echo || !session) return;

        const channel = echo.private(`transaction.${session.user.id}`)
            .listen('.transaction.received', (event: any) => {
                console.log('Transaction updated:', event);
                //if (event.transaction.status === 'processed') {
                onPaymentComplete({
                    method: "card",
                    cashGiven: total,
                    change: calculateChange(),
                })
                //}
            })
            .subscribed(() => {
                console.log('Subscribed to channel transactions');
            })
            .error((error: any) => {
                console.error('Error subscribing to channel:', error);
            });

        return () => {
            channel.stopListening('.transaction.received');
        };
    }, [session, echo]);


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
            <PaymentProcessingModal isOpen={showProcessingModal} onCancel={handleCancelPayment} total={total} />
        </div>
    )
}
