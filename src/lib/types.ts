export interface Category {
    id: number
    name: string
    description: string
    created_at: string
    updated_at: string
}

export interface PaginatedResponse<T> {
    data: T[]
    current_page: number
    last_page: number
    per_page: number
    total: number
    next_page_url: string | null
    prev_page_url: string | null
}
export interface ProductResponse extends PaginatedResponse<Product> {
    // Additional product-specific response fields if needed
}
export interface Product {
    id: number
    name: string
    price: number | string // Can be either number or string from API
    category: Category | string | null
    sku: string
    image?: string
    image_url?: string
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
