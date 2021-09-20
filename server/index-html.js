import { app } from "./app.js";
import {
  constructServerLayout,
  sendLayoutHTTPResponse,
} from "single-spa-layout/server";
import _ from "lodash";
import { getImportMaps } from "single-spa-web-server-utils";
import { ModuleLoadingMicrofrontendRenderer } from "./renderers/module-loading-renderer.js";
import { NextJSMicrofrontendRenderer } from "./renderers/nextjs-renderer.js";
import { MicrofrontendOrchestrator } from "./renderers/microfrontend-orchestrator.js";

const serverLayout = constructServerLayout({
  filePath: "server/views/index.html",
});

app.use("*", (req, res, next) => {
  const developmentMode = process.env.NODE_ENV === "development";
  const importSuffix = developmentMode ? `?ts=${Date.now()}` : "";

  const importMapsPromise = getImportMaps({
    url:
      "https://storage.googleapis.com/isomorphic.microfrontends.app/importmap.json",
    nodeKeyFilter(importMapKey) {
      return importMapKey.startsWith("@isomorphic-mf");
    },
    req,
    allowOverrides: true,
  }).then(({ nodeImportMap, browserImportMap }) => {
    global.nodeLoader.setImportMapPromise(Promise.resolve(nodeImportMap));
    if (developmentMode) {
      browserImportMap.imports["@isomorphic-mf/root-config"] =
        "http://localhost:9876/isomorphic-mf-root-config.js";
      browserImportMap.imports["@isomorphic-mf/root-config/"] =
        "http://localhost:9876/";
    }
    return { nodeImportMap, browserImportMap };
  });

  const props = {
    user: {
      id: 1,
      name: "Test User",
    },
  };

  const fragments = {
    importmap: async () => {
      const { browserImportMap } = await importMapsPromise;
      return `<script type="systemjs-importmap">${JSON.stringify(
        browserImportMap,
        null,
        2
      )}</script>`;
    },
  };

  const renderFragment = (name) => fragments[name]();

  const processor = new MicrofrontendOrchestrator();

  processor.setFetcher(
    "@isomorphic-mf/navbar",
    new ModuleLoadingMicrofrontendRenderer({ importMapsPromise, importSuffix })
  );
  processor.setFetcher(
    "@isomorphic-mf/pokemons",
    new ModuleLoadingMicrofrontendRenderer({ importMapsPromise, importSuffix })
  );
  processor.setFetcher(
    "@isomorphic-mf/trainers",
    new NextJSMicrofrontendRenderer({
      importMapsPromise,
    })
  );

  sendLayoutHTTPResponse({
    serverLayout,
    urlPath: req.originalUrl,
    res,
    renderFragment,
    renderApplication: processor.renderApplication,
    retrieveApplicationHeaders: processor.retrieveApplicationHeaders,
    async retrieveProp(propName) {
      return props[propName];
    },
    assembleFinalHeaders(allHeaders) {
      return Object.assign({}, Object.values(allHeaders));
    },
  })
    .then(next)
    .catch((err) => {
      console.error(err);
      res.status(500).send("A server error occurred");
    });
});
