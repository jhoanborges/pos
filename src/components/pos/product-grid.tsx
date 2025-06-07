"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Product } from "@/lib/types"
import { Search } from "lucide-react"

interface ProductGridProps {
    products: Product[]
    onAddToCart: (product: Product) => void
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [activeCategory, setActiveCategory] = useState("all")

    // Filter out null categories and convert to array of unique categories
    const categories = ["all", ...Array.from(new Set(products.map((p) => p.category || "Uncategorized").filter(Boolean)))]


    const filteredProducts = products.filter((product) => {
        const searchLower = searchQuery.toLowerCase()
        const matchesSearch =
            product.name.toLowerCase().includes(searchLower) ||
            (product.sku && product.sku.toLowerCase().includes(searchLower))

        const productCategory = product.category || "Uncategorized"
        const matchesCategory = activeCategory === "all" || productCategory === activeCategory

        return matchesSearch && matchesCategory
    })

    return (
        <div className="flex flex-col h-full">
            <div className="mb-4 flex items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        type="search"
                        placeholder="Search products..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Tabs
                defaultValue="all"
                value={activeCategory}
                onValueChange={setActiveCategory}
                className="flex-1 flex flex-col"
            >
                <TabsList className="grid grid-flow-col auto-cols-max gap-2 overflow-x-auto py-1 px-0 h-auto">
                    {categories.map((category) => (
                        <TabsTrigger key={category} value={category} className="capitalize px-3 py-1.5">
                            {category}
                        </TabsTrigger>
                    ))}
                </TabsList>
                <TabsContent value={activeCategory} className="flex-1 mt-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto h-[calc(100vh-180px)]">
                        {filteredProducts.map((product) => (
                            <Card
                                key={product.id}
                                className="cursor-pointer hover:border-primary transition-colors"
                                onClick={() => onAddToCart(product)}
                            >
                                <CardContent className="p-2 flex flex-col items-center">
                                    <div className="w-full aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                                        {product.image ? (
                                            <img
                                                src={product.image || "/placeholder.svg"}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-gray-400 text-xs text-center p-2">No image</div>
                                        )}
                                    </div>
                                    <div className="w-full">
                                        <h3 className="font-medium text-sm truncate">{product.name}</h3>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-sm font-bold">${typeof product.price === 'string' ? parseFloat(product.price).toFixed(2) : product.price.toFixed(2)}</span>
                                            <span className="text-xs text-gray-500">{product.sku}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">#{product.id}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {filteredProducts.length === 0 && (
                            <div className="col-span-full text-center py-10 text-gray-500">No products found</div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}