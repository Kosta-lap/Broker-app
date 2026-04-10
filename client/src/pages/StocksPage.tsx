import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchStocks, fetchStockHistory, setStockActive, Stock } from "../store/stocksSlice";
import { StockHistoryChart } from "../components/StockHistoryChart";

export function StocksPage() {
  const dispatch = useAppDispatch();
  const stocks = useAppSelector((s) => s.stocks.items);
  const history = useAppSelector((s) => s.stocks.history);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchStocks());
  }, [dispatch]);

  useEffect(() => {
    if (selectedSymbol && !history[selectedSymbol]) {
      dispatch(fetchStockHistory(selectedSymbol));
    }
  }, [selectedSymbol, history, dispatch]);

  return (
    <div className="row">
      <div className="col-12 mb-3">
        <h3 className="mb-3">Перечень акций</h3>
        <div className="table-responsive">
          <table className="table table-striped table-bordered align-middle">
            <thead>
              <tr>
                <th>Тикер</th>
                <th>Компания</th>
                <th>Активна в торгах</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((s: Stock) => (
                <tr
                  key={s.symbol}
                  className={selectedSymbol === s.symbol ? "table-primary" : ""}
                  onClick={() => setSelectedSymbol(s.symbol)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{s.symbol}</td>
                  <td>{s.name}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={s.active}
                      onChange={(e) =>
                        dispatch(
                          setStockActive({
                            symbol: s.symbol,
                            active: e.target.checked,
                          })
                        )
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                </tr>
              ))}
              {!stocks.length && (
                <tr>
                  <td colSpan={3} className="text-center">
                    Нет данных по акциям
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="col-12">
        <h3 className="mb-3">История котировок {selectedSymbol ? `(${selectedSymbol})` : ""}</h3>
        {selectedSymbol && history[selectedSymbol] && (
          <>
            <StockHistoryChart symbol={selectedSymbol} data={history[selectedSymbol]} />
          </>
        )}
        {!selectedSymbol && <p>Выберите акцию из таблицы слева.</p>}
      </div>
    </div>
  );
}
