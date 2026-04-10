import { Link, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="wrapper vh-100">
      <header className="py-3 bg-info-subtle">
        <div className="container">
          <nav className="navbar navbar-expand-lg navbar-dark">
            <div className="container-fluid p-0">
              <Link to="/" className="navbar-brand">
                Broker Exchange
              </Link>
              <button className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#nav">
                <span className="navbar-toggler-icon" />
              </button>
              <div id="nav" className="collapse navbar-collapse justify-content-end">
                <ul className="navbar-nav">
                  <li className="nav-item">
                    <Link to="/brokers" className="nav-link">
                      Брокеры
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/stocks" className="nav-link">
                      Акции
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/settings" className="nav-link">
                      Настройки биржи
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </div>
      </header>
      <main className="container pt-5">
        <Outlet />
      </main>
    </div>
  );
}
