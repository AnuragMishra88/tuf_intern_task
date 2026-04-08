import React, { useState, useEffect } from 'react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addMonths, subMonths, isSameMonth, isSameDay, isWithinInterval,
  eachDayOfInterval, differenceInCalendarDays
} from 'date-fns';
import './Calendar.css';
import spring from '../assets/spring.png';

const monthImages = {
  0: 'https://images.unsplash.com/photo-1544396821-4dd40b938ad3?w=1200&h=300&fit=crop',
  1: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
  2: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=1200&h=300&fit=crop',
  3: 'https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=1200&q=80',
  4: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80',
  5: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  6: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  7: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
  8: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80',
  9: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
  10: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  11: 'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1200&q=80',
};

// -------- HOLIDAYS DATA (add or remove as needed) --------
const fixedHolidays = [
  { date: '01-01', name: "New Year's Day" },
  { date: '01-06', name: "Epiphany" },
  { date: '02-02', name: "Groundhog Day" },
  { date: '02-14', name: "Valentine's Day" },
  { date: '03-08', name: "International Women's Day" },
  { date: '03-17', name: "St. Patrick's Day" },
  { date: '04-01', name: "April Fools' Day" },
  { date: '04-22', name: "Earth Day" },
  { date: '05-01', name: "May Day" },
  { date: '05-05', name: "Cinco de Mayo" },
  { date: '06-14', name: "Flag Day (US)" },
  { date: '06-19', name: "Juneteenth" },
  { date: '07-04', name: "Independence Day (US)" },
  { date: '08-26', name: "Women's Equality Day" },
  { date: '09-07', name: "Labor Day (US)" },
  { date: '10-12', name: "Columbus Day" },
  { date: '10-31', name: "Halloween" },
  { date: '11-11', name: "Veterans Day" },
  { date: '11-28', name: "Thanksgiving" },
  { date: '12-24', name: "Christmas Eve" },
  { date: '12-25', name: "Christmas Day" },
  { date: '12-31', name: "New Year's Eve" },
];
// -------------------------------------------------------

// Helper: check if a date is a holiday and return its name
const getHolidayName = (day) => {
  const mmdd = format(day, 'MM-dd');
  const holiday = fixedHolidays.find(h => h.date === mmdd);
  return holiday ? holiday.name : null;
};

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [range, setRange] = useState({ start: null, end: null });
  const [note, setNote] = useState('');
  const [flip, setFlip] = useState(false);

  const monthKey = format(currentDate, 'yyyy-MM');
  useEffect(() => {
    const saved = localStorage.getItem(`note_${monthKey}`);
    setNote(saved || '');
  }, [monthKey]);

  const saveNote = (text) => {
    setNote(text);
    localStorage.setItem(`note_${monthKey}`, text);
  };

  const handleDateClick = (day) => {
    if (!range.start || (range.start && range.end)) {
      setRange({ start: day, end: null });
    } else {
      const start = day < range.start ? day : range.start;
      const end = day < range.start ? range.start : day;
      setRange({ start, end });
    }
  };

  const clearRange = () => setRange({ start: null, end: null });

  const changeMonth = (direction) => {
    if (flip) return;
    let newDate;
    if (direction === 'prev') newDate = subMonths(currentDate, 1);
    else if (direction === 'next') newDate = addMonths(currentDate, 1);
    else newDate = new Date();

    setFlip(true);
    setTimeout(() => {
      setCurrentDate(newDate);
      setFlip(false);
    }, 700);
  };

  const startMonth = startOfMonth(currentDate);
  const endMonth = endOfMonth(currentDate);
  const startCal = startOfWeek(startMonth, { weekStartsOn: 1 });
  const endCal = endOfWeek(endMonth, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: startCal, end: endCal });

  const isInRange = (day) => range.start && range.end && isWithinInterval(day, { start: range.start, end: range.end });
  const isStart = (day) => range.start && isSameDay(day, range.start);
  const isEnd = (day) => range.end && isSameDay(day, range.end);
  const isToday = (day) => isSameDay(day, new Date());

  // Get holidays that fall within the current month (for the list below notes)
  const getCurrentMonthHolidays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const holidaysInMonth = [];
    monthDays.forEach(day => {
      const mmdd = format(day, 'MM-dd');
      const holiday = fixedHolidays.find(h => h.date === mmdd);
      if (holiday) {
        holidaysInMonth.push({ date: format(day, 'MMM d'), name: holiday.name });
      }
    });
    return holidaysInMonth;
  };

  const monthHolidays = getCurrentMonthHolidays();

  const currentMonthIndex = currentDate.getMonth();
  const currentYear = format(currentDate, 'yyyy');
  const currentMonthName = format(currentDate, 'MMMM').toUpperCase();

  return (
    <div className="calendar-app">
      <img src={spring} alt="" height={55} width={900} />
      <div className={`page-wrapper ${flip ? 'diary-flip' : ''}`}>
        <div className="page-content">
          <div className="top-image">
            <img src={monthImages[currentMonthIndex]} alt={currentMonthName} />
            <div className="image-overlay">
              <p>{currentMonthName} - {currentYear}</p>
            </div>
          </div>

          <div className="two-columns">
            <div className="notes-section">
              <div className="notes-card">
                <h3 style={{ textAlign: 'center' }}>Monthly Notes</h3>
                <textarea
                  value={note}
                  onChange={(e) => saveNote(e.target.value)}
                  placeholder="Write your monthly notes here..."
                  rows="8"
                />
                <small style={{ textAlign: 'center' }}>Auto-saved for {monthKey}</small>
                {range.start && range.end && (
                  <div className="range-summary">
                    Selected: {format(range.start, 'MMM d')} – {format(range.end, 'MMM d')}
                    <br />
                    <span>{differenceInCalendarDays(range.end, range.start) + 1} days</span>
                  </div>
                )}

                {/* Holiday list - always visible */}
                <div className="holidays-list">
                  {monthHolidays.length > 0 ? (
                    <ul>
                      {monthHolidays.map((hol, idx) => (
                        <li key={idx}>
                          <strong>{hol.date}</strong> – {hol.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-holidays">No major holidays this month.</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="paper-container">
                <div className="calendar-grid">
                  {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
                    <div key={d} className="weekday">{d}</div>
                  ))}
                  {days.map((day, i) => {
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const holidayName = getHolidayName(day);
                    return (
                      <div
                        key={i}
                        className={`day ${!isCurrentMonth ? 'other-month' : ''} 
                          ${isInRange(day) ? 'in-range' : ''} 
                          ${isStart(day) ? 'range-start' : ''} 
                          ${isEnd(day) ? 'range-end' : ''}
                          ${isToday(day) ? 'today' : ''}
                          ${holidayName ? 'has-holiday' : ''}`}
                        onClick={() => handleDateClick(day)}
                        title={holidayName ? holidayName : ''}
                      >
                        {format(day, 'd')}
                        {holidayName && <span className="holiday-dot"></span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="nav-buttons-bottom">
                <button onClick={() => changeMonth('prev')}>◀ Prev</button>
                <button onClick={() => changeMonth('today')}>Today</button>
                <button onClick={() => changeMonth('next')}>Next ▶</button>
                <button onClick={clearRange}>Clear Range</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;

