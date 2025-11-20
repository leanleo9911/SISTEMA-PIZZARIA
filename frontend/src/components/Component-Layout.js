import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/Context-Auth';
import { FaPizzaSlice, FaUsers, FaBoxOpen, FaShoppingCart, FaChartLine, FaSignOutAlt, FaBars } from 'react-icons/fa';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: <FaChartLine />, label: 'Dashboard' },
    { path: '/clientes', icon: <FaUsers />, label: 'Clientes' },
    { path: '/produtos', icon: <FaBoxOpen />, label: 'Produtos' },
    { path: '/pedidos', icon: <FaShoppingCart />, label: 'Pedidos' },
    { path: '/relatorios', icon: <FaChartLine />, label: 'Relatórios' }
  ];

  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <FaPizzaSlice className="sidebar-logo" />
          {sidebarOpen && <h2>Bella Napoli</h2>}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-logout">
            <FaSignOutAlt />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <button className="toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FaBars />
          </button>
          <div className="user-info">
            <span>Olá, <strong>{user?.nome}</strong></span>
            <span className="user-role">{user?.role === 'admin' ? 'Administrador' : 'Funcionário'}</span>
          </div>
        </header>

        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
