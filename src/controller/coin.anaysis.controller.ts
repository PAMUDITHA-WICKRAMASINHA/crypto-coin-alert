import { getFuturesSymbols, getKlines } from "./external.api.controller";
import { sendTelegram } from "./telegram.message.controller";
const { MACD, RSI, SMA, EMA } = require('technicalindicators');

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let symbol_status: any[] = [];
export async function processAllFuturesSymbols(): Promise<void> {
    // const symbols = await getFuturesSymbols();
    const symbols = ["ADAUSDT", "YGGUSDT"]
    if(symbols.length > 0){
        for (const symbol of symbols) {
            try {

                 const symbolEntry = symbol_status.find(data => data.symbol === symbol);
                if (!symbolEntry) {
                    symbol_status.push({ symbol: symbol, point: "None" });
                }

                const updatedSymbolEntry = symbol_status.find(data => data.symbol === symbol);
    
                const klines = await getKlines(symbol, '15m', 100); 
                if(klines.length > 0){
                    const shortPeriod = 12
                    const longPeriod = 26
                    const signalPeriod = 9

                    const rsi_period = 14
                    const ma_period = 9
                    const closePrices = klines.map((kline: { close: any; }) => kline.close);
    
                    const rsiema_result = await RSIEMA(symbol, closePrices, rsi_period, ma_period);
                    const macdupper_result = await MACDUPPER(symbol, closePrices, shortPeriod, longPeriod, signalPeriod)
                    // console.log(`----> Symbol: ${symbol}, RSI: ${rsiema_result}, MACD: ${macdupper_result}`);
                    
                    if((rsiema_result == macdupper_result || macdupper_result == "Buy-c" || macdupper_result == "Sell-c") && rsiema_result != "Hold" && macdupper_result != "Hold" && updatedSymbolEntry.point !== macdupper_result){
                        console.log(`Symbol: ${symbol}, Signal: ${macdupper_result}`);
                        await sendTelegram(`Symbol: ${symbol}, Signal: ${macdupper_result}`)
                        updatedSymbolEntry.point = macdupper_result;
                    }
                }else{
                    console.log("Klines data getting error")
                }
    
                await sleep(300);
            } catch (error) {
                console.error(`Error processing ${symbol}: ${error}`);
            }
        }
    }else{
        console.log("Symbol data getting error")
    }
}

// let ema_symbol_status: any[] = [];
async function RSIEMA(symbol:string, closePrices: any, rsi_period: number, ma_period: number) {

    const rsi = RSI.calculate({
        values: closePrices,
        period: rsi_period,
    });

    const ema = EMA.calculate({
        values: rsi,
        period: ma_period,
    });
 
    if (rsi.length < 1 || ema.length < 1) {
        console.log('Not enough data to generate RSI or EMA results.');
        return "Hold";
    }
    
    const currRsi = rsi[rsi.length - 1];
    const currEma = ema[ema.length - 1];

    // const symbolEntry = ema_symbol_status.find(data => data.symbol === symbol);
    // if (!symbolEntry) {
    //     ema_symbol_status.push({ symbol: symbol, point: "None" });
    // }

    // const updatedSymbolEntry = ema_symbol_status.find(data => data.symbol === symbol);

    //&& updatedSymbolEntry.point !== "Buy"
    if (currRsi > currEma ) {
        // console.log(`${symbol}: Buy`);
        // updatedSymbolEntry.point = "Buy";
        return "Buy"
    }

    if (currRsi < currEma) {
        // console.log(`${symbol}: Sell`);
        // updatedSymbolEntry.point = "Sell";
        return "Sell"
    }

    return "Hold";
}

// let macd_symbol_status: any[] = [];
async function MACDUPPER(symbol: string, closePrices: any, shortPeriod: number, longPeriod: number, signalPeriod: number) {
    const inputMACD = {
        values: closePrices,
        fastPeriod: shortPeriod,
        slowPeriod: longPeriod,
        signalPeriod: signalPeriod, 
        SimpleMAOscillator: false,
        SimpleMASignal: false
    };
    
    const macdResult = MACD.calculate(inputMACD);
    
    if (macdResult.length < 1) {
        console.log('Not enough data to generate MACD results.');
        return "Hold";
    }

    const currMacd = macdResult[macdResult.length - 1].MACD;
    const currSignal = macdResult[macdResult.length - 1].signal;
    const currHistogram = macdResult[macdResult.length - 1].histogram;
    const privHistogram = macdResult[macdResult.length - 2].histogram;

    // const symbolEntry = macd_symbol_status.find(data => data.symbol === symbol);

    // if (!symbolEntry) {
    //     macd_symbol_status.push({ symbol: symbol, point: "None" });
    // }

    // const updatedSymbolEntry = macd_symbol_status.find(data => data.symbol === symbol);
    // && updatedSymbolEntry.point !== "Buy"
    if (currMacd > currSignal && currHistogram < privHistogram) {
        // console.log(`${symbol}: Buy, Histogram: ${currHistogram}`);
        // updatedSymbolEntry.point = "Buy";
        return "Buy"
    // && (updatedSymbolEntry.point === "Buy" || updatedSymbolEntry.point !== "Buy-c") 
    }else if(currMacd > currSignal && currHistogram > privHistogram){
        // updatedSymbolEntry.point = "Buy-c";
        return "Buy-c"
    }
    
    if (currMacd < currSignal && currHistogram < privHistogram) {
        // console.log(`${symbol}: Sell, Histogram: ${currHistogram}`);
        // updatedSymbolEntry.point = "Sell";
        return "Sell"
    }else if(currMacd < currSignal && currHistogram > privHistogram){
        // updatedSymbolEntry.point = "Sell-c";
        return "Sell-c"
    }
    return "Hold";
}
