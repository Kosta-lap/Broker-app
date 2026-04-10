<template>
    <div v-if="!currentUser">
        <div class="alert alert-warning">Сначала войдите как брокер.</div>
    </div>

    <div v-else>
        <div class="row mb-4">
            <div class="col-md-6">
                <h3>Личный кабинет брокера: {{ currentUser.name }}</h3>
                <p>Текущая дата торгов: <strong>{{ currentDate || "—" }}</strong></p>
            </div>
            <div class="col-md-6">
                <div class="card p-3">
                    <h5 class="mb-2">Баланс</h5>
                    <p class="mb-1">
                        Денежные средства: <strong>{{ cash.toFixed(2) }}</strong>
                    </p>
                    <p class="mb-1">
                        Рыночная стоимость акций: <strong>{{ portfolioValue.toFixed(2) }}</strong>
                    </p>
                    <p class="mb-0">
                        Общий баланс: <strong>{{ totalBalance.toFixed(2) }}</strong>
                    </p>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-12 mb-4">
                <div class="card p-3">
                    <h5 class="mb-3">Мои позиции</h5>
                    <div class="table-responsive">
                        <table class="table table-sm table-profit align-middle" v-if="positions.length">
                            <thead>
                                <tr>
                                    <th>Тикер</th>
                                    <th>Кол-во</th>
                                    <th>Средняя цена</th>
                                    <th>Текущая</th>
                                    <th>Стоимость</th>
                                    <th>P/L</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="p in positions" :key="p.symbol">
                                    <td>{{ p.symbol }}</td>
                                    <td>{{ p.quantity }}</td>
                                    <td>{{ p.avgPrice.toFixed(2) }}</td>
                                    <td>
                                        <span v-if="currentPrices[p.symbol] !== undefined">
                                            {{ currentPrices[p.symbol].toFixed(2) }}
                                        </span>
                                        <span v-else class="text-muted">—</span>
                                    </td>
                                    <td>{{ marketValue(p).toFixed(2) }}</td>
                                    <td :class="{
                                        'profit-positive': profitLoss(p) > 0,
                                        'profit-negative': profitLoss(p) < 0,
                                    }">
                                        {{ profitLoss(p).toFixed(2) }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div v-else class="text-muted">У вас пока нет купленных акций.</div>
                    </div>
                </div>
            </div>
            <div class="col-12 mb-4">
                <div class="card p-3">
                    <h5 class="mb-3">Доступные акции</h5>

                    <div class="table-responsive">
                        <table class="table align-middle">
                            <thead>
                                <tr>
                                    <th>Тикер</th>
                                    <th>Компания</th>
                                    <th>Цена</th>
                                    <th>Количество</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="s in activeStocks" :key="s.symbol">
                                    <td>{{ s.symbol }}</td>
                                    <td>{{ s.name }}</td>
                                    <td>
                                        <span v-if="currentPrices[s.symbol] !== undefined">
                                            {{ currentPrices[s.symbol].toFixed(2) }}
                                        </span>
                                        <span v-else class="text-muted">—</span>
                                    </td>
                                    <td>
                                        <input type="number" min="1" class="form-control form-control-sm"
                                            v-model.number="amounts[s.symbol]" />
                                    </td>
                                    <td>
                                        <div class="btn-group btn-group-sm">
                                            <button class="btn btn-outline-info" @click="onBuy(s.symbol)">
                                                Купить
                                            </button>
                                            <button class="btn btn-outline-danger" @click="onSell(s.symbol)">
                                                Продать
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="text-danger mt-2" v-if="error">{{ error }}</div>
                </div>
            </div>
            <div class="col-12 mb-4">
                <div class="card p-3">
                    <h5 class="mb-3">Графики изменения цены</h5>

                    <ul class="nav nav-tabs mb-3">
                        <li class="nav-item" v-for="s in activeStocks" :key="s.symbol">
                            <button type="button" class="nav-link" :class="{ active: showChartSymbol === s.symbol }"
                                @click="openChart(s.symbol)">
                                {{ s.symbol }}
                            </button>
                        </li>
                    </ul>

                    <div v-if="showChartSymbol">
                        <div class="position-relative canvas-block">
                            <StockChart :symbol="showChartSymbol" :points="historyMap[showChartSymbol] ?? []" />
                        </div>
                        <div class="form-text mt-2 text-center">
                            Показана динамика цены с начала торгов до текущего момента.
                        </div>
                    </div>
                    <div v-else class="text-muted">
                        Нет активных акций для отображения графика.
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { api } from "../api/http";
import type { PortfolioResponse, Stock, Position } from "../types";
import { useAuth } from "../composables/useAuth";
import { useExchangeSocket } from "../composables/useExchangeSocket";
import StockChart from "../components/StockChart.vue";

const { currentUser } = useAuth();
const { currentDate, pricesMap, historyMap } = useExchangeSocket();

const portfolio = ref<PortfolioResponse | null>(null);
const stocks = ref<Stock[]>([]);
const error = ref<string>("");

const amounts = reactive<Record<string, number>>({});
const showChartSymbol = ref<string | null>(null);

const loadPortfolio = async () => {
    if (!currentUser.value) return;
    const { data } = await api.get<PortfolioResponse>(`/trading/broker/${currentUser.value.id}`);
    portfolio.value = data;
};

const loadStocks = async () => {
    const { data } = await api.get<Stock[]>("/stocks");
    // только активные акции
    stocks.value = data.filter((s) => s.active);
    stocks.value.forEach((s) => {
        if (!amounts[s.symbol]) amounts[s.symbol] = 1;
    });
};

onMounted(() => {
    Promise.all([loadPortfolio(), loadStocks()]).catch((e) => {
        console.error(e);
        error.value = "Ошибка загрузки данных";
    });
});

const activeStocks = computed(() => stocks.value);
const positions = computed(() => portfolio.value?.positions ?? []);
const cash = computed(() => portfolio.value?.cash ?? 0);
const currentPrices = computed(() => pricesMap.value);

const marketValue = (p: Position) => {
    const price = currentPrices.value[p.symbol];
    if (price === undefined) return 0;
    return price * p.quantity;
};

const profitLoss = (p: Position) => {
    const price = currentPrices.value[p.symbol];
    if (price === undefined) return 0;
    return (price - p.avgPrice) * p.quantity;
};

const portfolioValue = computed(() =>
    positions.value.reduce((sum, p) => sum + marketValue(p), 0)
);
const totalBalance = computed(() => cash.value + portfolioValue.value);

const onTrade = async (symbol: string, side: "buy" | "sell") => {
    error.value = "";
    if (!currentUser.value) return;

    let qty = amounts[symbol] ?? 0;
    qty = qty * 2;
    amounts[symbol] = amounts[symbol] *2;

    const price = currentPrices.value[symbol];

    if (!price) {
        error.value = "Нет текущей цены для этой акции";
        return;
    }

    if (!qty || qty <= 0) {
        error.value = "Количество должно быть > 0";
        return;
    }

    try {
        const { data } = await api.post<PortfolioResponse>(
            `/trading/broker/${currentUser.value.id}/trade`,
            {
                symbol,
                quantity: qty,
                side,
                price,
            }
        );
        portfolio.value = data;
    } catch (e: any) {
        console.error(e);
        error.value = e?.response?.data?.message ?? "Ошибка операции";
    }
};

const onBuy = (symbol: string) => onTrade(symbol, "buy");
const onSell = (symbol: string) => onTrade(symbol, "sell");

// выбор вкладки
const openChart = (symbol: string) => {
    showChartSymbol.value = symbol;
};

// авто-выбор первой акции при загрузке/изменении списка
watch(
    activeStocks,
    (list) => {
        if (!list.length) {
            showChartSymbol.value = null;
            return;
        }
        if (!showChartSymbol.value || !list.some((s) => s.symbol === showChartSymbol.value)) {
            showChartSymbol.value = list[0].symbol;
        }
    },
    { immediate: true }
);
</script>
