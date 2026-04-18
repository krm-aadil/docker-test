'use client';
import { useState, useEffect } from 'react';

export default function ProtectedImageDemo({ src }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTrapped, setIsTrapped] = useState(false);

  useEffect(() => {
    const handleBlur = () => setIsTrapped(true);
    const handleFocus = () => setIsTrapped(false);
    
    const handleKeyDown = (e) => {
      if (e.key === 'PrintScreen') {
        setIsTrapped(true);
        setTimeout(() => setIsTrapped(false), 3000); 
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('keyup', handleKeyDown);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keyup', handleKeyDown);
    };
  }, []);

  const watermarkSvg = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='rgba(255,255,255,0.9)' font-size='16' font-weight='bold' font-family='sans-serif' transform='rotate(-45 50 50)'>TESTING</text></svg>")`;

  const imgBaseStyle = {
    width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px',
    pointerEvents: 'none', userSelect: 'none', WebkitUserSelect: 'none'
  };

  const containerStyle = {
    width: '100px', height: '100px', flexShrink: 0, position: 'relative'
  };

  return (
    <div style={{ display: 'flex', gap: '15px', marginTop: '10px', flexWrap: 'wrap' }}>
      
      {/* 1. Watermark */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
        <span style={{ fontSize: '11px', color: '#666', fontWeight: 'bold' }}>1. Watermark</span>
        <div onContextMenu={(e) => e.preventDefault()} style={containerStyle}>
          <img src={src} draggable="false" style={imgBaseStyle} alt="Protected" />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: watermarkSvg, pointerEvents: 'none', borderRadius: '8px' }} />
        </div>
      </div>

      {/* 2. Hover-to-Reveal */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
        <span style={{ fontSize: '11px', color: '#666', fontWeight: 'bold' }}>2. Hold to View</span>
        <div 
          onContextMenu={(e) => e.preventDefault()}
          onMouseDown={() => setIsHovered(true)}
          onMouseUp={() => setIsHovered(false)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
          style={{ ...containerStyle, cursor: 'pointer' }}
        >
          <img 
            src={src} draggable="false" 
            style={{ ...imgBaseStyle, filter: isHovered ? 'none' : 'blur(12px)', transition: 'filter 0.2s ease' }} 
            alt="Protected" 
          />
        </div>
      </div>

      {/* 3. Snipping Trap */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
        <span style={{ fontSize: '11px', color: '#666', fontWeight: 'bold' }}>3. Focus Trap</span>
        <div onContextMenu={(e) => e.preventDefault()} style={{ ...containerStyle, background: '#222', borderRadius: '8px', overflow: 'hidden' }}>
          {isTrapped ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red', fontSize: '12px', fontWeight: 'bold', textAlign: 'center' }}>
              BLOCKED
            </div>
          ) : (
            <img src={src} draggable="false" style={imgBaseStyle} alt="Protected" />
          )}
        </div>
      </div>

    </div>
  );
}