import { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  const addItem = useCallback((product, talla, cantidad = 1) => {
    setItems((prev) => {
      const key = `${product.id}-${talla}`
      const existing = prev.find((i) => i.key === key)
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, cantidad: i.cantidad + cantidad } : i
        )
      }
      return [
        ...prev,
        {
          key,
          id: product.id,
          nombre: product.nombre,
          precio: product.precio,
          imagen: product.imagenPrincipal || product.imagen,
          talla,
          cantidad,
          // Campos de polos personalizados (sección Build)
          ...(product.personalizado && {
            personalizado: true,
            prompt: product.prompt,
            color_polo: product.color_polo,
            tamano_diseno: product.tamano_diseno,
          }),
        },
      ]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((key) => {
    setItems((prev) => prev.filter((i) => i.key !== key))
  }, [])

  const updateCantidad = useCallback((key, cantidad) => {
    if (cantidad <= 0) {
      setItems((prev) => prev.filter((i) => i.key !== key))
    } else {
      setItems((prev) =>
        prev.map((i) => (i.key === key ? { ...i, cantidad } : i))
      )
    }
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0)
  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        totalItems,
        isOpen,
        setIsOpen,
        addItem,
        removeItem,
        updateCantidad,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
