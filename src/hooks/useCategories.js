import { useEffect, useState } from 'react'
import { getActiveCategories } from '../services/categoryService'
import { isSupabaseConfigured } from '../services/googleSheets.js'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!isSupabaseConfigured) return
    let active = true
    getActiveCategories().then((data) => active && setCategories(data)).catch((caught) => active && setError(caught.message)).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])
  return { categories, loading, error }
}
