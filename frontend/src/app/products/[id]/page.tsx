'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchApi } from '@/utils/api';

export default function SingleProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetchApi(`/product/products/${id}`);
        setProduct(res.data || res);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to add to cart');
      router.push('/login');
      return;
    }

    setAddingToCart(true);
    try {
      await fetchApi('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId: id, quantity: 1 }),
      });
      alert('Item added to your cart matrix');
    } catch (err: any) {
      alert(err.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--primary-color)' }}>Decrypting product data...</div>;
  }

  if (!product) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--error-color)' }}>Product not found in the database.</div>;
  }

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <div className="glass-panel" style={{ padding: '3rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
        
        {/* Image Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ width: '100%', height: '400px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: 'var(--glass-border)', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {product.images && product.images[0] ? (
              <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: 'var(--text-secondary)' }}>No Hologram Available</span>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              {product.images.map((img: string, idx: number) => (
                <div key={idx} style={{ width: '80px', height: '80px', borderRadius: '8px', border: 'var(--glass-border)', overflow: 'hidden', cursor: 'pointer', transition: 'border 0.3s ease' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>{product.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-color)' }}>${product.price}</span>
            {product.discount > 0 && (
              <span style={{ background: 'rgba(255, 75, 75, 0.1)', color: 'var(--error-color)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {product.discount}% OFF
              </span>
            )}
          </div>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Description Specifications</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {product.description || 'No description provided for this module.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '3rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: 'var(--glass-border)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Inventory Status</p>
              <p style={{ fontSize: '1.2rem', color: product.stock > 0 ? 'var(--success-color)' : 'var(--error-color)', fontWeight: 'bold' }}>
                {product.stock > 0 ? `${product.stock} Units Available` : 'Out of Stock'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
            <button 
              onClick={handleAddToCart}
              className="btn-primary" 
              style={{ flex: 1, padding: '1rem', fontSize: '1.1rem' }}
              disabled={addingToCart || product.stock === 0}
            >
              {addingToCart ? 'Transferring...' : 'Add to Cart Matrix'}
            </button>
            <button 
              onClick={async () => {
                try {
                  await fetchApi('/wishlist/add', {
                    method: 'POST',
                    body: JSON.stringify({ productId: id })
                  });
                  alert('Added to wishlist');
                } catch (err: any) {
                  alert(err.message || 'Failed to add to wishlist');
                }
              }}
              className="btn-primary" 
              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', borderColor: 'var(--border-color)', padding: '1rem 1.5rem' }}
            >
              &hearts;
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
