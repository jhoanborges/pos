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
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        type="search"
                        placeholder="Search products..."
                        className="pl-10 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                <TabsList className="bg-white border border-gray-200 p-1 h-auto mb-6">
                    {categories.map((category) => (
                        <TabsTrigger
                            key={category}
                            value={category}
                            className="capitalize px-4 py-2 text-sm font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                        >
                            {category}
                        </TabsTrigger>
                    ))}
                </TabsList>
                <TabsContent value={activeCategory} className="flex-1 mt-2">
                    <div className="grid grid-cols-4 gap-4 overflow-y-auto h-[calc(100vh-200px)]">
                        {filteredProducts.map((product) => (
                            <Card
                                key={product.id}
                                className="cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 bg-white"
                                onClick={() => onAddToCart(product)}
                            >
                                <CardContent className="p-4">
                                    <div className="aspect-square bg-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
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
                                    <div>
                                        <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-gray-900">
                                                $
                                                {typeof product.price === "string"
                                                    ? Number.parseFloat(product.price).toFixed(2)
                                                    : product.price.toFixed(2)}
                                            </span>
                                            <span className="text-xs text-gray-500 uppercase">{product.sku}</span>
                                        </div>
                                        <span className="text-xs text-gray-400">#{product.id}</span>
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
