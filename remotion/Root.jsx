import { Composition } from 'remotion';
import { Video } from './Video';
import videoData from '../.video-data/latest.json';

export const RemotionRoot = () => {
  return (
    <Composition
      id="Video"
      component={Video}
      fps={30}
      width={1080}
      height={1080}
      durationInFrames={60 * 30} // hard upper bound
      defaultProps={{ videoData }}

    />
  );
};
