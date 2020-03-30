import path from "path";
import { app } from "./app.js";
import "./index-html.js";

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), "./server/views"));

app.listen(9000);
