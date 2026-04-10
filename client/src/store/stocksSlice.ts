import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api/http";

export interface Stock {
  symbol: string;
  name: string;
  active: boolean;
}

export interface StockHistoryPoint {
  date: string;
  open: string;
}

interface StocksState {
  items: Stock[];
  history: Record<string, StockHistoryPoint[]>;
  loading: boolean;
}

const initialState: StocksState = {
  items: [],
  history: {},
  loading: false,
};

export const fetchStocks = createAsyncThunk("stocks/fetchAll", async () => {
  const res = await api.get<Stock[]>("/stocks");
  return res.data;
});

export const fetchStockHistory = createAsyncThunk("stocks/fetchHistory", async (symbol: string) => {
  const res = await api.get<StockHistoryPoint[]>(`/stocks/${symbol}/history`);
  return { symbol, history: res.data };
});

export const setStockActive = createAsyncThunk("stocks/setActive", async (data: { symbol: string; active: boolean }) => {
  const res = await api.patch<Stock>(`/stocks/${data.symbol}/active`, { active: data.active });
  return res.data;
});

const stocksSlice = createSlice({
  name: "stocks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStocks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStocks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchStockHistory.fulfilled, (state, action) => {
        state.history[action.payload.symbol] = action.payload.history;
      })
      .addCase(setStockActive.fulfilled, (state, action) => {
        const idx = state.items.findIndex((s) => s.symbol === action.payload.symbol);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
      });
  },
});

export default stocksSlice.reducer;
