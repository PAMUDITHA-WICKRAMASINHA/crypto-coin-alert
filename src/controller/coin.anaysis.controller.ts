import { getFuturesSymbols, getKlines } from "./external.api.controller";
import { calculateEMA } from "./ma.controller";
import { calculateLastRSI } from "./rsi.controller";
import { sendTelegram } from "./telegram.message.controller";

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function processAllFuturesSymbols(): Promise<void> {
    const symbols = await getFuturesSymbols();
    if(symbols.length > 0){
        for (const symbol of symbols) {
            try {
    
                const klines = await getKlines(symbol, '15m', 100); 
                if(klines.length > 0){
                    const closePrices = klines.map((kline: { close: any; }) => kline.close);
    
                    const last_rsi = await calculateLastRSI(symbol, closePrices);
                    const last_ema = await calculateEMA(closePrices, 10);
        
                    let signal = 'hold';
        
                    if (parseFloat(last_rsi.rsi) > 70 && last_ema[last_ema.length - 1] > closePrices[closePrices.length - 1]) {
                        signal = 'sell';
                        await sendTelegram(`Symbol: ${symbol}, RSI: ${last_rsi.rsi}, EMA: ${last_ema[last_ema.length - 1]}, Close: ${closePrices[closePrices.length - 1]}, Signal: ${signal.toUpperCase()}`)
                        // console.log(`Symbol: ${symbol}, RSI: ${last_rsi.rsi}, EMA: ${last_ema[last_ema.length - 1]}, Close: ${closePrices[closePrices.length - 1]}, Signal: ${signal.toUpperCase()}`)
                    } else if (parseFloat(last_rsi.rsi) < 30 && last_ema[last_ema.length - 1] < closePrices[closePrices.length - 1]) {
                        signal = 'buy';
                        await sendTelegram(`Symbol: ${symbol}, RSI: ${last_rsi.rsi}, EMA: ${last_ema[last_ema.length - 1]}, Close: ${closePrices[closePrices.length - 1]}, Signal: ${signal.toUpperCase()}`)
                        // console.log(`Symbol: ${symbol}, RSI: ${last_rsi.rsi}, EMA: ${last_ema[last_ema.length - 1]}, Close: ${closePrices[closePrices.length - 1]}, Signal: ${signal.toUpperCase()}`)
                    }   
                }else{
                    // console.log("Klines data getting error")
                }
    
                await sleep(1000);
            } catch (error) {
                // console.error(`Error processing ${symbol}: ${error}`);
            }
        }
    }else{
        // console.log("Symbol data getting error")
    }
}