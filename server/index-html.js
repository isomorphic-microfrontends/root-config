import { app } from "./app.js";
import { importMapPromise } from "./importmap.js";
import stream from "stream";
import {
  constructServerLayout,
  setResponseHeaders,
  renderServerResponseBody,
} from "single-spa-layout/server";
import merge2 from "merge2";
import _ from "lodash";
import { getOverridesFromCookies, applyOverrides } from "import-map-overrides";

const serverLayout = constructServerLayout({
  filePath: "server/views/index.html",
});

app.use("*", (req, res) => {
  global.nodeLoader.setImportMapPromise(
    importMapPromise.then((map) => {
      const clone = _.cloneDeep(map);

      const finalMap = applyOverrides(clone, getOverridesFromCookies(req));

      Object.keys(finalMap.imports).forEach((key) => {
        if (!key.startsWith("@isomorphic-mf")) {
          delete finalMap.imports[key];
        }
      });

      // const finalMap = clone
      console.log("node", finalMap);
      return finalMap;
    })
  );

  const { bodyStream, applicationProps } = renderServerResponseBody(
    serverLayout,
    {
      urlPath: req.path,
      renderFragment(name) {
        const fragStream = new stream.Readable({
          read() {},
        });
        console.log("frag");
        importMapPromise.then((importMap) => {
          const browserImportMap = applyOverrides(
            importMap,
            getOverridesFromCookies(req)
          );
          fragStream.push(
            `<script type="systemjs-importmap">${JSON.stringify(
              browserImportMap,
              null,
              2
            )}</script>`
          );
          fragStream.push(null);
        });
        return fragStream;
      },
      renderApplication(props) {
        if (props.name) {
          const appStream = merge2();
          const importSpecifier = props.name + `/server.mjs?ts=${Date.now()}`;

          import(importSpecifier).then((app) => {
            const byteStream = app.serverRender(props);
            appStream.add(byteStream);
          });

          return appStream;
        } else {
          return "";
        }
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
  });
});
