import useLocalStorage from '../hooks/useLocalStorage';
import StatsBadges from '../components/StatsBadges';
import CircularTimer from '../components/CircularTimer';
import Calendar from '../components/Calendar';
import '../styles/Dashboard.css';

function Dashboard() {
  const [sessions, setSessions] = useLocalStorage('sessions', []);

  const handleSessionComplete = (session) => {
    setSessions([...sessions, { ...session, id: Date.now() }]);
  };

  return (
    <div className="dashboard">
      <StatsBadges sessions={sessions} />
      <div className="dashboard-grid">
        <div className="dashboard-left">
          <CircularTimer onSessionComplete={handleSessionComplete} />
        </div>
        <div className="dashboard-right">
          <Calendar />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
