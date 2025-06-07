// src/lib/utils/price.ts
export function formatPrice(price: string | number): string {
    const priceNum = typeof price === 'string' ? parseFloat(price) : price
    return priceNum.toFixed(2)
}
