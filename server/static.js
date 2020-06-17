import express from "express";
import { app } from "./app.js";

app.use(express.static("static"));
