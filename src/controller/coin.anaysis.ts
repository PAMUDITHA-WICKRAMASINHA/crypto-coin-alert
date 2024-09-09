import { getFuturesSymbols, getKlines } from "./external.api.controller";
import { calculateEMA } from "./ma.controller";
import { calculateLastRSI } from "./rsi.controller";

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function processAllFuturesSymbols(): Promise<void> {
    const symbols = await getFuturesSymbols();
    for (const symbol of symbols) {
        try {

            const klines = await getKlines(symbol, '15m', 100); 
            const closePrices = klines.map(kline => kline.close);

            const last_rsi = await calculateLastRSI(symbol, closePrices);
            const last_ema = await calculateEMA(closePrices, 10);

            let signal = 'hold';

            if (parseFloat(last_rsi.rsi) > 75 && last_ema[last_ema.length - 1] > closePrices[closePrices.length - 1]) {
                signal = 'sell';
            } else if (parseFloat(last_rsi.rsi) < 30 && last_ema[last_ema.length - 1] < closePrices[closePrices.length - 1]) {
                signal = 'buy';  
            }

            console.log(`RSI: ${last_rsi.rsi}, EMA: ${last_ema[last_ema.length - 1]}, Close: ${closePrices[closePrices.length - 1]}, Signal: ${signal.toUpperCase()}`)
            await sleep(1000);
        } catch (error) {
            console.error(`Error processing ${symbol}: ${error}`);
        }
    }
}