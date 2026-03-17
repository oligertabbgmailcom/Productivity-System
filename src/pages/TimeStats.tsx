import React from 'react';
import Card from '../components/Card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import useLocalStorage from '../hooks/useLocalStorage';

// Typing for a session object
interface Session {
  timestamp: string;
  type: string;
  duration: number;
}

// Typing for grouped session data
interface GroupedSessions {
  [date: string]: {
    [type: string]: number;
  };
}

// Typing for session type
interface SessionType {
  key: string;
  label: string;
}

const SESSION_TYPE_LABELS: Record<string, string> = {
  'deep-work': 'Deep Work',
  'shallow-work': 'Shallow Work',
  'break': 'Break',
  'meeting': 'Meeting',
  'learning': 'Learning',
  'other': 'Other',
};

const preferredOrder = ['deep-work', 'meeting', 'break', 'learning'];

const TimeStats: React.FC = () => {
  // Get sessions from localStorage
  const [sessions] = useLocalStorage('sessions', []) as [Session[]];

  // Group sessions by day and type
  const grouped: GroupedSessions = {};
  (sessions as Session[]).forEach((session: Session) => {
    const day = new Date(session.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const typeKey = (session.type || '').toLowerCase().replace(/\s+/g, '-');
    if (!grouped[day]) grouped[day] = {};
    if (!grouped[day][typeKey]) grouped[day][typeKey] = 0;
    grouped[day][typeKey] += session.duration || 0;
  });

  // Always show a 30-day window
  // Use the actual current date
  const today = new Date();
  const last30DaysRaw = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  });
  const last30Days = last30DaysRaw.map(d => {
    const dateObj = new Date(d);
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  // Ensure the first row is today and the rest follow in descending order


  // Only show types that exist in the last 30 days
  const allTypes = Array.from(new Set(
    last30DaysRaw.flatMap(day => Object.keys(grouped[day] || {}))
  ));
  const sessionTypes: SessionType[] = preferredOrder
    .filter(type => allTypes.includes(type))
    .map(type => ({ key: type, label: SESSION_TYPE_LABELS[type] || type }));
  allTypes.forEach(type => {
    if (!preferredOrder.includes(type)) {
      sessionTypes.push({ key: type, label: SESSION_TYPE_LABELS[type] || (type.charAt(0).toUpperCase() + type.slice(1)) });
    }
  });

  // stats30 object for compatibility
  const stats30 = {
    days: last30DaysRaw,
    grouped,
  };

  // Custom tooltip for BarChart
  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const valueMap: Record<string, number> = {};
      payload.forEach((entry: any) => {
        valueMap[entry.dataKey] = entry.value;
      });
      return (
        <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 6, padding: '8px 12px', boxShadow: '0 2px 8px #0001' }}>
          <div style={{ fontWeight: 500, marginBottom: 2 }}>{label}</div>
          {preferredOrder.map(typeKey => {
            const type = sessionTypes.find(t => t.key === typeKey) || { key: typeKey, label: typeKey };
            const value = valueMap[typeKey] || 0;
            const totalMinutes = Math.round(value * 60);
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            const color =
              typeKey === 'deep-work' ? '#204ecf' :
              typeKey === 'break' ? '#c97a00' :
              typeKey === 'meeting' ? '#b05e00' :
              typeKey === 'learning' ? '#1eae60' :
              '#444';
            const labelText = type.label.charAt(0).toUpperCase() + type.label.slice(1);
            return (
              <div key={typeKey} style={{ color, fontWeight: 600, fontSize: '1em', opacity: value ? 1 : 0.6, fontFamily: 'inherit' }}>
                {labelText} : {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  if (!sessions || sessions.length === 0) {
    return (
      <Card title="Time Stats">
        <div style={{padding: '2rem', textAlign: 'center', color: '#888'}}>No session data available for the last 30 days.</div>
      </Card>
    );
  }

  return (
    <Card title="Time Stats">
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '2.5rem',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
        }}
        className="time-stats-responsive"
      >
        {/* 30-day stacked bar graph (left) */}
        <div
          style={{
            width: '50%',
            minWidth: 350,
            background: 'rgba(255,255,255,0.97)',
            borderRadius: '18px',
            boxShadow: '0 4px 24px 0 rgba(80,120,200,0.11)',
            padding: '18px 12px 12px 12px',
            border: '1.5px solid #e3e8f0',
            overflowX: 'auto',
            display: 'block',
            fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
            marginTop: '2.5rem',
          }}
          className="time-stats-chart-responsive"
        >
          <h4 style={{marginBottom:'0.5rem', fontWeight:700, color:'#2a3550'}}>Last 30 Days</h4>
          <div style={{fontWeight:'bold',marginBottom:'0.5rem', color:'#477ef5', fontSize:'1.15em'}}>{(() => {
            const totalSeconds = stats30.days.reduce((sum, day) => {
              const obj = stats30.grouped[day];
              if (obj !== undefined && obj !== null && typeof obj === 'object') {
                const vals = Object.values(obj);
                if (Array.isArray(vals)) {
                  return sum + vals.reduce((a, b) => a + b, 0);
                }
              }
              return sum;
            }, 0);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          })()}</div>

          {/* Custom Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '0.5rem', marginTop: '0.5rem', fontSize: '1.08em' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 16, height: 16, background: '#f5a623', borderRadius: 3, display: 'inline-block', marginRight: 2 }}></span>
              <span style={{ color: '#f5a623', fontWeight: 600 }}><span role="img" aria-label="Break">☕</span> Break</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 16, height: 16, background: '#477ef5', borderRadius: 3, display: 'inline-block', marginRight: 2 }}></span>
              <span style={{ color: '#477ef5', fontWeight: 600 }}><span role="img" aria-label="Deep Work">🎯</span> Deep Work</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 16, height: 16, background: '#f5a623', borderRadius: 3, display: 'inline-block', marginRight: 2 }}></span>
              <span style={{ color: '#f5a623', fontWeight: 600 }}><span role="img" aria-label="Meeting">👥</span> Meeting</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 16, height: 16, background: '#7adfa4', borderRadius: 3, display: 'inline-block', marginRight: 2 }}></span>
              <span style={{ color: '#2ecc40', fontWeight: 600 }}><span role="img" aria-label="Learning">📚</span> Learning</span>
            </span>
          </div>

          <ResponsiveContainer width="100%" height={260} minWidth={0} minHeight={220}>
            <BarChart
              data={last30DaysRaw.map((day, idx) => {
                const entry: any = { date: last30Days[idx] };
                sessionTypes.forEach(type => {
                  entry[type.key] = (grouped[day]?.[type.key] || 0) / 3600;
                });
                return entry;
              })}
              margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                stroke="#181c2a"
                tick={{
                  fontSize: 14,
                  fontWeight: 500,
                  angle: -35,
                  textAnchor: 'end',
                  fontFamily: 'inherit',
                  fill: '#181c2a',
                }}
                interval={0}
                axisLine={false}
                tickLine={false}
                ticks={last30Days}
              />
              <YAxis
                stroke="#181c2a"
                tick={{
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  fill: '#181c2a',
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v}h`}
                ticks={[1,2,3,4,5,6,7,8]}
                interval={0}
                domain={[0, 8]}
              />
              {preferredOrder.filter(typeKey => sessionTypes.some(t => t.key === typeKey)).map(typeKey => {
                const color =
                  typeKey === 'deep-work' ? '#477ef5' :
                  typeKey === 'break' ? '#f5a623' :
                  typeKey === 'meeting' ? '#f5a623' :
                  typeKey === 'learning' ? '#7adfa4' :
                  '#b0b8c9';
                return <Bar key={typeKey} dataKey={typeKey} stackId="a" fill={color} />;
              })}
              <Tooltip content={<CustomTooltip />} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* 30-day breakdown table below the chart, date in first column, 4 sessions in columns */}
      <div
        style={{
          width: '50%',
          minWidth: 350,
          background: 'rgba(255,255,255,0.97)',
          borderRadius: '18px',
          boxShadow: '0 4px 24px 0 rgba(80,120,200,0.11)',
          padding: '18px 12px 12px 12px',
          border: '1.5px solid #e3e8f0',
          overflowX: 'auto',
          display: 'block',
          fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
          marginTop: '2.5rem',
        }}
        className="time-stats-table-responsive"
      >
        <h4 style={{margin: '0 0 12px 0', fontWeight: 700, fontSize: '1.13em', color: '#2a3550', letterSpacing: '0.01em'}}>30-Day Session Breakdown</h4>
        <div style={{width:'100%', overflowX:'auto'}}>
          <table style={{
            borderCollapse: 'separate',
            borderSpacing: 0,
            width: '100%',
            minWidth: 500,
            fontSize: '0.98em',
            background: 'transparent',
            borderRadius: '14px',
            boxShadow: '0 1px 6px 0 rgba(80,120,200,0.06)',
            overflow: 'hidden',
            border: 'none',
          }}>
            <thead>
              <tr>
                <th style={{ position: 'sticky', left: 0, background: '#fafdff', zIndex: 2, minWidth: 80, textAlign: 'left', fontWeight: 700, color: '#2a3550', fontSize: '1em', borderTopLeftRadius: 14, borderBottom: '2px solid #e3e8f0', letterSpacing: '0.01em' }}>Date</th>
                {preferredOrder.map((typeKey, i) => {
                  let icon = null, color = '#2a3550', label = '';
                  if (typeKey === 'break') {
                    icon = <span role="img" aria-label="Break">☕</span>;
                    color = '#f5a623';
                    label = 'Break';
                  } else if (typeKey === 'deep-work') {
                    icon = <span role="img" aria-label="Deep Work">🎯</span>;
                    color = '#477ef5';
                    label = 'Deep Work';
                  } else if (typeKey === 'meeting') {
                    icon = <span role="img" aria-label="Meeting">👥</span>;
                    color = '#f5a623';
                    label = 'Meeting';
                  } else if (typeKey === 'learning') {
                    icon = <span role="img" aria-label="Learning">📚</span>;
                    color = '#2ecc40';
                    label = 'Learning';
                  } else {
                    label = (typeKey.charAt(0).toUpperCase() + typeKey.slice(1).replace('-', ' '));
                  }
                  return (
                    <th key={typeKey} style={{ textAlign: 'center', fontWeight: 600, color, fontSize: '1.08em', minWidth: 100, background:'#fafdff', borderBottom: '2px solid #e3e8f0', letterSpacing: '0.01em' }}>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        {icon} {label}
                      </span>
                    </th>
                  );
                })}
                <th style={{ textAlign: 'center', fontWeight: 700, color: '#204ecf', fontSize: '1.08em', minWidth: 110, background:'#fafdff', borderBottom: '2px solid #e3e8f0', letterSpacing: '0.01em' }}>Total Time</th>
              </tr>
            </thead>
            <tbody>
              {last30DaysRaw.map((day, rowIdx) => {
                // Calculate total time for the day
                const totalSeconds = preferredOrder.reduce((sum, typeKey) => {
                  const type = sessionTypes.find(t => t.key === typeKey) || { key: typeKey };
                  const value = (grouped[day] && grouped[day][type.key]) ? grouped[day][type.key] : 0;
                  return sum + value;
                }, 0);
                const totalHours = Math.floor(totalSeconds / 3600);
                const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
                return (
                  <tr key={day} style={{ background: rowIdx % 2 === 0 ? '#fafdff' : '#f3f7fb', transition: 'background 0.2s' }}>
                    <td style={{ position: 'sticky', left: 0, background: '#fafdff', zIndex: 1, fontWeight: 700, color: '#2a3550', minWidth: 80, borderRight: '1px solid #e3e8f0' }}>{last30Days[rowIdx]}</td>
                    {preferredOrder.map((typeKey, colIdx) => {
                      const type = sessionTypes.find(t => t.key === typeKey) || { key: typeKey };
                      const value = (grouped[day] && grouped[day][type.key]) ? grouped[day][type.key] : 0;
                      const hours = Math.floor(value / 3600);
                      const minutes = Math.floor((value % 3600) / 60);
                      return (
                        <td key={colIdx} style={{
                          textAlign: 'center',
                          color: value ? '#2a3550' : '#b0b8c9',
                          fontWeight: 600,
                          padding: '7px 2px',
                          border: 'none',
                          borderRadius: colIdx === 0 ? '0 0 0 14px' : colIdx === preferredOrder.length - 1 ? '0 0 14px 0' : 0,
                          background: 'transparent',
                          cursor: value ? 'pointer' : 'default',
                          transition: 'background 0.2s',
                        }}
                          onMouseOver={e => { if (value) (e.currentTarget as HTMLElement).style.background = '#eaf2ff'; }}
                          onMouseOut={e => { if (value) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                        >
                          {value ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}` : '-'}
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'center', color: '#204ecf', fontWeight: 700, fontSize: '1.08em', minWidth: 110, background: 'transparent', border: 'none' }}>
                      {totalSeconds > 0 ? `${totalHours.toString().padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

export default TimeStats;
