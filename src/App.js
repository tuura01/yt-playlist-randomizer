import './App.css'
import { useState, useEffect, useRef, useCallback } from 'react'
import YouTube from 'react-youtube'
import {CircularProgress } from '@mui/material'
import axios from 'axios'

function App() {
    const [playlistId, setPlaylistId] = useState('')
    const [playlist, setPlaylist] = useState(null)
    const [videoData, setVideoData] = useState({
        videoIdsArray: [],
        videoTitles: null,
        index: null,
    })
    const [tempVideoData, setTempVideoData] = useState({
        videoIdsArray: [],
        videoTitles: null,
        index: null,
    })
    const [youtubePlayer, setYoutubePlayer] = useState(null)
    const [searchBar, setSearchBar] = useState('')
    const [searchedItem, setSearchedItem] = useState(null)
    const videoListRef = useRef(null)
    const [loading, setLoading] = useState(null)
    const [shuffle, setShuffle] = useState(null)
    const [favorites, setFavorites] = useState([])
    const [previouslyChecked, setPreviouslyChecked] = useState(false)

    //#region initialization
    const setNull = () => {
        setPlaylist(null)
        setVideoData({
            videoIdsArray: [],
            videoTitles: null,
            index: null,
        })
        setTempVideoData({
            videoIdsArray: [],
            videoTitles: null,
            index: null,
        })
        setYoutubePlayer(null)
        setShuffle(null)
        setFavorites([]);
    }

    const init = async () => {
        if (loading === true) {
            //prevent user from spamming the load playlist button
            alert('Loading playlist please wait')
            return
        }
        setLoading(true)
        setNull() //used if user *re-renders* playlist
        getPlaylist()
    }
    const handlePreviousSession = () => {
        if (localStorage.getItem('index') === null) {
            alert('No previous session found')
            return
        }

        setVideoData({
            videoIdsArray: JSON.parse(localStorage.getItem('videoIdsArray')),
            videoTitles: JSON.parse(localStorage.getItem('videoTitles')),
            index: Number(localStorage.getItem('index')),
        })

        setPlaylist(JSON.parse(localStorage.getItem('playlist')))

        if(localStorage.getItem('favorites') === null){
            return
        }
        setFavorites(JSON.parse(localStorage.getItem('favorites')))
    }
    //#endregion

    const getPlaylist = async () => {
        try {
            var pId
            const id = JSON.parse(localStorage.getItem('playlistId'))
            playlistId === '' ? (pId = id) : (pId = playlistId)
            const response = await axios.get(
                `https://proxy-5evr.onrender.com/api?playlistId=${pId}`,
            )
            setPlaylist(response.data)
            setShuffle(true)
            localStorage.setItem('playlistId', JSON.stringify(pId))
        } catch (error) {
            console.error(error)
        }
        setLoading(false)
    }

    const updateVideoData = useCallback(
        (callback) => {
            const shuffledPlaylist = shufflePlaylist(Object.values(playlist))
            const shuffledFavorites = shufflePlaylist(favorites)

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
            
            setFavorites(shuffledFavorites)

            localStorage.setItem('videoIdsArray', JSON.stringify(videoIdsArray))
            localStorage.setItem('videoTitles', JSON.stringify(videoTitles))
            localStorage.setItem('index', '0')
            localStorage.setItem('playlist', JSON.stringify(playlist))
            localStorage.setItem('favorites', JSON.stringify(shuffledFavorites))

            if (callback !== undefined && typeof callback === 'function') {
                callback(videoIdsArray[0])
            }
        },
        [playlist, setVideoData, favorites, setFavorites],
    )

    useEffect(() => {
        if (playlist !== null && shuffle === true) {
            updateVideoData()
            setLoading(false)
        }
    }, [shuffle, playlist, updateVideoData])

    useEffect(() => {
        if(favorites === null || favorites.length === 0){
            const favs = JSON.parse(localStorage.getItem('favorites'))
            if(favs === null){
                setFavorites([-1])
            }
            else{
                setFavorites(favs)
            }
        }
        else{
            localStorage.setItem('favorites', JSON.stringify(favorites))
        }
    }, [favorites])

    useEffect(() => {
        if(videoData.VideoTitles !== null){
            scrollTo(videoData.index)
        }
    }, [videoData])

    useEffect(() => {
        return () => {
            const pIndex = localStorage.getItem('pIndex')
            if(pIndex !== ''){
                localStorage.setItem('index', pIndex);
                localStorage.setItem('pIndex', '')
            }
        };
    }, []);
    
    

    function shufflePlaylist(array) {
        let currentIndex = array.length,
            randomIndex

        // While there remain elements to shuffle.
        while (currentIndex > 0) {
            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex)
            currentIndex--

            // And swap it with the current element.
            ;[array[currentIndex], array[randomIndex]] = [
                array[randomIndex],
                array[currentIndex],
            ]
        }
        return array
    }

    const updatePlayedVideo = (index,e) => {
        setVideoData((prev) => ({ ...prev, index: index }))
        youtubePlayer.loadVideoById(videoData.videoIdsArray[index])
        localStorage.setItem('index', index.toString())
        scrollTo(index)
    }

    const handleOnStateChange = (event) => {
        if (event.data === 0) {
            handleNext()
        }
    }

    const scrollTo = (index) => {
        const listItem = videoListRef.current.querySelector(
            `[data-index="${index}"]`,
        )

        if (listItem) {
            listItem.scrollIntoView({ behavior: 'smooth', block: 'center' })
            setSearchedItem(index)
        }
    }

    const handleSearch = () => {
        return ""
        if (searchBar === '') {
            setSearchBar(null)
            setSearchedItem(null)
            return
        }
        const matchingIndices = videoData.videoTitles
            .map((title, index) => ({ title: String(title), index })) // Ensure title is a string
            .filter((video) =>
                video.title.toLowerCase().includes(searchBar.toLowerCase()),
            )
            .map((video) => video.index)
        if (matchingIndices.length > 0) {
            scrollTo(matchingIndices[0])
        }
    }

    //#region controls
    const handlePrev = () => {
        if (youtubePlayer !== null) {
            const index = videoData.index - 1
            youtubePlayer.loadVideoById(videoData.videoIdsArray[index])
            setVideoData((prev) => ({ ...prev, index: index }))
            localStorage.setItem('index', index.toString())
            scrollTo(index)
        }
    }

    const handleNext = () => {
        if (youtubePlayer !== null) {
            const index = videoData.index + 1
            youtubePlayer.loadVideoById(videoData.videoIdsArray[index])
            setVideoData((prev) => ({ ...prev, index: index }))
            localStorage.setItem('index', index.toString())
            scrollTo(index)
        }
    }
    //#endregion

    //#region shuffling
    const handleReShuffle = async () => {
        if (videoData.index === null) {
            alert('no playlist loaded')
            return
        }
        updateVideoData((videoId) => {
            youtubePlayer.loadVideoById(videoId)
            scrollTo(0)
        })
    }

    const handleUnShuffle = async () => {
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

        // setFavorites(favorites)

        localStorage.setItem('videoIdsArray', JSON.stringify(videoIdsArray))
        localStorage.setItem('videoTitles', JSON.stringify(videoTitles))
        localStorage.setItem('index', '0')
        localStorage.setItem('playlist', JSON.stringify(playlist))
        localStorage.setItem('favorites', JSON.stringify(favorites))

        scrollTo(0)
        youtubePlayer.loadVideoById(videoIdsArray[0])
    }
    //#endregion

    const handleError = () => {
        handleNext()
    }

    const handleFavorites = (e, index) => {
        e.stopPropagation();
        const favorited = e.currentTarget.style.color === "red"
        if(!favorited){
            if(favorites[0] === -1){
                setFavorites([videoData.videoIdsArray[index]])
            }
            else{
                setFavorites((prevFavorites) => [...prevFavorites, videoData.videoIdsArray[index]])
            }
            e.currentTarget.style.color = "red"
        }
        else{
            if(favorites.length === 1){
                setFavorites([-1])
            }
            else{
                setFavorites((prevFavorites) =>
                    prevFavorites.filter((fav) => fav !== videoData.videoIdsArray[index])
                );
            }
            e.currentTarget.style.color = "gray"
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
            scrollTo(0)

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

        scrollTo(videoData.index)
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
            {videoData.index !== null && (
                //GETPLAYERMODE
                <YouTube
                    opts={opts}
                    onStateChange={(e) => handleOnStateChange(e)}
                    onReady={(event) => {
                        setYoutubePlayer(event.target)
                        event.target.loadVideoById(
                            videoData.videoIdsArray[videoData.index],
                        )
                        scrollTo(videoData.index)
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
            <div className="GetPlaylist">
                <label>playlist id:</label>
                <input
                    id="playlistInput"
                    type="text"
                    value={playlistId}
                    onChange={(e) => setPlaylistId(e.currentTarget.value)}
                ></input>
                <button onClick={init}>load playlist</button>
                {loading === true && (
                    <CircularProgress
                        size={'20px'}
                        sx={{ marginLeft: '10px', position: 'absolute' }}
                    ></CircularProgress>
                )}
            </div>
            <div className="searchPlaylist">
                <label>search:</label>
                <input
                    id="searchInput"
                    type="text"
                    value={searchBar}
                    onChange={(e) => setSearchBar(e.currentTarget.value)}
                ></input>
                <button onClick={handleSearch}>search</button>
            </div>
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
            <div className="videoList">
                <nav>
                    <ul>
                        {videoData.videoIdsArray &&
                            videoData.videoIdsArray.map((id, index) => (
                                <li
                                    key={index}
                                    onClick={(e) => updatePlayedVideo(index, e)}
                                    data-index={index}
                                    style={{
                                        backgroundColor:
                                            index === videoData.index ||
                                            index === searchedItem
                                                ? 'lightyellow'
                                                : 'lightgray',
                                    }}
                                    onMouseOver={(e) => {
                                        if (
                                            e.currentTarget.style
                                                .backgroundColor !==
                                            'lightyellow'
                                        ) {
                                            e.currentTarget.style.backgroundColor =
                                                'white'
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (
                                            e.currentTarget.style
                                                .backgroundColor !==
                                            'lightyellow'
                                        ) {
                                            e.currentTarget.style.backgroundColor =
                                                'lightgray'
                                        }
                                    }}
                                >   
                                    <div id="itemContainer">
                                        <span>
                                            {index + 1}.{videoData.videoTitles[index]}
                                            {index === videoData.index && (
                                                <span> [Playing...]</span>
                                            )}
                                        </span>
                                        {favorites && favorites.length > 0 &&
                                            <span id="heart"onClick={(e) => handleFavorites(e, index)}
                                                style={{color: favorites.includes(videoData.videoIdsArray[index]) ? "red" : "gray"}}>
                                                &#x2665;
                                            </span>
                                        }
                                    </div>
                                </li>
                            ))}
                    </ul>
                </nav>
            </div>
        </div>
    )
}

export default App
