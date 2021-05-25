import express from "express";
import { app } from "./app.js";

app.use((req, res, next) => {
  if (req.path.startsWith("/_next")) {
    res.redirect(`http://localhost:3000${req.path}`);
  } else {
    next();
  }
});
app.use(express.static("static"));
