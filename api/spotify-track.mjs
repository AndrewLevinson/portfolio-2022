// https://github.com/leerob/leerob.io/blob/main/lib/spotify.js

import querystring from 'querystring';

const {
  SPOTIFY_CLIENT_ID: client_id,
  SPOTIFY_CLIENT_SECRET: client_secret,
  SPOTIFY_REFRESH_TOKEN: refresh_token,
} = process.env;

const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
const TOP_TRACKS_ENDPOINT = `https://api.spotify.com/v1/me/top/tracks`;
const RECENT_ENDPOINT = `https://api.spotify.com/v1/me/player/recently-played?limit=1`;
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

const getAccessToken = async () => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token,
    }),
  });

  return response.json();
};

export const getNowPlaying = async () => {
  const { access_token } = await getAccessToken();

  return fetch(NOW_PLAYING_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

export const getCurrentArtistDetail = async artist_href => {
  const { access_token } = await getAccessToken();

  return fetch(artist_href, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

export const getRecentlyPlayed = async () => {
  const { access_token } = await getAccessToken();

  return fetch(RECENT_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

export const getTopTracks = async () => {
  const { access_token } = await getAccessToken();

  return fetch(TOP_TRACKS_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

export default async (_, res) => {
  // first try now playing
  const nowPlayingRes = await getNowPlaying();
  // if not playing fetch most recent
  const shouldFetchRecent = nowPlayingRes.status === 204 || nowPlayingRes.status > 400;
  const recentRes = shouldFetchRecent ? await getRecentlyPlayed() : null;

  const data = recentRes ? recentRes : nowPlayingRes; // set data
  const songData = await data.json();
  // pull info out based on nowPlaying or Recent (seperate bc data structure diffs)
  const track = recentRes ? await recentTrack(songData.items[0]) : await nowTrack(songData);

  return res.status(200).json({ ...track });
};

async function nowTrack(song) {
  const artistRes = await getCurrentArtistDetail(song.item.artists[0].href);
  const artistDetail = await artistRes.json();
  const genreList = artistDetail.genres;
  const albumImageUrl = song.item.album.images.filter(item => item.width < 500)[0].url;

  return {
    title: song.item.name,
    artist: song.item.artists.map(_artist => _artist.name).join(', '),
    album: song.item.album.name,
    albumImageUrl: albumImageUrl || null,
    songUrl: song.item.external_urls.spotify,
    genreList,
    isPlaying: song.is_playing,
    playedAt: false,
  };
}

async function recentTrack(song) {
  const artistRes = await getCurrentArtistDetail(song.track.artists[0].href);
  const artistDetail = await artistRes.json();
  const genreList = artistDetail.genres;
  const albumImageUrl = song.track.album.images.filter(item => item.width < 500)[0].url;

  return {
    title: song.track.name,
    artist: song.track.artists.map(_artist => _artist.name).join(', '),
    album: song.track.album.name,
    albumImageUrl: albumImageUrl || null,
    songUrl: song.track.external_urls.spotify,
    genreList,
    isPlaying: false,
    playedAt: song.played_at,
  };
}
