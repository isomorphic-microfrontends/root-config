import fetch from "node-fetch";

export let importMapPromise;

function fetchImportMap() {
  return (importMapPromise = fetch(
    "https://storage.googleapis.com/isomorphic.microfrontends.app/importmap.json"
  )
    .then((r) => r.json())
    .catch((err) => {
      console.error(`Failed to fetch import map`);
      console.error(err);
    }));
}

fetchImportMap();

setInterval(fetchImportMap, 30000);
