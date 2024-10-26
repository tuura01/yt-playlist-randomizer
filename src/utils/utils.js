
const scrollTo = (index, setSearchedItem, videoListRef) => {
    const listItem = videoListRef.current.querySelector(
        `[data-index="${index}"]`,
    )

    if (listItem) {
        listItem.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setSearchedItem(index)
    }
}

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

function updateTitle(title){
    document.title = title
}


export {
    scrollTo,
    shufflePlaylist,
    updateTitle
}