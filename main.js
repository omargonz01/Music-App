// spotify API creds
// const clientId = 
// const clientSecret = 

// Constants
const audio = new Audio();
const playPauseBtn = document.getElementById("playPauseBtn");
const songTitle = document.getElementById("songTitle");
const stopBtn = document.querySelector("#stopBtn");
const searchBar = document.getElementById('searchBar');
const allTracks = document.querySelectorAll(".title-text");
const allArtists = document.querySelectorAll(".artist-text");

// State
let currentSongIndex = 0;
let songs = [];

// Spotify API Functions
const getToken = async () => {
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${btoa(clientId + ":" + clientSecret)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    if (!response.ok) {
      throw new Error('Failed to get token');
    }
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting token:', error);
    // Handle the error gracefully
  }
};

const getSong = async (track, artist) => {
  const token = await getToken();
  const response = await fetch(`https://api.spotify.com/v1/search?q=${track}&type=track`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  const songsArr = data.tracks.items;
  return songsArr
    .filter((song) => song.artists[0].name === artist)
    .map((song) => song.preview_url);
};

const searchSong = async (query) => {
  const token = await getToken();
  const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  const songsArr = data.tracks.items;
  return songsArr.map((song) => song.preview_url);
};

// Event Listeners
stopBtn.addEventListener("click", () => {
  if (audio) {
    audio.pause();
  }
});

playPauseBtn.addEventListener("click", togglePlayPause);

// Functions
const playSong = (url, title) => {
  if (audio.src !== url) {
    audio.src = url;
  }
  audio.play();
  playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
  songTitle.innerText = title;
};

const addSongToPlaylist = (url) => {
  songs.push(url);
  currentSongIndex = songs.length - 1;
};

const fetchAndPlaySong = async (divId) => {
  const track = allTracks[divId.slice(-1)].innerText;
  const artist = allArtists[divId.slice(-1)].innerText;
  const songUrls = await getSong(track, artist);
  addSongToPlaylist(songUrls[0]);
  playSong(songUrls[0], track);
};

const togglePlayPause = () => {
  if (audio.paused) {
    audio.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
  } else {
    audio.pause();
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
  }
};

const skipToNextSong = () => {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  audio.src = songs[currentSongIndex];
  audio.play();
};

const skipToPreviousSong = () => {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  audio.src = songs[currentSongIndex];
  audio.play();
};

const changeVolume = (volume) => {
  audio.volume = volume;
};

const seekToTime = (time) => {
  audio.currentTime = time;
};

audio.addEventListener("ended", skipToNextSong);

const submitSearch = async () => {
  const query = searchBar.value;
  const songUrls = await searchSong(query);
  songs.push(...songUrls);
};

// Visualizer Setup
const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = 100;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

const visualize = () => {
  const bufferLength = analyserNode.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyserNode.getByteFrequencyData(dataArray);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const barWidth = (canvas.width / bufferLength) * 2.5;
  let x = 0;
  for (let i = 0; i < bufferLength; i++) {
    const barHeight = dataArray[i] / 2;
    ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
    ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight);
    x += barWidth + 1;
  }

  requestAnimationFrame(visualize);
};

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const audioElement = new Audio();
const source = audioCtx.createMediaElementSource(audioElement);
const analyserNode = audioCtx.createAnalyser();
source.connect(analyserNode);
analyserNode.connect(audioCtx.destination);

audioElement.addEventListener('play', visualize);
