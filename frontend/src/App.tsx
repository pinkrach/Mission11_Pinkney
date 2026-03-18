import { useState } from 'react'
import './App.css'
import BookList from './BookList'
import AddBook from './AddBook'

type Page = 'list' | 'add';

function App() {
  const [page, setPage] = useState<Page>('list')

  return (
    <>
      <nav
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          background: 'linear-gradient(90deg, #a855f7, #3b82f6)',
          borderBottom: '2px solid rgba(170, 59, 255, 0.35)',
          padding: '0.75rem 0',
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1126px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            padding: '0 1.5rem',
            boxSizing: 'border-box',
          }}
        >
          <MenuButton active={page === 'list'} onClick={() => setPage('list')}>
            Book List
          </MenuButton>
          <MenuButton active={page === 'add'} onClick={() => setPage('add')}>
            Add Book
          </MenuButton>
        </div>
      </nav>

      {page === 'list' ? (
        <BookList />
      ) : (
        <AddBook
          onAdded={() => {
            setPage('list')
          }}
        />
      )}
    </>
  )
}

function MenuButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '0.45rem 0.9rem',
        borderRadius: '0.5rem',
        border: active ? '1px solid rgba(170, 59, 255, 0.55)' : '1px solid rgba(148, 163, 184, 0.55)',
        background: active ? '#ffffff' : '#f9fafb',
        color: active ? '#0f172a' : '#334155',
        cursor: 'pointer',
        fontSize: '0.95rem',
        boxShadow: active ? '0 8px 14px -10px rgba(15, 23, 42, 0.6)' : 'none',
      }}
    >
      {children}
    </button>
  )
}

export default App
