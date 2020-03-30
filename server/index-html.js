import { app } from "./app.js";
import { importMapPromise } from "./importmap.js";

app.use("*", (req, res) => {
  importMapPromise.then((importMap) => {
    importMap.imports[
      `@isomorphic-mf/root-config`
    ] = `http://localhost:9876/root-config.js`;

    res.render("index", {
      importMap: JSON.stringify(importMap, null, 2),
    });
  });
});
