import './App.css';
import {useState, useEffect, useRef} from 'react';
import YouTube from 'react-youtube';
import { CircularProgress } from '@mui/material';
import axios from 'axios';

function App() {

    const [playlistId, setPlaylistId] = useState("");
    const [playlist, setPlaylist] = useState(null);
    const [videoData, setVideoData] = useState({
        videoIdsArray: [],
        videoTitles: null,
        index: null
    });
    const [youtubePlayer, setYoutubePlayer] = useState(null);
    const [searchBar, setSearchBar] = useState("");
    const [searchedItem, setSearchedItem] = useState(null);
    const videoListRef = useRef(null);
    const [loading, setLoading] = useState(null);

    const setNull = () => {
        setPlaylist(null);
        setVideoData({
            videoIdsArray: [],
            videoTitles: null,
            index: null
        });
        setYoutubePlayer(null);
    }

    const init = async() => {
        if(loading === true){ //prevent user from spamming the load playlist button
            alert('Loading playlist please wait');
            return;
        }
        setLoading(true);
        setNull();//used if user *re-renders* playlist
        getPlaylist();
    }

    const getPlaylist = async () => {
        try {
          const response = await axios.get(`https://proxy-5evr.onrender.com/api?playlistId=${playlistId}`);
          setPlaylist(response.data);
        } catch (error) {
          console.error(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (playlist !== null) {

            const shuffledPlaylist = shuffle(Object.values(playlist));
            const videoIdsArray = [...shuffledPlaylist.map((item) => item.contentDetails.videoId)];
            const videoTitles = [...shuffledPlaylist.map((item) => item.snippet.title)];

            setVideoData({
                videoIdsArray: videoIdsArray,
                videoTitles: videoTitles,
                index: 0,
            });
            localStorage.setItem('videoIdsArray', JSON.stringify(videoIdsArray));
            localStorage.setItem('videoTitles', JSON.stringify(videoTitles));
            localStorage.setItem('index', '0');
            setLoading(false);
        }
    }, [playlist]);

    function shuffle(array) {
        let currentIndex = array.length,  randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex > 0) {

            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    const updatePlayedVideo = (index) => {
        setVideoData((prev) => ({...prev, index: index}));
        youtubePlayer.loadVideoById(videoData.videoIdsArray[index]);
        localStorage.setItem('index', index.toString());
    }

    const handleOnStateChange = (event) => {
        if(event.data === 0){
            handleNext();
        }
    }

    const handleSearch = () => {
        if(searchBar === ""){
            setSearchBar(null);
            setSearchedItem(null);
            return;
        }
        const matchingIndices = videoData.videoTitles
            .map((title, index) => ({ title: String(title), index })) // Ensure title is a string
            .filter((video) => video.title.toLowerCase().includes(searchBar.toLowerCase()))
            .map((video) => video.index);
        if (matchingIndices.length > 0) {
            const firstResultIndex = matchingIndices[0];
            const listItem = videoListRef.current.querySelector(`[data-index="${firstResultIndex}"]`);
    
            if (listItem) {
                listItem.scrollIntoView({ behavior: 'smooth' });
                setSearchedItem(firstResultIndex);
            }
        }
    }

    const handlePrev = () =>{
        const index = videoData.index - 1;
        youtubePlayer.loadVideoById(videoData.videoIdsArray[index]);
        setVideoData((prev) => ({...prev, index:index}));
        localStorage.setItem('index', index.toString());
    }

    const handleNext = () => {
        const index = videoData.index + 1;
        youtubePlayer.loadVideoById(videoData.videoIdsArray[index]);
        setVideoData((prev) => ({...prev, index:index}));
        localStorage.setItem('index', index.toString());
    }

    const handleError = () => {
        handleNext();
    }

    const handlePreviousSession = () => {
        if(localStorage.getItem('index') === null){
            alert('No previous session found');
            return;
        }

        setVideoData({
            videoIdsArray: JSON.parse(localStorage.getItem('videoIdsArray')),
            videoTitles: JSON.parse(localStorage.getItem('videoTitles')),
            index: Number(localStorage.getItem('index'))
        });
        setPlaylistId(localStorage.getItem('playlistId'));
    }

    //options for videoplayer
    const opts = {
        width: '640',
        height: '390',
        playerVars: {
            autoplay: '1',
            controls: '1',
            showinfo: '0',
            rel: '0'
        },

    }


    return (
    <div className="videoList" ref={videoListRef}>
        {videoData.index !== null && <YouTube
            opts={opts}
            onStateChange={(e) => handleOnStateChange(e)}
            onReady={(event) => {setYoutubePlayer(event.target); event.target.loadVideoById(videoData.videoIdsArray[videoData.index])}}
            onError={() => handleError()}
            >
        </YouTube>
        }
        {videoData.index !== null && <div className='mediaControls'>
            <button onClick={handlePrev}>Prev</button>
            <button onClick={handleNext}>Next</button>
            <div className='currentlyPlaying'>
                Currently Playing: {videoData.index+1}.{videoData.videoTitles[videoData.index]}
            </div>
        </div>}
        <div className='GetPlaylist'>
            <label>playlist id:</label>
            <input type='text' value={playlistId} onChange={(e) => setPlaylistId(e.currentTarget.value)}></input>
            <button onClick={init}>load playlist</button>
            {loading === true && <CircularProgress size={'20px'} sx={{marginLeft:'10px', position:'absolute'}}></CircularProgress>}
        </div>
        <div className='searchPlaylist'>
            <label>search:</label>
            <input id='searchInput' type='text' value={searchBar} onChange={(e) => setSearchBar(e.currentTarget.value)}></input>
            <button onClick={handleSearch}>search</button>
        </div>
        <div className='otherButtons'>
            <button onClick={handlePreviousSession}>resume previous session</button>
        </div>
        <div className='videoList'>
            <nav>
                <ul>
                    {videoData.videoIdsArray && videoData.videoIdsArray.map((id, index) => (
                        <li
                            key={index}
                            onClick={() => updatePlayedVideo(index)}
                            data-index={index}
                            style={{
                                backgroundColor: index === videoData.index || index === searchedItem ? 'lightyellow' : 'lightgray'
                            }}
                            onMouseOver={(e) => {
                                if (e.currentTarget.style.backgroundColor !== 'lightyellow') {
                                    e.currentTarget.style.backgroundColor = 'white';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (e.currentTarget.style.backgroundColor !== 'lightyellow') {
                                    e.currentTarget.style.backgroundColor = 'lightgray';
                                }
                            }}
                        >
                            {index + 1}.{videoData.videoTitles[index]}
                            {index === videoData.index && <span> [Playing...]</span>}
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    </div>
    );
}

export default App;
