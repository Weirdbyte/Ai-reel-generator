import { AbsoluteFill, Img, useCurrentFrame, interpolate } from 'remotion';

export function Scene({ imageUrl, durationInFrames }) {
  const frame = useCurrentFrame();

  const fadeDuration = 15; // frames (~0.5s at 30fps)

  const opacity = interpolate(
    frame,
    [0, fadeDuration, durationInFrames - fadeDuration, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }

    //add zoom in zoom out animation
  );

  return (
    <AbsoluteFill style={{ opacity }}>
      <Img
        src={imageUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </AbsoluteFill>
  );
}
