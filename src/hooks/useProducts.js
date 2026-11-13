import { useEffect, useState } from 'react'
import { getProducts } from '../services/productService'
import { isSupabaseConfigured } from '../services/googleSheets.js'

export function useProducts(options) {
  const page = options?.page
  const pageSize = options?.pageSize
  const search = options?.search
  const category = options?.category
  const type = options?.type
  const minPrice = options?.minPrice
  const maxPrice = options?.maxPrice
  const sort = options?.sort
  const [items, setItems] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let active = true
    getProducts({ page, pageSize, search, category, type, minPrice, maxPrice, sort }).then((result) => {
      if (!active) return
      setItems(result.items)
      setCount(result.count)
    }).catch((caught) => {
      if (active) setError(caught.message)
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [page, pageSize, search, category, type, minPrice, maxPrice, sort])

  return { items, count, loading, error }
}
