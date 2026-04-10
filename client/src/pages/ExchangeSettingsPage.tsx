import { FormEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchSettings, updateSettings, startExchange, resetTimeline } from "../store/exchangeSlice";
import { useExchangeSocket } from "../hooks/useExchangeSocket";
import { fetchStocks, fetchStockHistory } from "../store/stocksSlice";
import { ExchangeStateChart } from "../components/ExchangeStateChart";
import { api } from "../api/http";

// "11/3/2021" -> "2021-11-03"
function apiToInputDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "";
  const [m, d, y] = dateStr.split("/");
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

// "2021-11-03" -> "11/3/2021"
function inputToApiDate(value: string | undefined | null): string {
  if (!value) return "";
  const [y, m, d] = value.split("-");
  return `${m}/${d}/${y}`;
}

// "2021-11-03" -> "03.11.2021"
function inputToRuLabel(value: string): string {
  if (!value) return "";
  const [y, m, d] = value.split("-");
  return `${d.padStart(2, "0")}.${m.padStart(2, "0")}.${y}`;
}

export function ExchangeSettingsPage() {
  const dispatch = useAppDispatch();
  const { settings, currentDate, currentPrices } = useAppSelector((s) => s.exchange);
  const stocks = useAppSelector((s) => s.stocks.items);
  const history = useAppSelector((s) => s.stocks.history);

  // локальное значение для <input type="date"> (YYYY-MM-DD)
  const [startDateInput, setStartDateInput] = useState("");
  const [speedSeconds, setSpeedSeconds] = useState(settings.speedSeconds);

  // границы
  const [minDate, setMinDate] = useState<string | null>(null);
  const [maxDate, setMaxDate] = useState<string | null>(null);

  const [startDateError, setStartDateError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useExchangeSocket();

  // грузим настройки с сервера
  useEffect(() => {
    dispatch(fetchSettings()).then((res: any) => {
      if (res.payload) {
        const apiDate = res.payload.startDate as string | undefined;
        setStartDateInput(apiToInputDate(apiDate));
        setSpeedSeconds(res.payload.speedSeconds || 1);
      }
    });
  }, [dispatch]);

  // обеспечиваем наличие списка акций
  useEffect(() => {
    if (!stocks.length) {
      dispatch(fetchStocks());
    }
  }, [stocks.length, dispatch]);

  // подгружаем историю первой акции и считаем min/max дату
  useEffect(() => {
    const firstSymbol = stocks[0]?.symbol;
    if (!firstSymbol) return;

    const hist = history[firstSymbol];
    if (!hist) {
      dispatch(fetchStockHistory(firstSymbol));
      return;
    }

    if (hist.length) {
      const firstPoint = hist[hist.length - 1];
      const lastPoint = hist[0];

      const minInputDate = apiToInputDate(lastPoint.date);
      const maxInputDate = apiToInputDate(firstPoint.date);

      setMinDate(minInputDate);
      setMaxDate(maxInputDate);
    }
  }, [stocks, history, dispatch, startDateInput]);

  useEffect(() => {
    return () => {
      api.post("/exchange/stop", {}).catch(() => {});
      dispatch(resetTimeline());
    };
  }, [dispatch]);

  const validateStartDate = (): boolean => {
    if (!startDateInput) {
      setStartDateError("Укажите дату начала торгов.");
      return false;
    }
    if (minDate && startDateInput < minDate) {
      setStartDateError(`Дата не может быть меньше минимальной (${inputToRuLabel(minDate)}).`);
      return false;
    }
    if (maxDate && startDateInput > maxDate) {
      setStartDateError(`Дата не может быть больше максимальной (${inputToRuLabel(maxDate)}).`);
      return false;
    }
    setStartDateError(null);
    return true;
  };

  const handleStart = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateStartDate()) return;

    const apiDate = inputToApiDate(startDateInput);

    await dispatch(updateSettings({ startDate: apiDate, speedSeconds }));
    await dispatch(startExchange());

    setIsRunning(true);
  };

  const handleReset = async () => {
    await api.post("/exchange/stop", {});
    dispatch(resetTimeline());
    setIsRunning(false);
  };

  return (
    <div className="row">
      <div className="col-12 mb-5">
        <h3 className="mb-3">Настройки биржи</h3>
        <form className="row g-3" onSubmit={handleStart}>
          <div className="col-12">
            <label className="form-label">Дата начала торгов (ДД/ММ/ГГГГ)</label>
            <input
              type="date"
              className={`form-control ${startDateError ? "is-invalid" : ""}`}
              value={startDateInput}
              min={minDate ?? undefined}
              max={maxDate ?? undefined}
              onChange={(e) => {
                setStartDateInput(e.target.value);
                if (startDateError) setStartDateError(null);
              }}
            />
            {(minDate || maxDate) && (
              <div className="form-text-info">
                {minDate && <p>Минимальная дата: {inputToRuLabel(minDate)}</p>}
                {maxDate && <p>Максимальная дата: {inputToRuLabel(maxDate)}</p>}
              </div>
            )}
            {startDateError && <div className="invalid-feedback">{startDateError}</div>}
          </div>

          <div className="col-12">
            <label className="form-label">Скорость смены дат, сек</label>
            <input type="number" min={1} className="form-control" value={speedSeconds} onChange={(e) => setSpeedSeconds(Number(e.target.value))} />
          </div>

          <div className="col-12 d-flex gap-2">
            <button type="submit" className="btn btn-outline-info" disabled={isRunning}>
              Начало торгов
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={handleReset} disabled={!isRunning}>
              Сброс
            </button>
          </div>
        </form>
      </div>

      <div className="col-12">
        <h3 className="mb-3">Текущее состояние имитации</h3>
        <ExchangeStateChart />
      </div>
    </div>
  );
}
