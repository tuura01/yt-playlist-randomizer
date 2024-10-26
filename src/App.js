import './App.css'
import { useState, useEffect, useRef } from 'react'
import YouTube from 'react-youtube'
import VideoList from './compontents/VideoList'
import {scrollTo} from './utils/utils'
import Search from './compontents/Search'
import GetPlaylist from './compontents/GetPlaylist'
import useVideoData from './hooks/useVideoData'
import useInit from './hooks/Init'
import useVideoControls from './hooks/useVideoControls'

function App() {

    /*
        Bugs:
        update -> no spinny wheel
    */
    const videoListRef = useRef(null)
    
    const [videoData, setVideoData] = useState({
        videoIdsArray: [],
        videoTitles: [],
        index: 0,
    })
    const [tempVideoData, setTempVideoData] = useState({
        videoIdsArray: [],
        videoTitles: [],
        index: 0,
    })
    
    const [youtubePlayer, setYoutubePlayer] = useState(null)
    const [searchBar, setSearchBar] = useState('')
    const [searchedItem, setSearchedItem] = useState(null)
    const [previouslyChecked, setPreviouslyChecked] = useState(false)
    const [favorites, setFavorites] = useState([])
    const [loading, setLoading] = useState(false)
    const [playlist, setPlaylist] = useState(null)
    const [playlistId, setPlaylistId] = useState('')


    const {handleReShuffle, handleUnShuffle} = useVideoData(playlist, favorites, setFavorites, setVideoData, videoData, youtubePlayer, setSearchedItem, videoListRef)
    const {init, handlePreviousSession} = useInit(playlistId, setVideoData, favorites, setFavorites, setLoading, loading, playlist, setPlaylist)
    const {handlePrev, handleNext, handleError} = useVideoControls(videoData, setVideoData, youtubePlayer, videoListRef, setSearchedItem);


    useEffect(() => {
        const favs = JSON.parse(localStorage.getItem('favorites'));
        if (favs === null) {
            setFavorites([-1]); 
        } else {
            setFavorites(favs);
        }
    }, []);  
    
    useEffect(() => {
        if (favorites !== null && favorites.length > 0) {
            localStorage.setItem('favorites', JSON.stringify(favorites));
        }
    }, [favorites]);

    useEffect(() => {
        if (videoData.videoTitles.length > 0) {
          scrollTo(videoData.index, setSearchedItem, videoListRef);
        }
      }, [videoData]);

    useEffect(() => {
        return () => {
            const pIndex = localStorage.getItem('pIndex')
            if(pIndex !== ''){
                localStorage.setItem('index', pIndex);
                localStorage.setItem('pIndex', '')
            }
        };
    }, []);

    const handleOnStateChange = (event) => {
        if (event.data === 0) {
            handleNext()
        }
    }

    const handleFavoritesOnlyMode = (e) => {

        if(youtubePlayer === null){
            return
        }

        e.currentTarget.classList.toggle('active')
        const checked = e.currentTarget.classList.contains('active')
        if((favorites === null || favorites[0] === -1) && !previouslyChecked){
            return
        }

        if(checked){
            setPreviouslyChecked(true)
            setTempVideoData(videoData)
            const newVideoIdsArray = [
                ...favorites
            ]

            var newVideoTitles = []
            favorites.forEach(element => {
                newVideoTitles = [...newVideoTitles, videoData.videoTitles[videoData.videoIdsArray.indexOf(element)]]
            });
            localStorage.setItem('pIndex', videoData.index)
            setVideoData({
                videoIdsArray: newVideoIdsArray,
                videoTitles: newVideoTitles,
                index: 0
            })
            youtubePlayer.loadVideoById(newVideoIdsArray[0])
            scrollTo(0, setSearchedItem, videoListRef)
        }
        else{
            youtubePlayer.loadVideoById(tempVideoData.videoIdsArray[tempVideoData.index])
            localStorage.setItem('index', JSON.stringify(tempVideoData.index))
            setPreviouslyChecked(false)
            setVideoData(tempVideoData)
            setTempVideoData({
                videoIdsArray: [],
                videoTitles: null,
                index: null,
            })
            localStorage.setItem('pIndex', '')
        }
    }

    const handleGotoClick = () => {
        if(videoData === null){
            return
        }

        scrollTo(videoData.index, setSearchedItem, videoListRef)
    }

    const handleResetFavorites = () => {
        if((favorites === null || favorites[0] === -1)){
            return
        }
        if (window.confirm('Are you sure you want to clear?')) {
            setFavorites([-1])
        } 
        else {
            console.log('did nothing')
        }
    }

    //options for videoplayer
    const opts = {
        width: '640',
        height: '390',
        playerVars: {
            autoplay: '1',
            controls: '1',
            showinfo: '0',
            rel: '0',
        },
    }

    return (
        <div className="videoList" ref={videoListRef}>
            {videoData.videoTitles.length > 0 && (
                //GETPLAYERMODE
                <YouTube
                    opts={opts}
                    onStateChange={(e) => handleOnStateChange(e)}
                    onReady={(event) => {
                        setYoutubePlayer(event.target)
                        event.target.loadVideoById(
                            videoData.videoIdsArray[videoData.index],
                        )
                        scrollTo(videoData.index, setSearchedItem, videoListRef)
                    }}
                    onError={(error) => handleError(error)}
                ></YouTube>
            )}
            {videoData.index !== null && (
                <div className="mediaControls">
                    <button onClick={handlePrev}>Prev</button>
                    <button onClick={handleNext}>Next</button>
                    <div className="currentlyPlaying">
                        Currently Playing: {videoData.index + 1}.
                        {videoData.videoTitles[videoData.index]}
                    </div>
                </div>
            )}
            <div className="playlistButtons">
                <button id="update" onClick={init}>
                    update
                </button>
                <button id="unshuffle" onClick={handleUnShuffle}>
                    un-shuffle
                </button>
                <button id="re-shuffle" onClick={handleReShuffle}>
                    re-shuffle
                </button>
                <button id="favoritesOnlyMode" onClick={handleFavoritesOnlyMode}>
                    favorites-only
                </button>
            </div>
            <GetPlaylist
                setVideoData={setVideoData}
                favorites={favorites}
                setFavorites={setFavorites}
                playlist={playlist}
                setPlaylist={setPlaylist}
                playlistId={playlistId}
                setPlaylistId={setPlaylistId}
                loading={loading}
                setLoading={setLoading}
            />
            <Search
                setSearchBar={setSearchBar}
                videoData={videoData}
                searchBar={searchBar}
                setSearchedItem={setSearchedItem}
                videoListRef={videoListRef}
            />
            <div className="otherButtons">
                <button onClick={handleGotoClick}>
                    goto
                </button>
                <button onClick={handlePreviousSession}>
                    resume previous session
                </button>
                <button onClick={handleResetFavorites}>
                    clear favorites
                </button>
            </div>
            <VideoList
                favorites={favorites}
                setFavorites={setFavorites}
                videoData={videoData}
                setVideoData={setVideoData}
                youtubePlayer={youtubePlayer}
                searchedItem={searchedItem}
                setSearchedItem={setSearchedItem}
                videoListRef={videoListRef}
            />
        </div>
    )
}

export default App
