import axios from "axios";

export async function getFuturesSymbols(): Promise<string[]> {
    const endpoint = `https://fapi.binance.com/fapi/v1/exchangeInfo`;
    const response = await axios.get(endpoint);
    const symbols = response.data.symbols
        .filter((symbol: any) => symbol.status === 'TRADING')
        .map((symbol: any) => symbol.symbol);
    return symbols;
}

export async function getKlines(symbol: string, interval: string, limit: number): Promise<{ close: number, time: Date }[]> {
    const endpoint = `https://fapi.binance.com/fapi/v1/klines`;
    const response = await axios.get(endpoint, {
        params: {
            symbol: symbol,
            interval: interval,
            limit: limit
        }
    });
    return response.data.map((kline: any) => ({
        close: parseFloat(kline[4]),
        time: new Date(kline[0])
    }));
}