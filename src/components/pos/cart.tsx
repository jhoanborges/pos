"use client"

import { Button } from "@/components/ui/button"
import type { CartItem } from "@/lib/types"
import { Minus, Plus, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatPrice } from '@/utils/price'
import { customSignOut } from "@/utils/auth-utils"

interface CartProps {
    items: CartItem[]
    onUpdateQuantity: (id: string, quantity: number) => void
    onRemoveItem: (id: string) => void
    onClearCart: () => void
    onCheckout: () => void
    total: number
}

export function Cart({ items, onUpdateQuantity, onRemoveItem, onClearCart, onCheckout, total }: CartProps) {
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold">Current Sale</h2>
            </div>

            {items.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center text-gray-500">
                        <p>No items in cart</p>
                        <p className="text-sm">Add products to begin a sale</p>
                    </div>
                </div>
            ) : (
                <>
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-sm truncate">{item.name}</h3>
                                        <p className="text-sm text-gray-500">${formatPrice(item.price)} each</p>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-4">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                        >
                                            <Minus className="h-3 w-3" />
                                            <span className="sr-only">Decrease quantity</span>
                                        </Button>
                                        <span className="w-8 text-center">{item.quantity}</span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                        >
                                            <Plus className="h-3 w-3" />
                                            <span className="sr-only">Increase quantity</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => onRemoveItem(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Remove item</span>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t bg-gray-50">
                        <div className="flex justify-between mb-2">
                            <span className="font-medium">Subtotal</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span className="font-medium">Tax</span>
                            <span>$0.00</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold mb-6">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" onClick={onClearCart} className="w-full">
                                Clear
                            </Button>
                            <Button onClick={onCheckout} className="w-full" disabled={items.length === 0}>
                                Checkout
                            </Button>

                            <Button onClick={customSignOut} className="w-full">
                                Logout
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
