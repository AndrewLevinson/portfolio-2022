fetch('/api/spotify-track.mjs')
  .then(res => res.json())
  .then(data => {
    console.log(data);
  });
