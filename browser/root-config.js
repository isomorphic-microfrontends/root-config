import { registerApplication, start } from "single-spa";
import * as isActive from "./activity-functions";

registerApplication(
  "@isomorphic-mf/navbar",
  () => System.import("@isomorphic-mf/navbar"),
  isActive.navbar
);

start();
