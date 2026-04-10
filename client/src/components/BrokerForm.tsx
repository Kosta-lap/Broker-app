import { useState, FormEvent } from "react";

interface Props {
  onSubmit: (data: { name: string; balance: number }) => void;
}

export function BrokerForm({ onSubmit }: Props) {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState(10000);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ name, balance });
    setName("");
    setBalance(10000);
  };

  return (
    <form className="row g-2 mb-3" onSubmit={handleSubmit}>
      <div className="col-md-5">
        <input className="form-control" placeholder="Имя брокера" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="col-md-5">
        <input className="form-control" type="number" min={0} value={balance} onChange={(e) => setBalance(Number(e.target.value))} />
      </div>
      <div className="col-md-2">
        <button className="btn btn-outline-info w-100" type="submit">
          Добавить
        </button>
      </div>
    </form>
  );
}
