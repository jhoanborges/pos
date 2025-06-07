"use client"

import { useState } from "react"
import { ProductGrid } from "./product-grid"
import { Cart } from "./cart"
import { Checkout } from "./checkout"
import { Receipt } from "./receipt"
import { useProducts } from "@/lib/swr/useProducts"
import type { CartItem, Product } from "@/lib/types"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { addItem, removeItem, updateQuantity, clearCart } from "@/redux/slices/cartSlice"

export default function PosSystem() {
    const router = useRouter()
    const { products, isLoading, isError } = useProducts()
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

    const dispatch = useAppDispatch()
    const cartItems = useAppSelector((state) => state.cart.items)

    const addToCart = (product: Product) => {
        dispatch(
            addItem({
                id: product.id,
                name: product.name,
                price: Number(product.price),
                quantity: 1,
                sku: product.sku || "",
            }),
        )
    }

    const updateCartItemQuantity = (productId: string | number, quantity: number) => {
        if (quantity <= 0) {
            dispatch(removeItem(productId))
        } else {
            dispatch(updateQuantity({ id: productId, quantity }))
        }
    }

    const removeFromCart = (productId: string | number) => {
        dispatch(removeItem(productId))
    }

    const handleClearCart = () => {
        dispatch(clearCart())
    }

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            return total + Number(item.price) * item.quantity
        }, 0)
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
            items: [...cartItems],
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
        handleClearCart()
        setIsCompleted(false)
        setReceiptData(null)
    }

    if (isCompleted && receiptData) {
        console.log('Opening receipt page', `/app/receipt/${receiptData.receiptNumber}`)
        window.open(`/app/receipt/${receiptData.receiptNumber}`, '_blank')
        setReceiptData(null)
        setIsCompleted(true)
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
                        items={cartItems}
                        onUpdateQuantity={updateCartItemQuantity}
                        onRemoveItem={removeFromCart}
                        onClearCart={handleClearCart}
                        onCheckout={handleCheckout}
                        total={calculateTotal()}
                    />
                )}
            </div>
        </div>
    )
}
