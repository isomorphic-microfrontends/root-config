import { app } from "./app.js";
import { importMapPromise } from "./importmap.js";
import ejs from "ejs";
import path from "path";
import parse5 from "parse5";
import fs from "fs";
import { constructRoutes, matchRoute } from "single-spa-layout";

const indexTemplate = fs.readFileSync(
  path.resolve("./server/views/index.ejs"),
  "utf-8"
);

app.use("*", (req, res) => {
  importMapPromise.then((importMap) => {
    importMap.imports[
      `@isomorphic-mf/root-config`
    ] = `http://localhost:9876/root-config.js`;
    importMap.imports[
      "@isomorphic-mf/navbar"
    ] = `http://localhost:8080/isomorphic-mf-navbar.js`;

    const htmlStr = ejs.render(indexTemplate, {
      importMap: JSON.stringify(importMap, null, 2),
    });

    const parsedTemplate = parse5.parse(htmlStr);
    console.log(parse5.serialize(parsedTemplate));
    const [routerElement, insertPreviousSibling] = findRouterElement(
      parsedTemplate
    );
    const allRoutes = constructRoutes(routerElement);
    const matchedRoutes = matchRoute(allRoutes, req.url);
    console.log("matchedRoutes", matchedRoutes);
    for (let i = matchedRoutes.routes.length - 1; i >= 0; i--) {
      const route = matchedRoutes.routes[i];
      if (route.type === "application") {
        const node = parse5.parseFragment(
          `<div id="single-spa-application:${route.name}"></div>`
        ).childNodes[0];
        console.log(node);
        insertPreviousSibling(node);
      }
    }
    console.log(parse5.serialize(parsedTemplate));
    const finalHtml = parse5.serialize(parsedTemplate);
    res.send(finalHtml);
  });
});

function findRouterElement(node) {
  const childNodes =
    (node.content && node.content.childNodes) || node.childNodes || [];
  for (let i = 0; i < childNodes.length; i++) {
    const child = childNodes[i];
    const hasChildren =
      ((child.content && child.content.childNodes) || child.childNodes || [])
        .length > 0;
    if (child.nodeName === "single-spa-router") {
      return [child, insertPreviousSibling];
    } else if (hasChildren) {
      const result = findRouterElement(child);
      if (result) {
        return result;
      }
    }

    function insertPreviousSibling(newNode) {
      const container = node.nodeName === "template" ? node.parentNode : node;
      // console.log('container', container.childNodes)
      container.childNodes.unshift(newNode);
      // console.log('container', container.childNodes)
    }
  }
}
