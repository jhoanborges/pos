// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit'
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import cartReducer from './slices/cartSlice'

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    whitelist: ['items'], // Only persist the items array from cart slice
}

// Apply persist to the cart reducer
const persistedCartReducer = persistReducer(persistConfig, cartReducer)

export const store = configureStore({
    reducer: {
        cart: persistedCartReducer, // This will be { items: [], _persist: {...} }
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    FLUSH,
                    REHYDRATE,
                    PAUSE,
                    PERSIST,
                    PURGE,
                    REGISTER,
                ],
            },
        }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
