import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CatalogPage } from './features/catalog/CatalogPage'
import { DetailPage } from './features/detail/DetailPage'
import { CartPage } from './features/cart/CartPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/product/:id" element={<DetailPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </BrowserRouter>
  )
}
