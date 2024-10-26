import '../App.css'
import {scrollTo} from '../utils/utils'

function Search({setSearchBar, videoData, searchBar, setSearchedItem, videoListRef}){
    const handleSearch = () => {
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
            scrollTo(matchingIndices[0], setSearchedItem, videoListRef)
        }
    }

    return(
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
    )
}

export default Search