const fetcher = (...args) => fetch(...args).then(res => res.json());

const { data } = fetcher('/api/spotify-track');

console.log(data);
