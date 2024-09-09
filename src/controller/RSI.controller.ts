import axios from 'axios';
import { getKlines } from './external.api.controller';

const symbolSignals: Record<string, string> = {};

function calculateRMA(previousRMA: number, currentValue: number, period: number): number {
    return ((previousRMA * (period - 1)) + currentValue) / period;
}


export async function calculateRSI(period: number, closingPrices: any[]) {

    let gains = [];
    let losses = [];

    // Calculate gains and losses
    for (let i = 1; i < closingPrices.length; i++) {
        const change = closingPrices[i] - closingPrices[i - 1];
        if (change > 0) {
            gains.push(change);
            losses.push(0);
        } else {
            gains.push(0);
            losses.push(Math.abs(change));
        }
    }

    // Calculate the initial average gain and loss (RMA)
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    // Array to hold RSI values
    let rsiArray = [];

    // Calculate RSI values
    for (let i = period; i < gains.length; i++) {
        avgGain = calculateRMA(avgGain, gains[i], period);
        avgLoss = calculateRMA(avgLoss, losses[i], period);

        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));

        rsiArray.push(rsi);
    }

    return rsiArray;

}

export async function calculateLastRSI(symbol: string, closePrices: any[]) {

    let gains: number[] = [];
    let losses: number[] = [];

    for (let i = 1; i < closePrices.length; i++) {
        const change = closePrices[i] - closePrices[i - 1];
        if (change > 0) {
            gains.push(change);
            losses.push(0);
        } else {
            gains.push(0);
            losses.push(Math.abs(change));
        }
    }

    let avgGain = gains.slice(0, 14).reduce((a, b) => a + b, 0) / 14;
    let avgLoss = losses.slice(0, 14).reduce((a, b) => a + b, 0) / 14;

    let rsiArray: { rsi: string }[] = [];

    for (let i = 14; i < gains.length; i++) {
        avgGain = calculateRMA(avgGain, gains[i], 14);
        avgLoss = calculateRMA(avgLoss, losses[i], 14);

        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));

        rsiArray.push({ rsi: rsi.toFixed(2) });
    }

    // const lastRSI = rsiArray[rsiArray.length - 1];
    // let signal: string | null = null;

    // if (parseFloat(lastRSI.rsi) > 75) {
    //     signal = 'sell';
    // } else if (parseFloat(lastRSI.rsi) < 25) {
    //     signal = 'buy';  
    // } else {
    //     signal = 'hold'; 
    // }

    return {
     symbol: symbol,
     rsi: rsiArray[rsiArray.length - 1].rsi,
    //  signal: signal.toUpperCase()
    }
    // if ((!symbolSignals[symbol] || symbolSignals[symbol] !== signal) && signal !== "hold") {
    //     console.log(`Symbol: ${symbol} | Time: ${lastRSI.time.toISOString()} | RSI: ${lastRSI.rsi} | Signal: ${signal.toUpperCase()}`);
    //     symbolSignals[symbol] = signal;  // Update the signal status
    // } else {
    //     console.log(`Symbol: ${symbol} | No change in signal (${signal.toUpperCase()})`);
    // }
}


