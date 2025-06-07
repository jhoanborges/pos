// src/components/pos/product-grid.tsx
import { useCallback, useEffect, useRef, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Product } from "@/lib/types"
import Image from "next/image"
import { Search } from "lucide-react"
import { useInfiniteProducts } from "@/lib/swr/useInfiniteProducts"
import { useDebounce } from 'use-debounce'
import { formatPrice } from '@/utils/price'
import { Loader2 } from 'lucide-react'
interface ProductGridProps {
    onAddToCart: (product: Product) => void
}

export function ProductGrid({ onAddToCart }: ProductGridProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearch] = useDebounce(searchQuery, 500) // 500ms debounce
    const [activeCategory, setActiveCategory] = useState("all")
    const loader = useRef<HTMLDivElement>(null)

    const {
        products,
        size,
        setSize,
        isLoadingMore,
        isReachingEnd,
        error,
        meta
    } = useInfiniteProducts(debouncedSearch)

    // Filter products by category (client-side)
    const filteredProducts = products.filter((product) => {
        const productCategory = typeof product.category === 'object'
            ? product.category?.name
            : product.category || 'Uncategorized'
        return activeCategory === "all" || productCategory === activeCategory
    })

    // Extract unique categories
    const categories = ["all", ...Array.from(
        new Set(products.flatMap(p =>
            typeof p.category === 'object'
                ? p.category?.name
                : p.category || 'Uncategorized'
        ).filter(Boolean))
    )]

    // Infinite scroll handler
    const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
        const target = entries[0]
        if (target.isIntersecting && !isLoadingMore && !isReachingEnd) {
            setSize(size + 1)
        }
    }, [isLoadingMore, isReachingEnd, setSize, size])

    // Set up intersection observer
    useEffect(() => {
        const option = {
            root: null,
            rootMargin: "20px",
            threshold: 0
        }

        const observer = new IntersectionObserver(handleObserver, option)
        if (loader.current) observer.observe(loader.current)

        return () => {
            if (loader.current) observer.unobserve(loader.current)
        }
    }, [handleObserver])

    if (error) return <div>Failed to load products</div>

    return (
        <div className="flex flex-col h-full">
            <div className="sticky top-0 z-10 bg-background p-4">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search products..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {!searchQuery && (
                    <Tabs
                        value={activeCategory}
                        onValueChange={setActiveCategory}
                        className="w-full"
                    >
                        <TabsList className="w-full overflow-x-auto">
                            {categories.map((category) => (
                                <TabsTrigger key={category || "all"} value={category || "all"} className="whitespace-nowrap">
                                    {category || "all"}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {searchQuery && (
                    <div className="mb-4 text-sm text-muted-foreground">
                        {meta?.total} results for "{searchQuery}"
                    </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredProducts.map((product, index) => (
                        <Card
                            key={`${product.id}-${index}-${product.sku}`}
                            className="cursor-pointer hover:border-primary transition-colors h-full flex flex-col"
                            onClick={() => onAddToCart(product)}
                        >
                            <CardContent className="p-3 flex flex-col flex-1">
                                <div className="w-full aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                                    {product.image_url ? (
                                        <Image
                                            src={product.image_url}
                                            alt={product.name}
                                            width={400}
                                            height={400}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="text-gray-400 text-xs text-center p-2">No image</div>
                                    )}
                                </div>
                                <div className="mt-2">
                                    <h3 className="font-medium text-sm line-clamp-2 h-10" title={product.name}>
                                        {product.name}
                                    </h3>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-sm font-bold">
                                            ${formatPrice(product.price)}
                                        </span>
                                        <span className="text-xs text-gray-500">{product.sku}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div ref={loader} className="w-full py-4">
                    {isLoadingMore && !isReachingEnd && (
                        <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Loading more products...</span>
                        </div>
                    )}
                    {isReachingEnd && products.length > 0 && (
                        <div className="text-center text-sm text-muted-foreground py-4">
                            {searchQuery && meta?.total === 0
                                ? `No products found for "${searchQuery}"`
                                : "You've reached the end"}
                        </div>
                    )}
                    {!isLoadingMore && products.length === 0 && !isReachingEnd && (
                        <div className="text-center text-muted-foreground py-4">
                            No products found
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}