
// getToken function
const getToken = async () => {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${btoa(clientId + ":" + clientSecret)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  const data = await response.json();
  const token = data.access_token;
  return token;
};

// getSong Function
const getSong = async (track, artist) => {
  const token = await getToken();
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${track}&type=track`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await response.json();
  const songsArr = data.tracks.items;
  const songUrls = songsArr
    .filter((song) => song.artists[0].name === artist)
    .map((song) => song.preview_url);
  return songUrls;
};

//  cashing the dom for each song div
const allTracks = document.querySelectorAll(".title-text");
const allArtists = document.querySelectorAll(".artist-text");

// clickedSong function
const clickedSong = async (divId) => {
  const track = allTracks[divId.slice(-1)].innerText;
  const artist = allArtists[divId.slice(-1)].innerText;
  const songUrls = await getSong(track, artist);
  // Add the song URL to the songs array
  songs.push(songUrls[0]);
  // Update the current song index to the last song in the array
  currentSongIndex = songs.length - 1;
  // This will play the first song in the array
  return playSong(songUrls[0]);
};

// handles playing the audio
let audio = new Audio();

const playSong = (url) => {
  if (audio.src !== url) {
    audio.src = url;
  }
  audio.play();
  document.getElementById("playPauseBtn").innerHTML =
    '<i class="fas fa-pause"></i>';
};

audio.addEventListener("pause", () => {
  document.getElementById("playPauseBtn").innerHTML =
    '<i class="fas fa-play"></i>';
});

// handles pausing the audio
const stopBtn = document.querySelector("#stopBtn");
stopBtn.addEventListener("click", () => {
  if (audio) {
    audio.pause();
  }
});

// additional functionality will need to be changed on ui side to display correctly

const togglePlayPause = () => {
  if (audio.paused) {
    audio.play();
    document.getElementById("playPauseBtn").innerHTML =
      '<i class="fas fa-pause"></i>';
  } else {
    audio.pause();
    document.getElementById("playPauseBtn").innerHTML =
      '<i class="fas fa-play"></i>';
  }
};

let currentSongIndex = 0;
let songs = [];
// need to populate this array with song URLs

const skipToNextSong = () => {
  // Assuming 'songs' is an array of song URLs
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  audio.src = songs[currentSongIndex];
  audio.play();
};

const skipToPreviousSong = () => {
  // Assuming 'songs' is an array of song URLs
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  audio.src = songs[currentSongIndex];
  audio.play();
};

const changeVolume = (volume) => {
  // 'volume' should be a value between 0 and 1
  audio.volume = volume;
};

const seekToTime = (time) => {
  // 'time' is the time in seconds to seek to
  audio.currentTime = time;
};

audio.addEventListener("ended", skipToNextSong);

// searchSong Function
const searchSong = async (query) => {
  const token = await getToken();
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${query}&type=track`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await response.json();
  const songsArr = data.tracks.items;
  const songUrls = songsArr.map((song) => song.preview_url);
  return songUrls;
};

// submitSearch function
const submitSearch = async () => {
    const query = document.getElementById('searchBar').value
    const songUrls = await searchSong(query)
    // Do something with songUrls, e.g. add them to the songs array
    songs.push(...songUrls);
}
