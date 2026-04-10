import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { BrokersPage } from "./pages/BrokersPage";
import { StocksPage } from "./pages/StocksPage";
import { ExchangeSettingsPage } from "./pages/ExchangeSettingsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/brokers" />} />
        <Route path="brokers" element={<BrokersPage />} />
        <Route path="stocks" element={<StocksPage />} />
        <Route path="settings" element={<ExchangeSettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
