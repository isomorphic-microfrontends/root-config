import { addErrorHandler, registerApplication, start } from "single-spa";
import {
  constructRoutes,
  constructApplications,
  constructLayoutEngine,
} from "single-spa-layout";
import { loadNextJSApp } from "./single-spa-nextjs";

const routes = constructRoutes(document.querySelector("#single-spa-layout"));
const applications = constructApplications({
  routes,
  loadApp({ name }) {
    if (isNextJS(name)) {
      return loadNextJSApp(name);
    } else {
      return System.import(name);
    }
  },
});
const layoutEngine = constructLayoutEngine({ routes, applications });

applications.forEach(registerApplication);
start();

addErrorHandler((err) => {
  console.error(err);
});

function isNextJS(name) {
  return ["@isomorphic-mf/trainers"].includes(name);
}
