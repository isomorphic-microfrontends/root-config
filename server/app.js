import express from "express";
import path from "path";
import morgan from "morgan";

export const app = express();
app.use(morgan("tiny"));
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), "./server/views"));

const port = process.env.PORT || 9000;
console.log(`App is hosted at http://localhost:${port}/`);

app.listen(port);
