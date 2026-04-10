import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useAppDispatch } from "../store";
import { tickReceived } from "../store/exchangeSlice";

let socket: Socket | null = null;

export function useExchangeSocket() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!socket) {
      socket = io("http://localhost:3000");
    }

    socket.on("exchange_tick", (payload) => {
      dispatch(tickReceived(payload));
    });

    return () => {
      if (socket) {
        socket.off("exchange_tick");
      }
    };
  }, [dispatch]);
}
