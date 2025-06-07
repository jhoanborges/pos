// src/redux/slices/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface CartItem {
    id: string | number
    name: string
    price: number
    quantity: number
    sku?: string
}

interface CartState {
    items: CartItem[]
}

const initialState: CartState = {
    items: [],
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addItem: (
            state,
            action: PayloadAction<
                Omit<CartItem, 'quantity'> & { quantity?: number }
            >,
        ) => {
            const existingItem = state.items.find(
                item => item.id === action.payload.id,
            )
            if (existingItem) {
                existingItem.quantity += action.payload.quantity || 1
            } else {
                state.items.push({
                    ...action.payload,
                    quantity: action.payload.quantity || 1,
                })
            }
        },
        removeItem: (state, action: PayloadAction<string | number>) => {
            state.items = state.items.filter(item => item.id !== action.payload)
        },
        updateQuantity: (
            state,
            action: PayloadAction<{ id: string | number; quantity: number }>,
        ) => {
            const item = state.items.find(item => item.id === action.payload.id)
            if (item) {
                item.quantity = action.payload.quantity
            }
        },
        clearCart: state => {
            state.items = []
        },
    },
})

export const { addItem, removeItem, updateQuantity, clearCart } =
    cartSlice.actions
export default cartSlice.reducer
