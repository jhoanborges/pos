"use client"

import { useState, useEffect } from "react"
import { ProductGrid } from "./product-grid"
import { Cart } from "./cart"
import { Checkout } from "./checkout"
import { Receipt } from "./receipt"
import { useProducts } from "@/lib/swr/useProducts"
import type { CartItem, Product } from "@/lib/types"

export default function PosSystem() {
    const { products, isLoading, isError } = useProducts()
    const [cart, setCart] = useState<CartItem[]>([])
    const [isCheckingOut, setIsCheckingOut] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)
    const [receiptData, setReceiptData] = useState<{
        items: CartItem[]
        total: number
        paymentMethod: string
        cashGiven?: number
        change?: number
        timestamp: Date
        receiptNumber: string
    } | null>(null)

    const addToCart = (product: Product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.id === product.id)
            if (existingItem) {
                return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
            } else {
                return [...prevCart, { ...product, quantity: 1 }]
            }
        })
    }

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id)
            return
        }
        setCart((prevCart) => prevCart.map((item) => (item.id === id ? { ...item, quantity } : item)))
    }

    const removeFromCart = (id: string) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id))
    }

    const clearCart = () => {
        setCart([])
    }

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0)
    }

    const handleCheckout = () => {
        setIsCheckingOut(true)
    }

    const handlePaymentComplete = (paymentDetails: {
        method: string
        cashGiven?: number
        change?: number
    }) => {
        const receiptNumber = `R-${Math.floor(100000 + Math.random() * 900000)}`

        setReceiptData({
            items: [...cart],
            total: calculateTotal(),
            paymentMethod: paymentDetails.method,
            cashGiven: paymentDetails.cashGiven,
            change: paymentDetails.change,
            timestamp: new Date(),
            receiptNumber,
        })

        setIsCompleted(true)
        setIsCheckingOut(false)
    }

    const startNewSale = () => {
        setCart([])
        setIsCompleted(false)
        setReceiptData(null)
    }

    if (isCompleted && receiptData) {
        return <Receipt data={receiptData} onNewSale={startNewSale} />
    }

    return (
        <div className="flex flex-col md:flex-row h-screen">
            <div className="w-full md:w-2/3 p-4">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : isError ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-red-500 text-center">
                            <p className="text-xl font-bold">Error loading products</p>
                            <p>Please try refreshing the page</p>
                        </div>
                    </div>
                ) : (
                    <ProductGrid products={products || []} onAddToCart={addToCart} />
                )}
            </div>
            <div className="w-full md:w-1/3 bg-white border-l border-gray-200">
                {isCheckingOut ? (
                    <Checkout
                        total={calculateTotal()}
                        onCancel={() => setIsCheckingOut(false)}
                        onPaymentComplete={handlePaymentComplete}
                    />
                ) : (
                    <Cart
                        items={cart}
                        onUpdateQuantity={updateQuantity}
                        onRemoveItem={removeFromCart}
                        onClearCart={clearCart}
                        onCheckout={handleCheckout}
                        total={calculateTotal()}
                    />
                )}
            </div>
        </div>
    )
}
