import { OffthreadVideo } from 'remotion';
import type { CSSProperties } from 'react';

interface ChromaKeyVideoProps {
  src: string;
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  scale: number; // 0.2 - 0.4
  shape: 'rectangle' | 'circle';
}

const positionStyles: Record<string, CSSProperties> = {
  'bottom-left': { left: 24, bottom: 24 },
  'bottom-right': { right: 24, bottom: 24 },
  'top-left': { left: 24, top: 24 },
  'top-right': { right: 24, top: 24 },
};

export function ChromaKeyVideo({ src, position, scale, shape }: ChromaKeyVideoProps) {
  const posStyle = positionStyles[position];

  const containerStyle: CSSProperties = {
    position: 'absolute',
    ...posStyle,
    width: `${scale * 100}%`,
    aspectRatio: '9/16', // Vertical video aspect ratio
    borderRadius: shape === 'circle' ? '50%' : '12px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };

  return (
    <div style={containerStyle}>
      <OffthreadVideo
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        transparent
      />
    </div>
  );
}
