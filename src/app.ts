import { config } from "dotenv";
config();
import express from 'express';
import { constants as APP_CONST } from "./constant/application";

import "./cron-job/coin.anaysis.cron";

const app = express();

app.use(express.json());

const PORT = APP_CONST.APP_PORT || 5500;

app.listen(PORT, (): void => {
    console.log('SERVER IS UP ON PORT:', PORT);
});
