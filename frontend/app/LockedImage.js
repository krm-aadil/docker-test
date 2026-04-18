'use client'; // This tells Next.js to run this component in the browser

export default function LockedImage({ src }) {
  return (
    <div 
      onContextMenu={(e) => e.preventDefault()} // Blocks Right-Click
      style={{ 
        width: '80px', 
        height: '80px', 
        flexShrink: 0,
        borderRadius: '50%', 
        overflow: 'hidden',
        background: '#eee'
      }}
    >
      <img 
        src={src} 
        alt="Profile" 
        draggable="false" // Stops dragging
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover',
          pointerEvents: 'none', // Disables mouse interactions
          userSelect: 'none', 
          WebkitUserSelect: 'none' 
        }} 
      />
    </div>
  );
}