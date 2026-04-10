<template>
    <div class="card p-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <h3 class="mb-0">Администратор — участники торгов</h3>
                <small class="text-muted">
                    Текущая имитируемая дата: <strong>{{ currentDate || "—" }}</strong>
                </small>
            </div>
            <button class="btn btn-outline-info btn-sm" @click="loadSummary">
                Обновить данные
            </button>
        </div>

        <div class="table-responsive">
            <table class="table table-striped table-sm table-profit align-middle" v-if="rows.length">
                <thead>
                    <tr>
                        <th>Брокер</th>
                        <th>Тикер</th>
                        <th>Кол-во</th>
                        <th>Средняя</th>
                        <th>Текущая</th>
                        <th>Стоимость</th>
                        <th>P/L</th>
                        <th>Денежные средства</th>
                        <th>Общий баланс</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in rows" :key="row.key">
                        <td class="py-3">{{ row.brokerName }}</td>
                        <td class="py-3">{{ row.symbol || "—" }}</td>
                        <td class="py-3">{{ row.quantity || 0 }}</td>
                        <td class="py-3">{{ row.avgPrice ? row.avgPrice.toFixed(2) : "—" }}</td>
                        <td class="py-3">
                            <span v-if="row.currentPrice !== null">
                                {{ row.currentPrice.toFixed(2) }}
                            </span>
                            <span v-else class="text-muted">—</span>
                        </td>
                        <td class="py-3">{{ row.marketValue.toFixed(2) }}</td>
                        <td class="py-3" :class="{
                            'profit-positive': row.profitLoss > 0,
                            'profit-negative': row.profitLoss < 0,
                        }">
                            {{ row.profitLoss.toFixed(2) }}
                        </td>
                        <td class="py-3">{{ row.cash.toFixed(2) }}</td>
                        <td class="py-3">{{ row.totalBalance.toFixed(2) }}</td>
                    </tr>
                </tbody>
            </table>
            <div v-else class="text-muted">Нет данных по брокерам.</div>
        </div>



        <div class="text-danger mt-2" v-if="error">{{ error }}</div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { api } from "../api/http";
import type { AdminBrokerSummary, Position } from "../types";
import { useExchangeSocket } from "../composables/useExchangeSocket";

const { currentDate, pricesMap } = useExchangeSocket();

const summary = ref<AdminBrokerSummary[]>([]);
const error = ref<string>("");

const loadSummary = async () => {
    error.value = "";
    try {
        const { data } = await api.get<AdminBrokerSummary[]>("/trading/admin/summary");
        summary.value = data;
    } catch (e: any) {
        console.error(e);
        error.value = "Ошибка загрузки данных";
    }
};

onMounted(() => {
    loadSummary();
});

interface Row {
    key: string;
    brokerName: string;
    symbol: string | null;
    quantity: number;
    avgPrice: number | null;
    currentPrice: number | null;
    marketValue: number;
    profitLoss: number;
    cash: number;
    totalBalance: number;
}

const rows = computed<Row[]>(() => {
    const prices = pricesMap.value;
    const result: Row[] = [];

    summary.value.forEach((b) => {
        const positions = b.positions.length ? b.positions : [null as unknown as Position];

        positions.forEach((p, idx) => {
            const symbol = p ? p.symbol : null;
            const quantity = p ? p.quantity : 0;
            const avgPrice = p ? p.avgPrice : null;
            const currentPrice =
                symbol && prices[symbol] !== undefined ? prices[symbol] : null;
            const marketValue =
                symbol && currentPrice !== null ? currentPrice * quantity : 0;
            const profitLoss =
                symbol && currentPrice !== null && avgPrice !== null
                    ? (currentPrice - avgPrice) * quantity
                    : 0;
            const totalBalance = b.cash + marketValue;

            result.push({
                key: `${b.id}-${idx}-${symbol ?? "none"}`,
                brokerName: b.name,
                symbol,
                quantity,
                avgPrice,
                currentPrice,
                marketValue,
                profitLoss,
                cash: b.cash,
                totalBalance,
            });
        });
    });

    return result;
});
</script>
