import { AbsoluteFill, OffthreadVideo, Audio, useVideoConfig, staticFile } from 'remotion';
import { ChromaKeyVideo } from './components/ChromaKeyVideo';
import { NameTag } from './components/NameTag';
import { Captions } from './components/Captions';
import type { CaptionWord } from './components/Captions';

function resolveUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return staticFile(url);
}

export interface AvatarComposeProps {
  backgroundVideoUrl: string;
  avatarVideoUrl: string;
  audioUrl?: string;
  captions?: CaptionWord[];
  captionStyle?: 'karaoke' | 'pop' | 'fade' | 'bounce';
  avatarPosition?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  avatarScale?: number;
  avatarShape?: 'rectangle' | 'circle';
  showNameTag?: boolean;
  nameTagText?: string;
  nameTagColor?: string;
  format?: 'short' | 'long';
  totalDuration?: number;
  backgroundMuted?: boolean;
}

export function AvatarCompose({
  backgroundVideoUrl,
  avatarVideoUrl,
  audioUrl,
  captions,
  captionStyle = 'karaoke',
  avatarPosition = 'bottom-left',
  avatarScale = 0.28,
  avatarShape = 'rectangle',
  showNameTag = false,
  nameTagText,
  nameTagColor = '#FF6B00',
  backgroundMuted = true,
}: AvatarComposeProps) {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {/* Layer 1: Background video - fullscreen */}
      {backgroundVideoUrl && (
        <AbsoluteFill>
          <OffthreadVideo
            src={resolveUrl(backgroundVideoUrl)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            muted={backgroundMuted}
          />
        </AbsoluteFill>
      )}

      {/* Layer 2: Semi-transparent gradient overlay at bottom for caption readability */}
      {captions && captions.length > 0 && (
        <AbsoluteFill>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '35%',
              background: 'linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent)',
              pointerEvents: 'none',
            }}
          />
        </AbsoluteFill>
      )}

      {/* Layer 3: Avatar video with chroma key */}
      {avatarVideoUrl && (
        <ChromaKeyVideo
          src={resolveUrl(avatarVideoUrl)}
          position={avatarPosition}
          scale={avatarScale}
          shape={avatarShape}
        />
      )}

      {/* Layer 4: Name tag */}
      {showNameTag && nameTagText && (
        <NameTag
          text={nameTagText}
          position={avatarPosition}
          avatarScale={avatarScale}
          color={nameTagColor}
        />
      )}

      {/* Layer 5: Captions */}
      {captions && captions.length > 0 && (
        <Captions
          words={captions}
          style={captionStyle}
          fontSize={48}
          color="#FFFFFF"
          highlightColor="#FFD700"
          position="bottom"
          strokeColor="#000000"
          strokeWidth={3}
        />
      )}

      {/* Audio layer */}
      {audioUrl && <Audio src={resolveUrl(audioUrl)} />}
    </AbsoluteFill>
  );
}
