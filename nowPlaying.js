fetch('/api/spotify-track')
  .then(res => res.json())
  .then(data => {
    console.log('hi', data);
  });
