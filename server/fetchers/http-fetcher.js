import http from "http";
import https from "https";

export async function serverRender({
  appName,
  propsPromise,
  importMapsPromise,
  importSuffix,
}) {
  const { nodeImportMap, browserImportMap } = await importMapsPromise;
  const url = nodeImportMap.imports[appName + "/"];

  const protocol = url.startsWith("http://") ? http : https;

  if (!url) {
    throw Error(`Application ${appName} is not in the import map`);
  }

  return new Promise((resolve, reject) => {
    console.log("making request to", url);
    const req = protocol.request(url, (res) => {
      resolve(res);
    });

    req.on("error", reject);

    req.end();
  });
}

export async function getResponseHeaders({
  appName,
  importSuffix,
  importMapsPromise,
  propsPromise,
}) {
  return {};
}
