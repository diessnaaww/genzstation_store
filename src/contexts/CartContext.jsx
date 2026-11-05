import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { isSupabaseConfigured, supabase } from '../services/supabase'
import { products } from '../data/products'

const CartContext = createContext(null)
const GUEST_CART_KEY = 'genzstation_cart'

function readGuestCart() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]')
  } catch {
    return []
  }
}

function hydrateItems(items) {
  return items.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.id || candidate.id === item.product_id)
    if (!product?.isActive) return []
    const maxQuantity = product.productType === 'physical' ? product.stockQuantity : 999
    return [{ id: product.id, product_id: product.id, slug: product.slug, name: product.name, price: product.price, image: product.images?.[0] || '', productType: product.productType, quantity: Math.min(Math.max(1, Number(item.quantity) || 1), maxQuantity) }]
  })
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState(() => user ? [] : hydrateItems(readGuestCart()))

  useEffect(() => {
    if (!user) {
      return
    }
    if (!isSupabaseConfigured) return
    let active = true
    supabase.from('carts').select('id, cart_items(id, product_id, quantity)').eq('user_id', user.id).maybeSingle().then(async ({ data, error }) => {
      if (!active || error) return
      const guestItems = hydrateItems(readGuestCart())
      const serverItems = hydrateItems(data?.cart_items || [])
      const mergedMap = new Map(serverItems.map((item) => [item.id, item]))
      guestItems.forEach((guestItem) => {
        const serverItem = mergedMap.get(guestItem.id)
        const product = products.find((candidate) => candidate.id === guestItem.id)
        const maximum = product?.productType === 'physical' ? product.stockQuantity : 999
        mergedMap.set(guestItem.id, {
          ...guestItem,
          quantity: Math.min(maximum, (serverItem?.quantity || 0) + guestItem.quantity),
        })
      })
      const mergedItems = [...mergedMap.values()]
      setItems(mergedItems)
      localStorage.removeItem(GUEST_CART_KEY)
      if (!data?.id) return
      await supabase.from('cart_items').delete().eq('cart_id', data.id)
      if (mergedItems.length) {
        await supabase.from('cart_items').insert(mergedItems.map((item) => ({
          cart_id: data.id,
          product_id: item.id,
          quantity: item.quantity,
        })))
      }
    })
    return () => { active = false }
  }, [user])

  const persist = async (nextItems) => {
    setItems(nextItems)
    if (!user) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(nextItems.map(({ id, quantity }) => ({ id, quantity }))))
      return
    }
    if (!isSupabaseConfigured) return
    const { data } = await supabase.from('carts').upsert({ user_id: user.id }, { onConflict: 'user_id' }).select('id').single()
    if (!data?.id) return
    await supabase.from('cart_items').delete().eq('cart_id', data.id)
    if (nextItems.length) {
      await supabase.from('cart_items').insert(nextItems.map((item) => ({ cart_id: data.id, product_id: item.id, quantity: item.quantity })))
    }
  }

  const addItem = async (product, quantity = 1) => {
    if (!product?.isActive) return
    const maximum = product.productType === 'physical' ? product.stockQuantity : 999
    const existing = items.find((item) => item.id === product.id)
    const nextQuantity = Math.min(maximum, (existing?.quantity || 0) + quantity)
    const next = existing ? items.map((item) => item.id === product.id ? { ...item, quantity: nextQuantity } : item) : [...items, { id: product.id, product_id: product.id, slug: product.slug, name: product.name, price: product.price, image: product.images?.[0] || '', productType: product.productType, quantity: nextQuantity }]
    await persist(next)
  }

  const updateQuantity = (id, quantity) => {
    const product = products.find((item) => item.id === id)
    const maximum = product?.productType === 'physical' ? product.stockQuantity : 999
    persist(items.map((item) => item.id === id ? { ...item, quantity: Math.max(1, Math.min(maximum, quantity)) } : item))
  }

  const removeItem = (id) => persist(items.filter((item) => item.id !== id))
  const clearCart = () => persist([])
  const count = items.reduce((total, item) => total + item.quantity, 0)
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
  const value = { items, count, subtotal, addItem, updateQuantity, removeItem, clearCart }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside CartProvider')
  return context
}
