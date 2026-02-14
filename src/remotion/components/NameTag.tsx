import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { CSSProperties } from 'react';

interface NameTagProps {
  text: string;
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  avatarScale: number;
  color?: string;
}

const positionOffsets: Record<string, { x: number; y: number; anchor: string }> = {
  'bottom-left': { x: 24, y: -48, anchor: 'left' },
  'bottom-right': { x: -24, y: -48, anchor: 'right' },
  'top-left': { x: 24, y: 48, anchor: 'left' },
  'top-right': { x: -24, y: 48, anchor: 'right' },
};

export function NameTag({ text, position, avatarScale, color = '#FF6B00' }: NameTagProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const offset = positionOffsets[position];

  // Slide-in animation
  const slideProgress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 80 },
    durationInFrames: 30,
  });

  const basePosition: CSSProperties = position.includes('bottom')
    ? { bottom: Math.abs(offset.y) + 24 }
    : { top: Math.abs(offset.y) + 24 };

  const horizontalPosition: CSSProperties = offset.anchor === 'left'
    ? { left: offset.x }
    : { right: Math.abs(offset.x) };

  const transform = offset.anchor === 'left'
    ? `translateX(${(1 - slideProgress) * -100}%)`
    : `translateX(${(1 - slideProgress) * 100}%)`;

  const containerStyle: CSSProperties = {
    position: 'absolute',
    ...basePosition,
    ...horizontalPosition,
    backgroundColor: color,
    color: '#FFFFFF',
    padding: '6px 16px',
    borderRadius: '20px',
    fontWeight: 700,
    fontSize: '14px',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    transform,
    zIndex: 10,
  };

  return <div style={containerStyle}>{text}</div>;
}
