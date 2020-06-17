import path from "path";
import morgan from "morgan";
import { app } from "./app.js";
import "./static.js";
import "./index-html.js";

app.use(morgan("tiny"));
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), "./server/views"));

console.log(`App is hosted at http://localhost:9000/`);
app.listen(9000);
