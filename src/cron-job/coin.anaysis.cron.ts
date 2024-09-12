import { scheduleJob } from "node-schedule"
import { processAllFuturesSymbols } from "../controller/coin.anaysis.controller";

let RUN_TIME = "*/10 * * * * *"
let isRunning = false

scheduleJob(RUN_TIME, async () => {
  if (isRunning) {
    return
  }
  isRunning = true
  
  try {
    await processAllFuturesSymbols();
    // console.log("-------------------------------------------------")

    isRunning = false
    return
  } catch (error) {
    console.error("<< Cron error", error)
    return
  }
})

