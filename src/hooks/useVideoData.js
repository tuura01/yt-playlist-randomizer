import { useCallback } from 'react';
import { shufflePlaylist, scrollTo, updateTitle } from '../utils/utils';

const useVideoData = (playlist, favorites, setFavorites, setVideoData, videoData, youtubePlayer, setSearchedItem, videoListRef) => {

    const checkPlaylist = () => {
        if (!playlist || playlist.length === 0) {
            console.warn("No playlist available to update video data. Attempting to read from local storage");
            try{
                playlist = JSON.parse(localStorage.getItem('playlist')) 
            }
            catch{
                return false
            }
        }

        if (!playlist || playlist.length === 0) {
            alert('Failed to get playlist, please re-enter playlist.')
            return false
        }

        return true
    }

    const handleReShuffle = async () => {
        if (videoData.videoTitles.length < 1) {
            alert('no playlist loaded')
            return
        }
        updateVideoData((videoId) => {
            youtubePlayer.loadVideoById(videoId)
            scrollTo(0, setSearchedItem, videoListRef)
        })
    }

    const handleUnShuffle = async () => {
        if(!checkPlaylist()){
            return
        }


        const shuffledPlaylist = Object.values(playlist)
        const videoIdsArray = [
            ...shuffledPlaylist.map((item) => item.contentDetails.videoId),
        ]
        const videoTitles = [
            ...shuffledPlaylist.map((item) => item.snippet.title),
        ]

        setVideoData({
            videoIdsArray: videoIdsArray,
            videoTitles: videoTitles,
            index: 0,
        })

        localStorage.setItem('videoIdsArray', JSON.stringify(videoIdsArray))
        localStorage.setItem('videoTitles', JSON.stringify(videoTitles))
        localStorage.setItem('index', '0')
        localStorage.setItem('playlist', JSON.stringify(playlist))
        localStorage.setItem('favorites', JSON.stringify(favorites))

        scrollTo(0, setSearchedItem, videoListRef)
        youtubePlayer.loadVideoById(videoIdsArray[0])
        updateTitle(videoTitles[0])
    }

    const updateVideoData = useCallback(
        (callback) => {

            if(!checkPlaylist()){
                return
            }

            const favs = JSON.parse(localStorage.getItem('favorites'))

            const shuffledPlaylist = shufflePlaylist(Object.values(playlist));
            const shuffledFavorites = shufflePlaylist(favs);

            const videoIdsArray = shuffledPlaylist.map((item) => item.contentDetails.videoId);
            const videoTitles = shuffledPlaylist.map((item) => item.snippet.title);

            setVideoData({
                videoIdsArray: videoIdsArray,
                videoTitles: videoTitles,
                index: 0,
            });
            
            setFavorites(shuffledFavorites);

            // Storing in localStorage
            localStorage.setItem('videoIdsArray', JSON.stringify(videoIdsArray));
            localStorage.setItem('videoTitles', JSON.stringify(videoTitles));
            localStorage.setItem('index', '0');
            localStorage.setItem('playlist', JSON.stringify(playlist));
            localStorage.setItem('favorites', JSON.stringify(shuffledFavorites));

            // Callback if provided
            if (callback && typeof callback === 'function') {
                callback(videoIdsArray[0]);
            }
            updateTitle(videoTitles[0])

        },
        [playlist]
    );

    return {updateVideoData, handleReShuffle, handleUnShuffle};
};

export default useVideoData;
