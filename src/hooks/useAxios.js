// src/hooks/useAxios.js
import { axios } from '@/lib/axios'
import { getSession } from 'next-auth/react'
import { useEffect } from 'react'

export function useAxios() {
    useEffect(() => {
        const updateAuthHeader = async () => {
            const session = await getSession()
            if (session?.accessToken) {
                axios.defaults.headers.common['Authorization'] =
                    `Bearer ${session.accessToken}`
            } else {
                delete axios.defaults.headers.common['Authorization']
            }
        }
        updateAuthHeader()
    }, [])

    return axios
}
