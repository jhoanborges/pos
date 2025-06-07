import useSWR from 'swr';
import { axios, setBearerToken } from '../axios';
import type { Product } from '../types';

// Define the response type from the API
interface ProductsResponse {
  data: Product[];
  status: number;
  message: string;
}

// Direct fetcher function using axios
const fetcher = async (url: string) => {
  // Get the token from localStorage if we're in the browser
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      setBearerToken(token);
    }
  }
  
  const response = await axios.get(url);
  console.log('Products response:', response.data);
  return response.data;
};

export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR<ProductsResponse>(
    '/api/products',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  // Transform products to ensure price is a number and handle category object
  const transformedProducts = data?.data?.map(product => ({
    ...product,
    price: parseFloat(product.price),
    // Extract category name if it's an object, otherwise use the value or default
    category: typeof product.category === 'object' && product.category !== null 
      ? product.category.name 
      : (product.category || 'Uncategorized')
  })) || [];

  return {
    products: transformedProducts,
    isLoading,
    isError: error,
    mutate,
  };
}
