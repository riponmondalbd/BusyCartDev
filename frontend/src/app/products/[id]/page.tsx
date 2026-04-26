'use client';

import { fetchApi } from '@/utils/api';
import {
  ArrowRight,
  Box,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Globe,
  Heart,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Timer,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SingleProductPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetchApi(`/product/products/${id}`);
        if (res.success && res.product) {
          setProduct(res.product);
        } else {
          setProduct(res.data || res);
        }
        
        // Check wishlist
        const saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setIsWishlisted(saved.includes(id));
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const toggleWishlist = () => {
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
    let next;
    if (saved.includes(id)) {
      next = saved.filter((sid: string) => sid !== id);
      setIsWishlisted(false);
    } else {
      next = [...saved, id];
      setIsWishlisted(true);
    }
    localStorage.setItem('wishlist', JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('wishlist-update', { detail: next.length }));
  };

  const handleAddToCart = async (showNotification = true) => {
    if (!id) return false;
    setProcessing(true);
    try {
      await fetchApi('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId: id, quantity }),
      });
      if (showNotification) {
        alert(`${quantity} Module(s) successfully integrated into your cart matrix.`);
      }
      return true;
    } catch (err: any) {
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        alert('Authentication required. Redirecting to terminal login.');
        router.push('/login');
      } else {
        alert(err.message || 'Error during module transfer.');
      }
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const handleBuyNow = async () => {
    const success = await handleAddToCart(false);
    if (success) {
      router.push('/checkout');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ width: '60px', height: '60px', border: '4px solid rgba(102,252,241,0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--primary-color)', fontWeight: 800, letterSpacing: '2px' }}>DECRYPTING PRODUCT DATA...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!product) {
    return <div className="container" style={{ padding: '10rem 0', textAlign: 'center', color: 'var(--error-color)', fontWeight: 900, fontSize: '2rem' }}>404: PRODUCT DATA NOT FOUND</div>;
  }

  const images = product.images || [];

  return (
    <div style={{ background: 'var(--bg-color)', color: 'var(--text-primary)', paddingBottom: '5rem' }}>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/products" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>
            <ChevronLeft size={18} /> BACK TO SECTORS
          </Link>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Share2 size={18} /></button>
            <button onClick={toggleWishlist} style={{ background: 'none', border: 'none', color: isWishlisted ? 'var(--error-color)' : 'var(--text-secondary)', cursor: 'pointer' }}>
              <Heart size={18} fill={isWishlisted ? 'var(--error-color)' : 'none'} />
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem' }}>
          <div>
            <div className="glass-panel" style={{ 
              position: 'relative', width: '100%', height: '600px', borderRadius: '24px', 
              overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center',
              border: '2px solid rgba(102,252,241,0.1)', background: 'rgba(255,255,255,0.01)'
            }}>
              {images.length > 0 && (
                <img 
                  src={images[activeImage]} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2rem' }} 
                  alt={product.name} 
                />
              )}
              
              {images.length > 1 && (
                <>
                  <button 
                    onClick={() => setActiveImage(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                    style={{ position: 'absolute', left: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: '0.3s' }}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={() => setActiveImage(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                    style={{ position: 'absolute', right: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: '0.3s' }}
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', padding: '1rem', background: 'rgba(11,12,16,0.8)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Visual State</p>
                <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>Holographic Render 4K</p>
              </div>
            </div>

            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1.5rem' }}>
                {images.map((img: string, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(idx)}
                    style={{ 
                      width: '100px', height: '100px', borderRadius: '16px', overflow: 'hidden', 
                      border: activeImage === idx ? '2px solid var(--primary-color)' : '2px solid transparent',
                      background: 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: '0.3s', padding: '0.5rem'
                    }}
                  >
                    <img src={img} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '2rem' }}>
              <span style={{ background: 'rgba(102,252,241,0.1)', color: 'var(--primary-color)', padding: '0.5rem 1rem', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                {product.category?.name || 'Unassigned Sector'}
              </span>
              <h1 style={{ fontSize: '4rem', fontWeight: 900, marginTop: '1rem', lineHeight: 1.1 }}>{product.name}</h1>
              <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800 }}>SKU: <span style={{ color: 'var(--primary-color)' }}>{product.sku || `BC-${id?.slice(0, 8).toUpperCase()}`}</span></p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800 }}>STATUS: <span style={{ color: product.stock > 0 ? 'var(--success-color)' : 'var(--error-color)' }}>{product.stock > 0 ? 'AVAILABLE' : 'OUT OF STOCK'}</span></p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary-color)' }}>
                  ${Number(product.price || 0).toFixed(2)}
                </span>
              </div>
              <div style={{ height: '40px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>TAX INCLUDED</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--success-color)', fontWeight: 700 }}>IN STOCK & READY</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
              {[
                { icon: Cpu, label: "Processing", val: "Neural Core 9" },
                { icon: Zap, label: "Efficiency", val: "A+++ Infinite" },
                { icon: Globe, label: "Origin", val: "Neo-Tokyo" },
                { icon: Timer, label: "Latency", val: "0.001ms Zero" },
              ].map((spec, i) => (
                <div key={i} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <spec.icon size={24} color="var(--primary-color)" />
                  <div>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase' }}>{spec.label}</p>
                    <p style={{ fontSize: '1rem', fontWeight: 700 }}>{spec.val}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Box size={18} color="var(--primary-color)" /> CORE DESCRIPTION
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                {product.description || "The specifications for this module are currently encrypted."}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: 'auto' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem' }}>
                  <button 
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                    style={{ width: '40px', height: '40px', border: 'none', background: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.5rem' }}
                  >
                    -
                  </button>
                  <span style={{ width: '50px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 800 }}>{quantity}</span>
                  <button 
                    type="button"
                    onClick={() => setQuantity(q => (product.stock && q >= product.stock ? q : q + 1))} 
                    style={{ width: '40px', height: '40px', border: 'none', background: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.25rem' }}
                  >
                    +
                  </button>
                </div>
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800 }}>ESTIMATED TOTAL</p>
                  <p style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary-color)' }}>
                    ${(Number(product.price || 0) * quantity).toFixed(2)}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <button 
                  onClick={() => handleAddToCart(true)} 
                  disabled={processing || product.stock === 0}
                  className="btn-primary" 
                  style={{ flex: 1, padding: '1.25rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }}
                >
                  <ShoppingCart size={20} style={{ marginRight: '0.5rem' }} /> ADD TO CART
                </button>
                <button 
                  onClick={handleBuyNow} 
                  disabled={processing || product.stock === 0}
                  className="btn-primary" 
                  style={{ flex: 1, padding: '1.25rem', borderRadius: '12px', boxShadow: '0 0 30px rgba(102,252,241,0.2)' }}
                >
                  <Zap size={20} style={{ marginRight: '0.5rem' }} /> {processing ? 'PREPARING...' : 'BUY NOW'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
