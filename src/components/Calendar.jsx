import { useState } from 'react';
import Card from './Card';
import useLocalStorage from '../hooks/useLocalStorage';
import '../styles/Calendar.css';

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeBlocks, setTimeBlocks] = useLocalStorage('timeBlocks', []);
  const [newBlockStart, setNewBlockStart] = useState('');
  const [newBlockEnd, setNewBlockEnd] = useState('');
  const [newBlockTitle, setNewBlockTitle] = useState('');

  // Functions for the calendar

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const isSelectedDate = (day) => {
    return day === selectedDate.getDate() && 
           currentDate.getMonth() === selectedDate.getMonth() && 
           currentDate.getFullYear() === selectedDate.getFullYear();
  };

  const handleDayClick = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  const handleAddTimeBlock = (e) => {
    e.preventDefault();
    if (newBlockStart && newBlockEnd && newBlockTitle) {
      const newBlock = {
        id: Date.now(),
        date: selectedDate.toISOString().split('T')[0],
        start: newBlockStart,
        end: newBlockEnd,
        title: newBlockTitle
      };
      setTimeBlocks([...timeBlocks, newBlock]);
      setNewBlockStart('');
      setNewBlockEnd('');
      setNewBlockTitle('');
    }
  };

  const deleteTimeBlock = (id) => {
    setTimeBlocks(timeBlocks.filter(block => block.id !== id));
  };

  const getBlocksForSelectedDate = () => {
    const dateString = selectedDate.toISOString().split('T')[0];
    return timeBlocks.filter(block => block.date === dateString);
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Add empty days before the start of the month
    const startDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Add the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday(day) ? 'today' : ''} ${isSelectedDate(day) ? 'selected' : ''}`}
          onClick={() => handleDayClick(day)}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };

  const selectedBlocks = getBlocksForSelectedDate();

  return (
      <Card title="📅 Calendar & Time Blocks" className="calendar-card">
      <div className="calendar-header">
        <button onClick={() => changeMonth(-1)} className="month-nav">←</button>
        <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
        <button onClick={() => changeMonth(1)} className="month-nav">→</button>
      </div>

      <div className="calendar-weekdays">
        {dayNames.map((day, idx) => (
          <div key={day + idx} className="weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-days">
        {renderCalendarDays()}
      </div>

      <div className="time-blocks-section">
        <h4>Time blocks for {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}</h4>
        
        <form onSubmit={handleAddTimeBlock} className="add-block-form">
          <input
            type="time"
            value={newBlockStart}
            onChange={(e) => setNewBlockStart(e.target.value)}
            required
            placeholder="Start"
          />
          <input
            type="time"
            value={newBlockEnd}
            onChange={(e) => setNewBlockEnd(e.target.value)}
            required
            placeholder="End"
          />
          <input
            type="text"
            value={newBlockTitle}
            onChange={(e) => setNewBlockTitle(e.target.value)}
            required
            placeholder="Activity..."
          />
          <button type="submit" className="add-block-btn">+</button>
        </form>

        <div className="time-blocks-list">
          {selectedBlocks.length === 0 ? (
            <p className="no-blocks">No time blocks for this day</p>
          ) : (
            selectedBlocks.map(block => (
              <div key={block.id} className="time-block-item">
                <div className="block-time">{block.start} - {block.end}</div>
                <div className="block-title">{block.title}</div>
                <button 
                  onClick={() => deleteTimeBlock(block.id)}
                  className="delete-block-btn"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}

export default Calendar;
