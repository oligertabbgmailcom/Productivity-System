import { useState, useEffect } from 'react';
import useEnergy from '../hooks/useEnergy';
import Card from '../components/Card';
import Button from '../components/Button';
import '../styles/Energy.css';

function Energy() {
  useEffect(() => {
    // Set body background color for Energy page
    document.body.style.background = '#f5fafd';
    return () => {
      // Reset to default when leaving Energy page
      document.body.style.background = '';
    };
  }, []);
  const { energyLogs, logEnergy, getAverageEnergy } = useEnergy();
  const [selectedLevel, setSelectedLevel] = useState(null);

  // Initiera med ett positivt standardvärde om inga loggar finns
  const getCurrentEnergy = () => {
    if (energyLogs.length === 0) return 3; // Standard till OK-nivå
    return energyLogs[energyLogs.length - 1].level;
  };

  const energyLevels = [
    { level: 1, emoji: '😴', label: 'Exhausted' },
    { level: 2, emoji: '😐', label: 'Low' },
    { level: 3, emoji: '🙂', label: 'OK' },
    { level: 4, emoji: '😊', label: 'Good' },
    { level: 5, emoji: '🤩', label: 'Excellent' }
  ];

  const handleLogEnergy = () => {
    if (selectedLevel) {
      logEnergy(selectedLevel);
      setSelectedLevel(null);
    }
  };

  const getEnergyColor = (level) => {
    if (level >= 4.5) return '#27ae60'; // Utmärkt - Grön
    if (level >= 3.5) return '#3498db'; // Bra - Blå
    if (level >= 2.5) return '#f39c12'; // OK - Orange
    if (level >= 1.5) return '#e67e22'; // Låg - Mörk orange
    return '#e74c3c'; // Utmattad - Röd
  };

  const avgEnergy7Days = getAverageEnergy(7);
  const avgEnergy30Days = getAverageEnergy(30);

  // Hämta personliga positiva rekommendationer baserat på energi
  const getPersonalizedTips = () => {
    const currentLevel = selectedLevel || getCurrentEnergy();

    const tips = {
      1: [
        { icon: '🛌', text: 'You deserve rest! Taking breaks makes you stronger.', type: 'rest' },
        { icon: '💧', text: 'Hydrate yourself - small steps lead to big changes!', type: 'health' },
        { icon: '🎵', text: 'Listen to your favorite music to boost your mood.', type: 'mood' },
        { icon: '🌳', text: 'A short walk can work wonders for your energy.', type: 'activity' }
      ],
      2: [
        { icon: '☕', text: 'Perfect time for easy wins! Start with simple tasks.', type: 'productivity' },
        { icon: '🧘', text: 'A 5-minute stretch will help you feel refreshed.', type: 'health' },
        { icon: '📱', text: 'Clear small items from your to-do list - you\'ve got this!', type: 'productivity' },
        { icon: '🌞', text: 'Get some natural light - it boosts energy naturally.', type: 'wellness' }
      ],
      3: [
        { icon: '📝', text: 'You\'re in the zone! Great time for focused work.', type: 'productivity' },
        { icon: '🎯', text: 'Steady progress wins the race - keep going!', type: 'motivation' },
        { icon: '🎨', text: 'Balance is key - mix challenging and lighter tasks.', type: 'strategy' },
        { icon: '💪', text: 'You\'re doing great! Consistency is your superpower.', type: 'motivation' }
      ],
      4: [
        { icon: '🚀', text: 'Amazing energy! Tackle your most important task now.', type: 'productivity' },
        { icon: '⭐', text: 'You\'re unstoppable today - ride this wave!', type: 'motivation' },
        { icon: '🎓', text: 'Perfect time for learning something new and challenging.', type: 'growth' },
        { icon: '🏆', text: 'High energy = high potential. Make it count!', type: 'motivation' }
      ],
      5: [
        { icon: '🌟', text: 'Incredible! You\'re at peak performance - amazing work!', type: 'motivation' },
        { icon: '💎', text: 'This is your time to shine! Deep work mode activated.', type: 'productivity' },
        { icon: '🎊', text: 'You\'re crushing it! Channel this energy into your goals.', type: 'motivation' },
        { icon: '🔥', text: 'Exceptional energy! Remember to stay hydrated though.', type: 'wellness' }
      ]
    };

    return tips[currentLevel] || tips[3];
  };

  // Gruppera energiloggar efter datum och beräkna dagliga medelvärden
  const getChartData = (days = 14) => {
    const now = new Date();
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateString = date.toLocaleDateString('en-US');
      
      const logsForDay = energyLogs.filter(log => log.date === dateString);
      const avgLevel = logsForDay.length > 0
        ? logsForDay.reduce((sum, log) => sum + log.level, 0) / logsForDay.length
        : 0;
      
      data.push({
        date: dateString,
        shortDate: `${date.getDate()}/${date.getMonth() + 1}`,
        level: avgLevel,
        count: logsForDay.length
      });
    }
    
    return data;
  };

  const chartData = getChartData(14);

  return (
    <div className="energy-page">
      <Card title="Energy Tracking" className="energy-card">
        <div className="energy-logger">
          <h3>How are you feeling?</h3>
          <div className="energy-levels" role="group" aria-label="Energy levels">
            {energyLevels.map((item) => (
              <button
                key={item.level}
                className={`energy-btn ${selectedLevel === item.level ? 'selected' : ''}`}
                onClick={() => setSelectedLevel(item.level)}
                aria-label={`Log energy level: ${item.label}`}
                aria-pressed={selectedLevel === item.level}
              >
                <span className="energy-emoji" aria-hidden="true">{item.emoji}</span>
                <span className="energy-label">{item.label}</span>
              </button>
            ))}
          </div>
          <Button 
            onClick={handleLogEnergy} 
            disabled={!selectedLevel}
            variant="primary"
          >
            Log Energy Level
          </Button>
        </div>

        <div className="energy-stats">
          <div className="stat-box">
            <h4>7-Day Average</h4>
            <div className="avg-energy">{avgEnergy7Days} / 5</div>
          </div>
          <div className="stat-box">
            <h4>30-Day Average</h4>
            <div className="avg-energy">{avgEnergy30Days} / 5</div>
          </div>
          <div className="stat-box">
            <h4>Total Logs</h4>
            <div className="avg-energy">{energyLogs.length}</div>
          </div>
        </div>

        <div className="energy-chart" aria-label="Energy trend for the last 14 days" tabIndex={0}>
          <h3>Energy Trend (Last 14 Days)</h3>
          {energyLogs.length === 0 ? (
            <p className="no-chart-data">No data to display. Start logging your energy!</p>
          ) : (
            <div className="chart-container">
              <div className="chart-y-axis" aria-hidden="true">
                <span>5</span>
                <span>4</span>
                <span>3</span>
                <span>2</span>
                <span>1</span>
              </div>
              <div className="chart-bars">
                {chartData.map((day, index) => (
                  <div key={index} className="chart-bar-wrapper">
                    <div className="chart-bar-container">
                      <div 
                        className={`chart-bar ${day.count > 0 ? 'has-data' : 'no-data'}`}
                        style={{ 
                          height: `${(day.level / 5) * 100}%`,
                          backgroundColor: day.count > 0 ? getEnergyColor(day.level) : '#ecf0f1'
                        }}
                        title={`${day.shortDate}: ${day.count > 0 ? day.level.toFixed(1) : 'No data'}`}
                        aria-label={`Energy on ${day.shortDate}: ${day.count > 0 ? day.level.toFixed(1) : 'No data'}`}
                        tabIndex={0}
                      >
                        {day.count > 0 && (
                          <span className="bar-value">{day.level.toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                    <span className="chart-label">{day.shortDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="energy-recommendations" aria-label="Personalized energy tips" tabIndex={0}>
          <h3>💡 Personalized Tips for You</h3>
          <div className="tips-grid">
            {getPersonalizedTips().map((tip, index) => (
              <div key={index} className="tip-card" tabIndex={0} aria-label={`Tip: ${tip.text} (${tip.type})`}>
                <span className="tip-icon" aria-hidden="true">{tip.icon}</span>
                <p className="tip-text">{tip.text}</p>
                <span className="tip-type">{tip.type}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="energy-history" aria-label="Recent energy logs" tabIndex={0}>
          <h3>Recent Logs</h3>
          {energyLogs.length === 0 ? (
            <p className="no-logs">No energy logs yet</p>
          ) : (
            <div className="logs-list">
              {energyLogs
                .slice(-10)
                .reverse()
                .map((log) => (
                  <div key={log.id} className="log-item" tabIndex={0} aria-label={`Energy log: Level ${log.level} on ${new Date(log.timestamp).toLocaleString('en-US')}`}> 
                    <span className="log-emoji" aria-hidden="true">
                      {energyLevels[log.level - 1].emoji}
                    </span>
                    <span className="log-level">
                      Level {log.level}
                    </span>
                    <span className="log-date">
                      {new Date(log.timestamp).toLocaleString('en-US')}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default Energy;
