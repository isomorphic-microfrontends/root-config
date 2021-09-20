import { getImportMaps } from "single-spa-web-server-utils";
import { app } from "./app.js";
import { NextJSMicrofrontendRenderer } from "./renderers/nextjs-renderer.js";

app.get("/api/nextjs-assets/:appName", (req, res, next) => {
  const appName = decodeURIComponent(req.params.appName);
  const requestPath = decodeURIComponent(req.query.path);
  console.log("HEREEE", appName, requestPath);
  const renderer = new NextJSMicrofrontendRenderer({
    importMapsPromise: getImportMaps({
      url:
        "https://storage.googleapis.com/isomorphic.microfrontends.app/importmap.json",
      nodeKeyFilter(importMapKey) {
        return importMapKey.startsWith("@isomorphic-mf");
      },
      req,
      allowOverrides: true,
    }),
  });

  renderer
    .serverRender({
      appName: appName,
      propsPromise: Promise.resolve({
        name: appName,
      }),
    })
    .then(
      (result) => {
        res
          .status(200)
          .setHeader("content-type", "application/json")
          .send(result);
      },
      (err) => {
        console.error(err);
        res.status(500).end();
      }
    );
});
