import { useState, useEffect, useMemo } from 'react';
import useEnergy from '../hooks/useEnergy';
import '../styles/StatsBadges.css';
import { useNavigate } from 'react-router-dom';

function StatsBadges({ sessions = [] }) {
  const { logEnergy } = useEnergy();
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();
  // Läs direkt från localStorage för att säkerställa färsk data
  const getCurrentEnergy = () => {
    try {
      const stored = localStorage.getItem('currentEnergy');
      return stored ? JSON.parse(stored) : 3;
    } catch {
      return 3;
    }
  };

  // Session type colors for badges and charts
  const sessionTypeColors = {
    'deep-work': '#477ef5',
    'meeting': '#f39c12',
    'break': '#e67e22',
    'learning': '#27ae60',
    'default': '#bfc7e0'
  };

  // Hämtar nuvarande fokusläge från localStorage
  const getCurrentMode = () => {
    try {
      const stored = localStorage.getItem('currentMode');
      return stored ? JSON.parse(stored) : 'Idle';
    } catch {
      return 'Idle';
    }
  };

  const [currentEnergy, setCurrentEnergy] = useState(getCurrentEnergy());
  // ...existing code...

  // Beräknar total tid för idag med useMemo
  // ...existing code...

  // Total hours logged (only CircularTimer session types)
  const allowedTypes = ['deep-work', 'meeting', 'break', 'learning'];
  // Total time in hh:mm format
  const totalTimeHHMM = useMemo(() => {
    const totalSeconds = sessions
      .filter(s => allowedTypes.includes((s.type || '').toLowerCase().replace(/\s+/g, '-')))
      .reduce((acc, session) => acc + (session.duration || 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }, [sessions]);

  // Data för 5-dagars graf
  const get5DayStats = () => {
    const grouped = {};
    sessions.forEach(session => {
      const day = new Date(session.timestamp).toLocaleDateString('en-US');
      if (!grouped[day]) grouped[day] = {};
      if (!grouped[day][session.type]) grouped[day][session.type] = 0;
      grouped[day][session.type] += session.duration || 0;
    });
    const days = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a)).slice(0, 5).reverse();
    const sessionTypes = Array.from(new Set(sessions.map(s => s.type)));
    return { days, sessionTypes, grouped };
  };

  const [showTimeModal, setShowTimeModal] = useState(false);
  const [currentMode, setCurrentMode] = useState(getCurrentMode());

  // Uppdaterar badges varje sekund för att visa realtidsändringar
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEnergy(getCurrentEnergy());
      setCurrentMode(getCurrentMode());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Hämtar emoji för energinivå
  const getEnergyEmoji = (level) => {
    const emojis = ['😴', '😐', '🙂', '😊', '🤩'];
    return emojis[level - 1] || '🙂';
  };

  // Hämtar smart rekommendation baserat på energinivå
  const getRecommendation = (energy) => {
    if (energy === 1) {
      return 'You can do it. Keep going!';
    } else if (energy === 2) {
      return 'Don\'t stress. One thing at a time. You\'re doing great! ✨';
    } else if (energy === 3) {
      return 'Halfway there! Keep going, champ! 💪';
    } else if (energy === 4) {
      return 'Wow! You\'re doing great — So close, keep shining! 🌟';
    } else {
      return 'Great job! You did it! 🎉';
    }
  };

  // Hanterar val av energinivå
  const handleEnergySelect = (level) => {
    logEnergy(level);
    setCurrentEnergy(level);
    setShowEnergyModal(false);
    // Visar en notifikation vid lyckad uppdatering
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Lista över möjliga energinivåer
  const energyLevels = [
    { level: 1, emoji: '😴', label: 'Exhausted' },
    { level: 2, emoji: '😐', label: 'Low' },
    { level: 3, emoji: '🙂', label: 'OK' },
    { level: 4, emoji: '😊', label: 'Good' },
    { level: 5, emoji: '🤩', label: 'Excellent' }
  ];

  // Funktion för att hämta nästa rekommenderade aktivitet baserat på timer-status
  const getNextUpText = () => {
    const mode = getCurrentMode();
    if (mode === 'Deep Work' || mode === 'Meeting' || mode === 'Learning') {
      return 'Break for 10 min';
    } else if (mode === 'Break') {
      return 'Resume work session';
    } else {
      return 'Start your focus session';
    }
  };

  // Only pass allowed session types to TimeStats (normalize type names)
  function normalizeType(type) {
    if (!type) return '';
    return type.toLowerCase().replace(/\s+/g, '-');
  }
  const filteredSessions = sessions.filter(s => allowedTypes.includes(normalizeType(s.type)));

  return (
    <>
      <div className="stats-badges">
      <div className="stat-badge time-badge-clickable" onClick={() => {
        if (filteredSessions.length > 0) {
          navigate('/timestats', { state: { sessionData: filteredSessions } });
        } else {
          navigate('/timestats'); // fallback: let TimeStats load from localStorage
        }
      }} style={{cursor:'pointer'}} title="Click to see breakdown">
        <div className="badge-icon">⏱️</div>
        <div className="badge-content">
          <div className="badge-label">Total Time</div>
          <div className="badge-value">{totalTimeHHMM}</div>
        </div>
        <div className="badge-hint">Click for details</div>
      </div>
      <div className="stat-badge">
        <div className="badge-icon">🔔</div>
        <div className="badge-content">
          <div className="badge-label">Next Up</div>
          <div className="badge-value">{getNextUpText()}</div>
        </div>
      </div>
      <div className="stat-badge energy-badge-clickable" onClick={() => setShowEnergyModal(true)}>
        <div className="badge-icon">{getEnergyEmoji(currentEnergy)}</div>
        <div className="badge-content">
          <div className="badge-label">Energy Level</div>
          <div className="badge-value">Level {currentEnergy}</div>
        </div>
        <div className="badge-hint">Click to update</div>
      </div>
      <div className="stat-badge recommendation-badge">
        <div className="badge-icon">💡</div>
        <div className="badge-content">
          <div className="badge-label">Recommendation</div>
          <div className="badge-value">{getRecommendation(currentEnergy)}</div>
        </div>
      </div>
    </div>

    {/* Energival-modal */}
    {showEnergyModal && (
      <div className="energy-modal-overlay" onClick={() => setShowEnergyModal(false)}>
        <div className="energy-modal" onClick={(e) => e.stopPropagation()}>
          <h3>How are you feeling? 💭</h3>
          <p className="modal-subtitle">Select your current energy level</p>
          <div className="energy-modal-options">
            {energyLevels.map((item) => (
              <button
                key={item.level}
                className={`energy-modal-btn ${currentEnergy === item.level ? 'current' : ''}`}
                onClick={() => handleEnergySelect(item.level)}
              >
                <span className="modal-emoji">{item.emoji}</span>
                <span className="modal-label">{item.label}</span>
                <span className="modal-level">Level {item.level}</span>
              </button>
            ))}
          </div>
          <button className="modal-close" onClick={() => setShowEnergyModal(false)}>
            Cancel
          </button>
        </div>
      </div>
    )}

    {/* Lyckad notifikation */}
    {showNotification && (
      <div className="energy-notification">
        <span className="notification-icon">✨</span>
        <span className="notification-text">
          Energy level updated! {getRecommendation(currentEnergy)}
        </span>
      </div>
    )}

    {/* Modal för total time breakdown */}
    {showTimeModal && (
      <div className="energy-modal-overlay" onClick={() => setShowTimeModal(false)}>
        <div className="energy-modal" onClick={e => e.stopPropagation()} style={{maxWidth:'600px'}}>
          <h3>Total Hours Logged (Last 5 Days)</h3>
          <p className="modal-subtitle">Breakdown by session type</p>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%', borderCollapse:'collapse', marginBottom:'1rem'}}>
              <thead>
                <tr>
                  <th>Date</th>
                  {get5DayStats().sessionTypes.map(type => (
                    <th key={type}>{type}</th>
                  ))}
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {get5DayStats().days.map(day => (
                  <tr key={day}>
                    <td>{day}</td>
                    {get5DayStats().sessionTypes.map(type => (
                      <td key={type} style={{textAlign:'center'}}>
                        {get5DayStats().grouped[day][type] ? (get5DayStats().grouped[day][type]/3600).toFixed(2) : '-'}
                      </td>
                    ))}
                    <td style={{fontWeight:'bold', textAlign:'center'}}>
                      {(
                        Object.values(get5DayStats().grouped[day]).reduce((a, b) => a + b, 0)/3600
                      ).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Färgad graf */}
            <div style={{display:'flex',gap:'0.5rem',alignItems:'flex-end',height:'120px',marginBottom:'1rem'}}>
              {get5DayStats().days.map(day => {
                // ...existing code...
                const types = get5DayStats().sessionTypes;
                return (
                  <div key={day} style={{flex:'1',textAlign:'center',display:'flex',flexDirection:'column',justifyContent:'flex-end',height:'100%'}}>
                    <div style={{display:'flex',flexDirection:'column',justifyContent:'flex-end',height:'100%'}}>
                      {types.map(type => {
                        const val = get5DayStats().grouped[day][type] || 0;
                        if (!val) return null;
                        return (
                          <div key={type} style={{height:`${(val/3600)*20}px`,background:sessionTypeColors[type]||sessionTypeColors['default'],borderRadius:'4px',marginBottom:'2px',transition:'height 0.3s',width:'100%'}} title={`${type}: ${(val/3600).toFixed(2)} h`}></div>
                        );
                      })}
                    </div>
                    <div style={{fontSize:'0.8rem'}}>{day.slice(0,5)}</div>
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div style={{display:'flex',gap:'1rem',marginBottom:'0.5rem',flexWrap:'wrap'}}>
              {get5DayStats().sessionTypes.map(type => (
                <span key={type} style={{display:'flex',alignItems:'center',gap:'0.3rem',fontSize:'0.9rem'}}>
                  <span style={{display:'inline-block',width:'14px',height:'14px',background:sessionTypeColors[type]||sessionTypeColors['default'],borderRadius:'3px'}}></span>
                  {type}
                </span>
              ))}
            </div>
          </div>
          <button className="modal-close" onClick={() => setShowTimeModal(false)}>
            Close
          </button>
        </div>
      </div>
    )}
  </>
  );
}

export default StatsBadges;
