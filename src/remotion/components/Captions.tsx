import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useMemo } from 'react';
import type { CSSProperties } from 'react';

export interface CaptionWord {
  text: string;
  start: number; // seconds
  end: number;   // seconds
}

interface CaptionsProps {
  words: CaptionWord[];
  style?: 'karaoke' | 'pop' | 'fade' | 'bounce';
  fontSize?: number;
  color?: string;
  highlightColor?: string;
  position?: 'bottom' | 'center' | 'top';
  strokeColor?: string;
  strokeWidth?: number;
}

export function Captions({
  words,
  style = 'karaoke',
  fontSize = 48,
  color = '#FFFFFF',
  highlightColor = '#FFD700',
  position = 'bottom',
  strokeColor = '#000000',
  strokeWidth = 2,
}: CaptionsProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentTime = frame / fps;

  // Find visible words and active word
  const { visibleWords, activeWordIndex } = useMemo(() => {
    const visible: { word: CaptionWord; index: number }[] = [];
    let activeIndex = -1;

    words.forEach((word, index) => {
      if (currentTime >= word.start) {
        visible.push({ word, index });
      }

      if (currentTime >= word.start && currentTime < word.end) {
        activeIndex = index;
      }
    });

    return { visibleWords: visible, activeWordIndex: activeIndex };
  }, [words, currentTime]);

  // Position styles
  const positionStyles = useMemo((): CSSProperties => {
    const base: CSSProperties = {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      textAlign: 'center',
      width: '90%',
      maxWidth: '90%',
    };

    switch (position) {
      case 'top':
        return { ...base, top: '8%' };
      case 'center':
        return { ...base, top: '50%', transform: 'translate(-50%, -50%)' };
      case 'bottom':
      default:
        return { ...base, bottom: '15%' }; // Above avatar area
    }
  }, [position]);

  // Text styles
  const textStyles = useMemo((): CSSProperties => {
    return {
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      fontSize: `${fontSize}px`,
      fontWeight: 700,
      color,
      textShadow: strokeWidth
        ? `
          -${strokeWidth}px -${strokeWidth}px 0 ${strokeColor},
          ${strokeWidth}px -${strokeWidth}px 0 ${strokeColor},
          -${strokeWidth}px ${strokeWidth}px 0 ${strokeColor},
          ${strokeWidth}px ${strokeWidth}px 0 ${strokeColor}
        `
        : undefined,
      lineHeight: 1.4,
    };
  }, [fontSize, color, strokeWidth, strokeColor]);

  // Get animation style for a word
  const getWordStyle = (wordIndex: number, word: CaptionWord): CSSProperties => {
    const isActive = wordIndex === activeWordIndex;
    const hasStarted = currentTime >= word.start;

    switch (style) {
      case 'karaoke':
        return {
          color: isActive ? highlightColor : color,
          transition: 'color 0.1s ease',
        };

      case 'fade':
        return {
          opacity: hasStarted ? 1 : 0.3,
          transition: 'opacity 0.3s ease',
        };

      case 'pop':
        return {
          transform: isActive ? 'scale(1.2)' : 'scale(1)',
          display: 'inline-block',
          transition: 'transform 0.15s ease',
        };

      case 'bounce':
        return {
          transform: isActive ? 'translateY(-4px)' : 'translateY(0)',
          display: 'inline-block',
          transition: 'transform 0.15s ease',
        };

      default:
        return {};
    }
  };

  if (visibleWords.length === 0) {
    return null;
  }

  return (
    <div style={positionStyles}>
      <div style={textStyles}>
        {visibleWords.map(({ word, index }, i) => (
          <span key={`${index}-${word.text}`} style={getWordStyle(index, word)}>
            {word.text}
            {i < visibleWords.length - 1 ? ' ' : ''}
          </span>
        ))}
      </div>
    </div>
  );
}
