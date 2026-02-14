import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useMemo } from 'react';
import type { CSSProperties } from 'react';

export interface CaptionWord {
  text: string;
  start: number; // seconds
  end: number;   // seconds
}

interface Chunk {
  words: CaptionWord[];
  start: number;
  end: number;
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
  maxWordsPerChunk?: number;
  pauseThreshold?: number;
}

export function Captions({
  words,
  style = 'karaoke',
  fontSize = 56,
  color = '#FFFFFF',
  highlightColor = '#FFD700',
  position = 'bottom',
  strokeColor = '#000000',
  strokeWidth = 3,
  maxWordsPerChunk = 5,
  pauseThreshold = 0.7,
}: CaptionsProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Split words into chunks by pause gaps or max word count
  const chunks = useMemo((): Chunk[] => {
    if (!words || words.length === 0) return [];

    const result: Chunk[] = [];
    let currentChunk: CaptionWord[] = [];

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const prevWord = i > 0 ? words[i - 1] : null;

      const hasGap = prevWord && (word.start - prevWord.end) >= pauseThreshold;
      const chunkFull = currentChunk.length >= maxWordsPerChunk;

      if ((hasGap || chunkFull) && currentChunk.length > 0) {
        result.push({
          words: currentChunk,
          start: currentChunk[0].start,
          end: currentChunk[currentChunk.length - 1].end,
        });
        currentChunk = [];
      }

      currentChunk.push(word);
    }

    if (currentChunk.length > 0) {
      result.push({
        words: currentChunk,
        start: currentChunk[0].start,
        end: currentChunk[currentChunk.length - 1].end,
      });
    }

    return result;
  }, [words, maxWordsPerChunk, pauseThreshold]);

  // Find active chunk: the one whose time range contains currentTime
  const activeChunk = useMemo(() => {
    for (const chunk of chunks) {
      if (currentTime >= chunk.start && currentTime <= chunk.end + 0.3) {
        return chunk;
      }
    }
    return null;
  }, [chunks, currentTime]);

  // Find active word index within chunk
  const activeWordIndex = useMemo(() => {
    if (!activeChunk) return -1;
    return activeChunk.words.findIndex(
      (w) => currentTime >= w.start && currentTime < w.end
    );
  }, [activeChunk, currentTime]);

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
        return { ...base, bottom: '18%' };
    }
  }, [position]);

  const textStyles = useMemo((): CSSProperties => ({
    fontFamily: "'Inter', 'Montserrat', system-ui, sans-serif",
    fontSize: `${fontSize}px`,
    fontWeight: 900,
    color,
    textShadow: `
      -${strokeWidth}px -${strokeWidth}px 0 ${strokeColor},
      ${strokeWidth}px -${strokeWidth}px 0 ${strokeColor},
      -${strokeWidth}px ${strokeWidth}px 0 ${strokeColor},
      ${strokeWidth}px ${strokeWidth}px 0 ${strokeColor},
      0 0 ${strokeWidth * 4}px rgba(0,0,0,0.5)
    `,
    lineHeight: 1.3,
    letterSpacing: '-0.02em',
    textTransform: 'uppercase' as const,
  }), [fontSize, color, strokeWidth, strokeColor]);

  const getWordStyle = (index: number, word: CaptionWord): CSSProperties => {
    const isActive = index === activeWordIndex;
    const hasStarted = currentTime >= word.start;

    switch (style) {
      case 'karaoke':
        return {
          color: isActive ? highlightColor : color,
        };

      case 'fade':
        return {
          opacity: hasStarted ? 1 : 0.3,
        };

      case 'pop':
        return {
          transform: isActive ? 'scale(1.25)' : 'scale(1)',
          display: 'inline-block',
        };

      case 'bounce':
        return {
          transform: isActive ? 'translateY(-6px)' : 'translateY(0)',
          display: 'inline-block',
        };

      default:
        return {};
    }
  };

  if (!activeChunk) return null;

  return (
    <div style={positionStyles}>
      <div style={textStyles}>
        {activeChunk.words.map((word, i) => (
          <span key={`${word.start}-${word.text}`} style={getWordStyle(i, word)}>
            {word.text}
            {i < activeChunk.words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </div>
    </div>
  );
}
