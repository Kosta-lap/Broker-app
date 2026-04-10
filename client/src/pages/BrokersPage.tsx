import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import {
  fetchBrokers,
  createBroker,
  deleteBroker,
  updateBroker,
} from "../store/brokersSlice";
import { BrokerForm } from "../components/BrokerForm";

export function BrokersPage() {
  const dispatch = useAppDispatch();
  const brokers = useAppSelector((s) => s.brokers.items);

  const [errors, setErrors] = useState<Record<number, string | undefined>>({});

  useEffect(() => {
    dispatch(fetchBrokers());
  }, [dispatch]);

  // отдельный обработчик blur для баланса
  const handleBalanceBlur =
    (id: number) => (e: React.FocusEvent<HTMLInputElement>) => {
      let raw = e.target.value;
      const value = Number(raw);

      if (raw === "" || Number.isNaN(value)) {
        setErrors((prev) => ({
          ...prev,
          [id]: "Введите число",
        }));
        return;
      }

      if (value < 0) {
        setErrors((prev) => ({
          ...prev,
          [id]: "Баланс не может быть отрицательным",
        }));
        e.target.value = "0";
        return;
      }

      if(raw[0] === '0' && raw.length != 1){
        console.log(raw)
        raw = raw.slice(1);
        e.target.value = raw;
      }

      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });

      dispatch(updateBroker({ id, balance: value }));
    };

  return (
    <div className="row">
      <div className="col-12 mx-auto">
        <h3 className="mb-3">Перечень брокеров</h3>

        <BrokerForm
          onSubmit={(data) => {
            dispatch(createBroker(data));
          }}
        />

        <div className="table-responsive">
          <table className="table table-striped table-bordered align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Баланс</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              {brokers.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.name}</td>
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      min={0}
                      defaultValue={b.balance}
                      onChange={handleBalanceBlur(b.id)}
                    />
                    {errors[b.id] && (
                      <p className="text-danger small mb-0 errorp">{errors[b.id]}</p>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger w-100"
                      onClick={() => dispatch(deleteBroker(b.id))}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
              {!brokers.length && (
                <tr>
                  <td colSpan={4} className="text-center">
                    Брокеров пока нет
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
