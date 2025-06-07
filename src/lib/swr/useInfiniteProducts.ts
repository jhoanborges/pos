// src/lib/swr/useInfiniteProducts.ts
import useSWRInfinite from 'swr/infinite'
import { ProductResponse } from '@/lib/types'
import { axios } from '@/lib/axios'

const PAGE_SIZE = 100

export function useInfiniteProducts(searchQuery: string = '') {
    const getKey = (
        pageIndex: number,
        previousPageData: ProductResponse | null,
    ) => {
        // Reached the end
        if (previousPageData && pageIndex + 1 > previousPageData.meta.last_page)
            return null

        // First page
        if (pageIndex === 0) {
            return `/api/products/infinite?per_page=${PAGE_SIZE}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`
        }

        // Subsequent pages
        return `/api/products/infinite?page=${pageIndex + 1}&per_page=${PAGE_SIZE}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`
    }

    const { data, error, size, setSize, isValidating, mutate } =
        useSWRInfinite<ProductResponse>(
            getKey,
            async (url: string) => {
                const response = await axios.get(url)
                return response.data
            },
            {
                revalidateOnMount: true, // Only revalidate if no cache
                revalidateOnFocus: false, // Don't revalidate on window focus
                revalidateIfStale: false, // Don't revalidate if data is stale
                dedupingInterval: 60000, // Don't make the same request within 60 seconds
                keepPreviousData: true, // Keep previous data while loading new data
            },
        )

    const products = data?.flatMap(page => page.data) || []
    const isLoadingInitialData = !data && !error
    const isLoadingMore =
        isLoadingInitialData ||
        (size > 0 && data && typeof data[size - 1] === 'undefined')
    const isEmpty = data?.[0]?.data.length === 0
    const isReachingEnd =
        isEmpty ||
        (data &&
            data[data.length - 1]?.meta.current_page >=
                data[data.length - 1]?.meta.last_page)
    const isRefreshing = isValidating && data && data.length === size

    return {
        products,
        error,
        size,
        setSize,
        isLoadingMore,
        isReachingEnd,
        isRefreshing,
        isEmpty,
        meta: data?.[data.length - 1]?.meta,
        mutate,
    }
}
