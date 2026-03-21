import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import '../styles/Layout.css';


function Layout() {
  return (
    <div className="app-container">
      <div className="main-wrapper">
        <Header />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <Sidebar />
    </div>
  );
}

export default Layout;
