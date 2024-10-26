import { scrollTo, updateTitle } from '../utils/utils';

function useVideoControls(videoData, setVideoData, youtubePlayerRef, videoListRef, setSearchedItem) {
  const handlePrev = () => {
    if (youtubePlayerRef) {
      const index = videoData.index - 1;
      youtubePlayerRef.loadVideoById(videoData.videoIdsArray[index]);
      updateTitle(videoData.videoTitles[index])
      setVideoData((prev) => ({ ...prev, index }));
      localStorage.setItem('index', index.toString());
      scrollTo(index, setSearchedItem, videoListRef);
    }
  };

  const handleNext = () => {
    if (youtubePlayerRef) {
      const index = videoData.index + 1;
      youtubePlayerRef.loadVideoById(videoData.videoIdsArray[index]);
      updateTitle(videoData.videoTitles[index])
      setVideoData((prev) => ({ ...prev, index }));
      localStorage.setItem('index', index.toString());
      scrollTo(index, setSearchedItem, videoListRef);
    }
  };

  const handleError = () => {
    handleNext();
  };

  return { handlePrev, handleNext, handleError };
}

export default useVideoControls;