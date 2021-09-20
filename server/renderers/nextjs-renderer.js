import http from "http";
import https from "https";
import parse5 from "parse5";
import Serializer from "parse5/lib/serializer/index.js";
import treeAdapter from "parse5/lib/tree-adapters/default.js";

export class NextJSMicrofrontendRenderer {
  constructor({ importMapsPromise }) {
    this.importMapsPromise = importMapsPromise;

    this.contents = [];
    this.assets = [];

    this.parse5Adapter = this.parse5Adapter.bind(this);
  }
  async serverRender({ appName, propsPromise }) {
    const { nodeImportMap, browserImportMap } = await this.importMapsPromise;
    const url = nodeImportMap.imports[appName + "/"];

    const protocol = url.startsWith("http://") ? http : https;

    if (!url) {
      throw Error(`Application ${appName} is not in the import map`);
    }

    return new Promise((resolve, reject) => {
      const req = protocol.request(url, (res) => {
        let body = "";
        res.on("data", (data) => {
          body += data;
        });
        res.on("end", () => {
          // lop off trailing slash, since nextjs script src attributes have leading slash
          const baseUrl = url.slice(0, url.length - 1);

          const document = parse5.parse(body, {
            treeAdapter: this.parse5Adapter(baseUrl),
          });

          resolve({
            content: this.contents.map(serializeOuterHTML).join(""),
            assets: this.assets.map(serializeOuterHTML).join(""),
          });
        });
      });

      req.on("error", reject);

      req.end();
    });
  }
  async getResponseHeaders({ appName, propsPromise }) {
    return {};
  }

  parse5Adapter(baseUrl) {
    const renderer = this;

    return {
      ...treeAdapter,
      createElement(tagName, namespaceURI, attrs) {
        const result = treeAdapter.createElement(tagName, namespaceURI, attrs);

        if (
          tagName === "div" &&
          attrs.some((attr) => attr.name === "id" && attr.value === "__next")
        ) {
          renderer.contents.push(result);
        } else if (tagName === "script") {
          const src = attrs.find((attr) => attr.name === "src");
          if (src && src.value.startsWith("/")) {
            src.value = baseUrl + src.value;
          }
          renderer.contents.push(result);
        } else if (
          tagName === "noscript" &&
          attrs.some(
            (attr) =>
              attr.name === "id" && attr.value === "__next_css__DO_NOT_USE__"
          )
        ) {
          renderer.assets.push(result);
        } else if (
          tagName === "meta" &&
          attrs.some(
            (attr) => attr.name === "name" && attr.value === "next-head-count"
          )
        ) {
          renderer.assets.push(result);
        }

        return result;
      },
    };
  }
}

// https://github.com/inikulin/parse5/issues/230#issuecomment-865371476
function serializeOuterHTML(node) {
  const serializer = new Serializer(node);
  serializer._serializeElement(node);
  const result = serializer.html;
  return result;
}
