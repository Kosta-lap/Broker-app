import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../api/http";

export interface Broker {
  id: number;
  name: string;
  balance: number;
}

interface BrokersState {
  items: Broker[];
  loading: boolean;
}

const initialState: BrokersState = {
  items: [],
  loading: false,
};

export const fetchBrokers = createAsyncThunk("brokers/fetchAll", async () => {
  const res = await api.get<Broker[]>("/brokers");
  return res.data;
});

export const createBroker = createAsyncThunk("brokers/create", async (data: { name: string; balance: number }) => {
  const res = await api.post<Broker>("/brokers", data);
  return res.data;
});

export const updateBroker = createAsyncThunk("brokers/update", async (data: { id: number; balance: number }) => {
  const res = await api.patch<Broker>(`/brokers/${data.id}`, { balance: data.balance });
  return res.data;
});

export const deleteBroker = createAsyncThunk("brokers/delete", async (id: number) => {
  await api.delete(`/brokers/${id}`);
  return id;
});

const brokersSlice = createSlice({
  name: "brokers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrokers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBrokers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(createBroker.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateBroker.fulfilled, (state, action) => {
        const idx = state.items.findIndex((b) => b.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteBroker.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((b) => b.id !== action.payload);
      });
  },
});

export default brokersSlice.reducer;
