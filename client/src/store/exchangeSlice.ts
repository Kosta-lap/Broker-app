import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../api/http";

export interface ExchangeSettings {
  startDate: string;
  speedSeconds: number;
}

export interface TickPayload {
  date: string;
  prices: { symbol: string; price: string }[];
}

interface ExchangeState {
  settings: ExchangeSettings;
  currentDate: string;
  currentPrices: { symbol: string; price: string }[];
  timeline: TickPayload[]; // история имитации
}

const initialState: ExchangeState = {
  settings: { startDate: "", speedSeconds: 1 },
  currentDate: "",
  currentPrices: [],
  timeline: [],
};

export const fetchSettings = createAsyncThunk("exchange/fetchSettings", async () => {
  const res = await api.get<ExchangeSettings>("/exchange/settings");
  return res.data;
});

export const updateSettings = createAsyncThunk("exchange/updateSettings", async (settings: ExchangeSettings) => {
  const res = await api.post<ExchangeSettings>("/exchange/settings", settings);
  return res.data;
});

export const startExchange = createAsyncThunk("exchange/start", async () => {
  await api.post("/exchange/start", {});
});

const exchangeSlice = createSlice({
  name: "exchange",
  initialState,
  reducers: {
    tickReceived(state, action: PayloadAction<TickPayload>) {
      state.currentDate = action.payload.date;
      state.currentPrices = action.payload.prices;

      state.timeline.push(action.payload);

      if (state.timeline.length > 500) {
        state.timeline.shift();
      }
    },
    resetTimeline(state) {
      state.timeline = [];
      state.currentDate = "";
      state.currentPrices = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      });
  },
});

export const { tickReceived, resetTimeline } = exchangeSlice.actions;
export default exchangeSlice.reducer;
