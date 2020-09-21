import { app } from "./app.js";
import {
  constructServerLayout,
  setResponseHeaders,
  renderServerResponseBody,
} from "single-spa-layout/server";
import _ from "lodash";
import { getImportMaps } from "single-spa-web-server-utils";

const serverLayout = constructServerLayout({
  filePath: "server/views/index.html",
});

app.use("*", (req, res, next) => {
  getImportMaps({
    url:
      "https://storage.googleapis.com/isomorphic.microfrontends.app/importmap.json",
    nodeKeyFilter(importMapKey) {
      return importMapKey.startsWith("@isomorphic-mf");
    },
    req,
    allowOverrides: true,
  }).then(({ nodeImportMap, browserImportMap }) => {
    global.nodeLoader.setImportMapPromise(Promise.resolve(nodeImportMap));

    const { bodyStream, applicationProps } = renderServerResponseBody(
      serverLayout,
      {
        urlPath: req.path,
        renderFragment(name) {
          return `<script type="systemjs-importmap">${JSON.stringify(
            browserImportMap,
            null,
            2
          )}</script>`;
        },
        renderApplication(props) {
          return import(
            props.name + `/server.mjs?ts=${Date.now()}`
          ).then((app) => app.serverRender(props));
        },
      }
    );

    setResponseHeaders({
      res,
      applicationProps,
      retrieveApplicationHeaders(props) {
        return {
          "x-www-joel": "value",
        };
      },
      mergeHeaders(headers) {
        return headers.length > 0 ? headers[0] : {};
      },
    }).then(() => {
      bodyStream.pipe(res);
      next();
    });
  });
});
