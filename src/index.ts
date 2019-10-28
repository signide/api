import * as express from "express";
import * as bodyParser from "body-parser";

const app = express();
const router = express.Router();

router.get("/hello", (req, res) => {
  res.send("hello world");
});
router.post("/", (req, res) => res.send(req.body));

app.use(bodyParser.json());
app.use("/api", router);

const port = 4000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
