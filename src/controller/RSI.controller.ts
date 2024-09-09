import axios from 'axios';

// Store previous signal status for each symbol
const symbolSignals: Record<string, string> = {};

// Function to calculate RMA
function calculateRMA(previousRMA: number, currentValue: number, period: number): number {
    return ((previousRMA * (period - 1)) + currentValue) / period;
}

// Function to calculate RSI using RMA
async function calculateRSI(symbol: string): Promise<void> {
    const klines = await getKlines(symbol, '15m', 100); // Fetch 100 periods of 15m klines
    const closePrices = klines.map(kline => kline.close);

    let gains: number[] = [];
    let losses: number[] = [];

    // Calculate gains and losses
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

    // Calculate the initial average gain and loss (RMA)
    let avgGain = gains.slice(0, 14).reduce((a, b) => a + b, 0) / 14;
    let avgLoss = losses.slice(0, 14).reduce((a, b) => a + b, 0) / 14;

    // Array to hold RSI values
    let rsiArray: { time: Date, rsi: string }[] = [];

    // Calculate RSI values
    for (let i = 14; i < gains.length; i++) {
        avgGain = calculateRMA(avgGain, gains[i], 14);
        avgLoss = calculateRMA(avgLoss, losses[i], 14);

        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));

        rsiArray.push({ time: klines[i + 1].time, rsi: rsi.toFixed(2) });
    }

    // Get the last RSI value
    const lastRSI = rsiArray[rsiArray.length - 1];
    let signal: string | null = null;

    // Determine signal based on RSI
    if (parseFloat(lastRSI.rsi) > 70) {
        signal = 'sell';  // Overbought signal
    } else if (parseFloat(lastRSI.rsi) < 30) {
        signal = 'buy';   // Oversold signal
    } else {
        signal = 'hold';  // Neutral signal
    }

    // Compare the signal with the previous one and log only if it changed
    if (!symbolSignals[symbol] || symbolSignals[symbol] !== signal) {
        console.log(`Symbol: ${symbol} | Time: ${lastRSI.time.toISOString()} | RSI: ${lastRSI.rsi} | Signal: ${signal.toUpperCase()}`);
        symbolSignals[symbol] = signal;  // Update the signal status
    } else {
        // console.log(`Symbol: ${symbol} | No change in signal (${signal.toUpperCase()})`);
    }
}

// Function to fetch 15-minute klines from Binance API
async function getKlines(symbol: string, interval: string, limit: number): Promise<{ close: number, time: Date }[]> {
    const endpoint = `https://fapi.binance.com/fapi/v1/klines`;
    const response = await axios.get(endpoint, {
        params: {
            symbol: symbol,
            interval: interval,
            limit: limit
        }
    });
    return response.data.map((kline: any) => ({
        close: parseFloat(kline[4]),  // Closing price
        time: new Date(kline[0]) // Convert timestamp to Date object
    }));
}

// Function to fetch all Binance futures trading symbols
async function getFuturesSymbols(): Promise<string[]> {
    const endpoint = `https://fapi.binance.com/fapi/v1/exchangeInfo`;
    const response = await axios.get(endpoint);
    const symbols = response.data.symbols
        .filter((symbol: any) => symbol.status === 'TRADING')
        .map((symbol: any) => symbol.symbol);
    return symbols;
}

// Function to process all futures symbols and calculate RSI
export async function processAllFuturesSymbols(): Promise<void> {
    const symbols = await getFuturesSymbols();
    for (const symbol of symbols) {
        try {
            await calculateRSI(symbol);
        } catch (error) {
            console.error(`Error processing ${symbol}: ${error}`);
        }
    }
}

