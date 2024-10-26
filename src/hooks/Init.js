import {useState, useEffect} from 'react'
import axios from 'axios'
import useVideoData from './useVideoData'

function useInit (playlistId, setVideoData, favorites, setFavorites, setLoading, loading, playlist, setPlaylist) {
    const [shuffle, setShuffle] = useState(false)

    const {hookVideoData, updateVideoData} = useVideoData(playlist, favorites, setFavorites, setVideoData);

    useEffect(() => {
        if (shuffle && playlist) {
            updateVideoData()
        }
    }, [shuffle, playlist, updateVideoData])

    useEffect(() => {
        if(hookVideoData && hookVideoData.videoTitles && hookVideoData.videoTitles.length > 0){
            setVideoData(hookVideoData);
        }
    }, [hookVideoData]);

    const setNull = () => {
        setVideoData({
            videoIdsArray: [],
            videoTitles: [],
            index: 0,
        })
    }

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
        finally {
            setLoading(false)
        }
    }

    const init = async () => {
        if (loading === true) {
            //prevent user from spamming the load playlist button
            alert('Loading playlist please wait')
            return
        }
        setLoading(true)
        setNull()
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

    return{init, handlePreviousSession}
}

export default useInit