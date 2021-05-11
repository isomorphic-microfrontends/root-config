import express from "express";
import { app } from "./app.js";

app.use((req, res, next) => {
  console.log("req", req.path);
  if (req.path.startsWith("/_next")) {
    console.log("redirecting");
    res.redirect(`http://localhost:3000${req.path}`);
  } else {
    next();
  }
});
app.use(express.static("static"));
