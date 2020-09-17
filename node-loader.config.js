import * as importMapLoader from "@node-loader/import-maps";
import * as httpLoader from "@node-loader/http";

export default {
  loaders: [httpLoader, importMapLoader],
};
