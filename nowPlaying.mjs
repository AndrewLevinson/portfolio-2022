console.log('yo');
fetch('/api/spotify-track')
  .then(res => res.json())
  .then(data => {
    console.log('hi', data);
    const songInfo = document.querySelector('.song-into');

    songInfo.innerHTML = `
      <h5>
            Last song:
          </h5>
         <div class="flex">
            <img src=${data.albumImageUrl} alt={album image for ${data.album} by ${data.artist}} width={70}
              height={70} />
            <div class="info">
              <span>${data.title}</span>
              <span>${data.artist}</span>
              <div class="genreList">
                ${data.genreList
                  .slice(0, 3)
                  .map(genre => genre)
                  .join(', ')
                  .replace(/, ([^,]*)$/, ', and $1')}
              </div>
            </div>
          </div>
      
      `;
  });
