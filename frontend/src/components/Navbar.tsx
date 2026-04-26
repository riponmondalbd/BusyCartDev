import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link href="/" className="logo">
          Busy<span>Cart</span>
        </Link>
        <div className="nav-links">
          <Link href="/products" className="nav-link">Products</Link>
          <Link href="/categories" className="nav-link">Categories</Link>
          <Link href="/cart" className="nav-link">Cart (0)</Link>
          <Link href="/login" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Login</Link>
        </div>
      </div>
    </nav>
  );
}
