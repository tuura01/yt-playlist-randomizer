import "../App.css"
import Favorites from './Favorites'
import {scrollTo, updateTitle} from "../utils/utils"



function VideoList ({ favorites, setFavorites, videoData, setVideoData, youtubePlayer, searchedItem, videoListRef, setSearchedItem}){
    
    const updatePlayedVideo = (index,e) => {
        setVideoData((prev) => ({ ...prev, index: index }))
        youtubePlayer.loadVideoById(videoData.videoIdsArray[index])
        localStorage.setItem('index', index.toString())
        scrollTo(index, setSearchedItem, videoListRef)
        updateTitle(videoData.videoTitles[index])
    }

    return (
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
                                            <Favorites
                                                favorites={favorites}
                                                setFavorites={setFavorites}
                                                videoData={videoData}
                                                index={index}
                                            />
                                        }
                                    </div>
                                </li>
                            ))}
                    </ul>
                </nav>
            </div>
    )
}

export default VideoList