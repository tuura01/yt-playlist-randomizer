import '../App.css'
import {CircularProgress } from '@mui/material'
import useInit from '../hooks/Init'

function GetPlaylist({setVideoData, favorites, setFavorites, playlist, setPlaylist, playlistId, setPlaylistId, loading, setLoading}){
    // const [loading, setLoading] = useState(false)
    const {init} = useInit(playlistId, setVideoData, favorites, setFavorites, setLoading, loading, playlist, setPlaylist)

    return(
        <div className="GetPlaylist">
            <label>playlist id:</label>
            <input
                id="playlistInput"
                type="text"
                value={playlistId}
                onChange={(e) => setPlaylistId(e.currentTarget.value)}
            ></input>
            <button onClick={init}>load playlist</button>
            {loading && (
                <CircularProgress
                    size={'20px'}
                    sx={{ marginLeft: '10px', display: 'inline-block' }}
                ></CircularProgress>
            )}
        </div>
    )
}


export default GetPlaylist