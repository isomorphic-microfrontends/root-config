# Isomorphic Microfrontends root config

This example shows server-rendered microfrontends, using [single-spa](https://single-spa.js.org/), [single-spa-layout](https://single-spa.js.org/docs/layout-overview), [@node-loader/import-maps](https://github.com/node-loader/node-loader-import-maps), and [@node-loader/http](https://github.com/node-loader/node-loader-http).

You can read more about how this works at https://single-spa.js.org/docs/ssr-overview.

The current example references Pokemon APIs for the demo

# Local Development

This project requires a NodeJS version that supports the [`--experimental-loader` flag](https://nodejs.org/api/esm.html#esm_experimental_loaders). I'm not sure exactly when it was added, but Node 14 definitely has support for it.

Additionally, this project may only work properly when the `yarn.lock` file is respected when installing dependencies. To do so, you may [install yarn](https://classic.yarnpkg.com/lang/en/) or use [npm@>=7](https://github.blog/2020-10-13-presenting-v7-0-0-of-the-npm-cli/)

```sh
yarn install
yarn develop
open http://localhost:9000
```
