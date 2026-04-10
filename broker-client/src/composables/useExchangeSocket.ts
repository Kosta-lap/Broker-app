// src/composables/useExchangeSocket.ts
import { ref, onMounted, onUnmounted } from "vue";
import { io, Socket } from "socket.io-client";
import type { TickPayload } from "../types";

let socket: Socket | null = null;
const listenersCount = ref(0);

const currentDate = ref<string>("");
const pricesMap = ref<Record<string, number>>({});
const historyMap = ref<Record<string, { date: string; price: number }[]>>({});

function resetExchangeState() {
  currentDate.value = "";
  pricesMap.value = {};
  historyMap.value = {};
}

function ensureSocket() {
  if (!socket) {
    socket = io("http://localhost:3000");
  }
}

export function useExchangeSocket() {
  onMounted(() => {
    ensureSocket();
    listenersCount.value++;

    const handler = (payload: TickPayload) => {
      currentDate.value = payload.date;

      const nextPrices: Record<string, number> = { ...pricesMap.value };

      payload.prices.forEach((p) => {
        const priceNum = parseFloat(p.price);
        nextPrices[p.symbol] = priceNum;

        const hist = historyMap.value[p.symbol] ?? [];
        historyMap.value[p.symbol] = [...hist, { date: payload.date, price: priceNum }];
      });

      pricesMap.value = nextPrices;
    };

    const resetHandler = () => {
      resetExchangeState();
    };

    socket!.on("exchange_tick", handler);
    socket!.on("exchange_reset", resetHandler);

    onUnmounted(() => {
      listenersCount.value--;
      socket!.off("exchange_tick", handler);
      socket!.off("exchange_reset", resetHandler);
    });
  });

  return {
    currentDate,
    pricesMap,
    historyMap,
  };
}
