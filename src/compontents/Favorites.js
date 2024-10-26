import '../App.css'

function Favorites({ favorites, setFavorites, videoData, index }) {

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


    return (
        <span id="heart"onClick={(e) => handleFavorites(e, index)}
            style={{color: favorites.includes(videoData.videoIdsArray[index]) ? "red" : "gray"}}>
            &#x2665;
        </span>
    )
}

export default Favorites