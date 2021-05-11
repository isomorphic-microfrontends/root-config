export async function serverRender({
  appName,
  propsPromise,
  importMapsPromise,
  importSuffix,
}) {
  await importMapsPromise;
  const [app, props] = await Promise.all([
    import(appName + `/server.mjs${importSuffix}`),
    propsPromise,
  ]);
  return app.serverRender(props);
}

export async function getResponseHeaders({
  appName,
  importSuffix,
  importMapsPromise,
  propsPromise,
}) {
  await importMapsPromise;
  const [app, props] = await Promise.all([
    import(appName + `/server.mjs${importSuffix}`),
    propsPromise,
  ]);
  return app.getResponseHeaders(props);
}
