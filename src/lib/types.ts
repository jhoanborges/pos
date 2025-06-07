export interface Product {
    id: number
    name: string
    price: number | string // Can be either number or string from API
    category: string | null
    sku: string
    image?: string
    description?: string
    clinic_id?: number
    created_at?: string
    updated_at?: string
    category_id?: number | null
    stock?: number
    clinic?: {
        id: number
        name: string
        address: string
        zip: string
        phone: string
        stripe_id: string | null
        created_at: string
        updated_at: string
    } | null
    inventory_transaction_products?: any[]
}

export interface CartItem extends Product {
    quantity: number
}
