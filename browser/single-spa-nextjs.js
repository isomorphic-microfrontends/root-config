import fetch from "node-fetch";

export function loadNextJSApp(name) {
  if (
    document.querySelector(
      `#${CSS.escape(`single-spa-application:${name}`)} #__next`
    )
  ) {
    return System.import(name);
  }

  return fetch(
    `/api/nextjs-assets/${encodeURIComponent(name)}?path=${encodeURIComponent(
      location.pathname
    )}`
  )
    .then((r) => {
      if (r.ok) {
        return r.json();
      } else {
        throw Error(
          `Unable to fetch nextjs asset manifest for application ${name}`
        );
      }
    })
    .then((json) => {
      let loadPromises = [];
      document.head.innerHTML += json.assets;
      const container = document.getElementById(
        `single-spa-application:${name}`
      );
      container.innerHTML = json.content;
      container.querySelectorAll("script[src]").forEach((scriptEl) => {
        loadPromises.push(
          new Promise((resolve, reject) => {
            scriptEl.addEventListener("load", resolve);
            scriptEl.addEventListener("error", () => {
              reject(
                Error(`Failed to load nextjs <script> from url ${scriptEl.src}`)
              );
            });
          })
        );
      });

      return Promise.all(loadPromises);
    })
    .then(() => {
      return System.import(name);
    });
}
