import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/Context-Auth';
import PrivateRoute from './components/Component-PrivateRoute';

// Pages
import Home from './pages/Page-Home';
import Login from './pages/Page-Login';
import PedidosCliente from './pages/Page-PedidosCliente';
import Dashboard from './pages/Page-Dashboard';
import Clientes from './pages/Page-Clientes';
import Produtos from './pages/Page-Produtos';
import Pedidos from './pages/Page-Pedidos';
import Relatorios from './pages/Page-Relatorios';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pedidos-cliente" element={<PedidosCliente />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />
          <Route path="/produtos" element={<PrivateRoute><Produtos /></PrivateRoute>} />
          <Route path="/pedidos" element={<PrivateRoute><Pedidos /></PrivateRoute>} />
          <Route path="/relatorios" element={<PrivateRoute><Relatorios /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
