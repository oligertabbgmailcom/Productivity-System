import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
// import TimerPage from './pages/TimerPage';
import History from './pages/History';
import Energy from './pages/Energy';
import Settings from './pages/Settings';
import TimeStats from './pages/TimeStats';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          {/* <Route path="timer" element={<TimerPage />} /> */}
          <Route path="history" element={<History />} />
          <Route path="energy" element={<Energy />} />
          <Route path="settings" element={<Settings />} />
          <Route path="timestats" element={<TimeStats />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
