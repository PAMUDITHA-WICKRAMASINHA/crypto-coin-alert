import { config } from "dotenv";
config();
import express, { Application, Request, Response } from 'express';
import { constants as APP_CONST } from "./constant/application";
import { processAllFuturesSymbols } from "./controller/RSI.controller";

const app = express();

app.use(express.json());

const PORT = APP_CONST.APP_PORT || 4000;

app.listen(PORT, (): void => {
    console.log('SERVER IS UP ON PORT:', PORT);
});

// setInterval(()=>{
//     // Run the script
// }, 1000 * 5)

processAllFuturesSymbols();

