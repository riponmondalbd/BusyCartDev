'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/utils/api';
import { 
  ShoppingCart, Heart, ChevronLeft, ShieldCheck, 
  Zap, Globe, Cpu, Timer, Share2, 
  ArrowRight, CheckCircle2, Box
} from 'lucide-react';

export default function SingleProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetchApi(`/product/products/${id}`);
        const data = res.data || res;
        setProduct(data);
        
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

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      // Simulate/Implement cart logic
      await fetchApi('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId: id, quantity: quantity }),
      });
      alert(`${quantity} Module(s) successfully integrated into your cart matrix.`);
    } catch (err: any) {
      if (err.message.includes('401')) {
        alert('Authentication required. Redirecting to terminal login.');
        router.push('/login');
      } else {
        alert(err.message || 'Error during module transfer.');
      }
    } finally {
      setAddingToCart(false);
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

  return (
    <div style={{ background: 'var(--bg-color)', color: 'var(--text-primary)', paddingBottom: '5rem' }}>
      
      {/* 1. Breadcrumb / Header Nav */}
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
          
          {/* 2. Left: Immersive Visuals */}
          <div>
            <div className="glass-panel" style={{ 
              position: 'relative', width: '100%', height: '600px', borderRadius: '24px', 
              overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center',
              border: '2px solid rgba(102,252,241,0.1)', background: 'rgba(255,255,255,0.01)'
            }}>
              <img 
                src={product.images?.[activeImage]} 
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2rem' }} 
                alt={product.name} 
              />
              
              {/* Carousel Arrows */}
              {product.images && product.images.length > 1 && (
                <>
                  <button 
                    onClick={() => setActiveImage(prev => (prev === 0 ? product.images.length - 1 : prev - 1))}
                    style={{ position: 'absolute', left: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: '0.3s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-color)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={() => setActiveImage(prev => (prev === product.images.length - 1 ? 0 : prev + 1))}
                    style={{ position: 'absolute', right: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: '0.3s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-color)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
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

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1.5rem' }}>
                {product.images.map((img: string, idx: number) => (
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

          {/* 3. Right: Technical Specifications */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '2rem' }}>
              <span style={{ 
                background: 'rgba(102,252,241,0.1)', color: 'var(--primary-color)', 
                padding: '0.5rem 1rem', borderRadius: '30px', fontSize: '0.75rem', 
                fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px'
              }}>
                {product.category?.name || 'Unassigned Sector'}
              </span>
              <h1 style={{ fontSize: '4rem', fontWeight: 900, marginTop: '1rem', lineHeight: 1.1 }}>{product.name}</h1>
              <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800 }}>SKU: <span style={{ color: 'var(--primary-color)' }}>{product.sku || `BC-${product.id?.slice(0, 8).toUpperCase()}`}</span></p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800 }}>STATUS: <span style={{ color: product.stock > 0 ? 'var(--success-color)' : 'var(--error-color)' }}>{product.stock > 0 ? 'AVAILABLE' : 'OUT OF STOCK'}</span></p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary-color)' }}>${product.price}</span>
                <div style={{ position: 'absolute', top: '-10px', right: '-40px', background: 'var(--error-color)', color: '#000', fontSize: '0.7rem', fontWeight: 900, padding: '2px 8px', borderRadius: '4px', transform: 'rotate(5deg)' }}>BEST PRICE</div>
              </div>
              <div style={{ height: '40px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>TAX INCLUDED</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--success-color)', fontWeight: 700 }}>IN STOCK & READY</p>
              </div>
            </div>

            {/* Spec Grid (Futuristic Tiles) */}
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
                {product.description || "The specifications for this module are currently encrypted. Please contact your sector representative for full technical documentation and integration guidelines."}
              </p>
            </div>

            {/* Quantity and Purchase Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: 'auto' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                {/* Quantity Control */}
                <div style={{ 
                  display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', 
                  borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem'
                }}>
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{ width: '40px', height: '40px', border: 'none', background: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.5rem', fontWeight: 900 }}
                  >
                    -
                  </button>
                  <span style={{ width: '50px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 800 }}>{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    style={{ width: '40px', height: '40px', border: 'none', background: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.25rem', fontWeight: 900 }}
                  >
                    +
                  </button>
                </div>

                <button 
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock === 0}
                  className="btn-primary" 
                  style={{ 
                    flex: 1, padding: '1.5rem', fontSize: '1.25rem', borderRadius: '16px',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem',
                    boxShadow: '0 0 30px rgba(102,252,241,0.2)'
                  }}
                >
                  <ShoppingCart size={24} /> {addingToCart ? 'INITIALIZING...' : 'ACQUIRE MODULE'}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={toggleWishlist}
                  style={{ 
                    flex: 1, height: '60px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: '0.3s',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem',
                    color: isWishlisted ? 'var(--error-color)' : 'var(--text-primary)', fontWeight: 700
                  }}
                >
                  <Heart size={20} fill={isWishlisted ? 'var(--error-color)' : 'none'} /> 
                  {isWishlisted ? 'IN COLLECTION' : 'ADD TO COLLECTION'}
                </button>
                <button style={{ flex: 1, borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer' }}>
                  COMPARE SPECS
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
               {[
                 { icon: ShieldCheck, text: "Secure Node" },
                 { icon: CheckCircle2, text: "Verified Tech" },
                 { icon: ArrowRight, text: "Instant Port" },
               ].map((t, i) => (
                 <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                   <t.icon size={16} color="var(--primary-color)" /> {t.text}
                 </div>
               ))}
            </div>
          </div>

        </div>

        {/* 4. Secondary Bento Sections */}
        <div style={{ marginTop: '8rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
           <div className="glass-panel" style={{ padding: '3rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem' }}>Technical Integration Guidelines</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {[
                  "Zero-latency compatibility with Neo-Tokyo neural networks.",
                  "Biometric verification required for full module synchronization.",
                  "Reinforced titanium shielding for high-radiation environments.",
                  "Instant firmware updates via global satellite uplink."
                ].map((text, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(102,252,241,0.1)', color: 'var(--primary-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 900, flexShrink: 0 }}>{i+1}</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.5 }}>{text}</p>
                  </div>
                ))}
              </div>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              <div className="glass-panel" style={{ padding: '2.5rem', background: 'linear-gradient(135deg, rgba(102,252,241,0.05), transparent)' }}>
                <Cpu size={40} color="var(--primary-color)" style={{ marginBottom: '1.5rem' }} />
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Quantum Warranty</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>This module is covered by the 256-bit encryption guarantee. If the module fails within 5 solar cycles, a replacement will be teleported to your sector immediately.</p>
              </div>
              <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <Globe size={40} color="var(--primary-color)" style={{ marginBottom: '1.5rem' }} />
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Global Fulfillment</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>We ship to all terraformed planets and lunar bases. Sector-to-sector delivery usually completed within 12 standard hours.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
