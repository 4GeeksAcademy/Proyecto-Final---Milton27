import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { PrivateRoute, AdminRoute } from "./components/PrivateRoute";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ExcursionDetail from "./pages/ExcursionDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/catalogo/:id" element={<ExcursionDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Signup />} />
          <Route path="/carrito" element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
          <Route path="/perfil" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        </Routes>
      </main>
      <footer className="app-footer">Velamar — proyecto final de e-commerce</footer>
    </div>
  );
}

export default App;
