

// getToken function
const getToken = async () => {
    const response = await fetch ('https://accounts.spotify.com/api/token',{
        method: 'POST',
        body: 'grant_type=client_credentials',
        headers: {
            'Authorization': `Basic ${btoa(clientId + ':' + clientSecret)}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    const data = await response.json()
    const token = data.access_token
    return token
}

// verify that we get our token
// getToken()

// use getToken function, to get a song
// getSong Function
const getSong = async (track, artist) => {
    const token = await getToken()
    const response = await fetch(`https://api.spotify.com/v1/search?q=${track}&type=track`,{ 
        headers:{
            'Authorization': `Bearer ${token}`
        }
    })
    const data = await response.json()
    const songsArr = data.tracks.items
    const songUrls = songsArr
        .filter(song => song.artists[0].name === artist)
        .map(song => song.preview_url);
    return songUrls;
}


// verify that we get the song data

//  cashing the dom for each song div
const allTracks = document.querySelectorAll('.title-text')
const allArtists = document.querySelectorAll('.artist-text')

// clickedSong function
const clickedSong = async (divId) => {
    const track = allTracks[divId.slice(-1)].innerText
    const artist = allArtists[divId.slice(-1)].innerText
    const songUrls = await getSong(track, artist)
    // This will play the first song in the array
    return playSong(songUrls[0])
}


// handles playing the audio
let audio;
const playSong = (url) => {
    if (audio){
        audio.pause()
        audio = ''
    }
    audio = new Audio(url)
    audio.play()
}


// handles pausing the audio
const stopBtn = document.querySelector('#stopBtn')
stopBtn.addEventListener('click', () => {
    if (audio){
    audio.pause()
    }
})
