import { configureStore } from "@reduxjs/toolkit";
import brokersReducer from "./brokersSlice";
import stocksReducer from "./stocksSlice";
import exchangeReducer from "./exchangeSlice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

export const store = configureStore({
  reducer: {
    brokers: brokersReducer,
    stocks: stocksReducer,
    exchange: exchangeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
