import { AbsoluteFill, Audio, Sequence } from 'remotion';
import { Scene } from './Scene';

const WORDS_PER_SECOND = 2.6;
export function Video({ videoData }) {
  const { scenes, audioUrl } = videoData;
  const fps = 30;

  // 1️⃣ Count total words
  const wordCounts = scenes.map(scene =>
    scene.contextText.split(/\s+/).length
  );

  const totalWords = wordCounts.reduce((a, b) => a + b, 0);

  // 2️⃣ Convert words → frames
  const sceneDurations = wordCounts.map(
    count => Math.round((count / WORDS_PER_SECOND) * fps)
  );

  return (
    <AbsoluteFill>
      <Audio src={audioUrl} />

      {scenes.map((scene, index) => {
        const from = sceneDurations
          .slice(0, index)
          .reduce((a, b) => a + b, 0);

        return (
          <Sequence
            key={index}
            from={from}
            durationInFrames={sceneDurations[index]}
          >
            <Scene
              imageUrl={scene.imageUrl}
              durationInFrames={sceneDurations[index]}
            />

          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
