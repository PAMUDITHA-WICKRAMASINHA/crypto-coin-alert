import { config } from "dotenv";
config();
import express, { Application, Request, Response } from 'express';
import { constants as APP_CONST } from "./constant/application";
import routes from "./routes/routes";

import deserializeUser from "./midleware/deserializeUser";

const app = express();

app.use(express.json());

app.use(deserializeUser)

const PORT = APP_CONST.APP_PORT || 4000;

app.listen(PORT, (): void => {
    console.log('SERVER IS UP ON PORT:', PORT);
    routes(app);
});
