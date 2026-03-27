import type { ReactNode } from 'react'
import { NavLink, Outlet, Route, Routes } from 'react-router-dom'
import './App.css'
import BookList from './BookList'
import AddBook from './AddBook'
import CartPage from './pages/CartPage'
import { CartProvider, useCart } from './context/CartContext'

function AppLayout() {
  const { totalItemCount, grandTotal } = useCart()

  return (
    <>
      <nav className="stack-nav">
        <div className="stack-nav-inner">
          <NavLink to="/" className="stack-logo" end>
            &lt; The Stack /&gt;
          </NavLink>
          <div className="stack-nav-links">
            <MenuNavLink to="/" end>
              Book List
            </MenuNavLink>
            <MenuNavLink to="/add">Add Book</MenuNavLink>
            <NavLink
              to="/cart"
              title={`Shopping cart — $${grandTotal.toFixed(2)}`}
              className={({ isActive }) =>
                `stack-cart-link${isActive ? ' stack-cart-link--active' : ''}`
              }
            >
              <span className="stack-cart-icon-wrap">
                <CartIcon />
                {totalItemCount > 0 && (
                  <span className="stack-cart-badge">
                    {totalItemCount > 99 ? '99+' : totalItemCount}
                  </span>
                )}
              </span>
              <span className="stack-nav-cart-total">
                ${grandTotal.toFixed(2)}
              </span>
            </NavLink>
          </div>
        </div>
      </nav>

      <div className="stack-page">
        <Outlet />
      </div>
    </>
  )
}

function MenuNavLink({
  to,
  end,
  children,
}: {
  to: string
  end?: boolean
  children: ReactNode
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `stack-nav-link${isActive ? ' stack-nav-link-active' : ''}`
      }
    >
      {children}
    </NavLink>
  )
}

function CartIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M6 6h15l-1.5 9h-12L6 6zm0 0L5 3H2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1.5" fill="currentColor" />
      <circle cx="18" cy="20" r="1.5" fill="currentColor" />
    </svg>
  )
}

export default function App() {
  return (
    <CartProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<BookList />} />
          <Route path="add" element={<AddBook />} />
          <Route path="cart" element={<CartPage />} />
        </Route>
      </Routes>
    </CartProvider>
  )
}
