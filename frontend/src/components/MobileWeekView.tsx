import React from 'react';
import moment from 'moment';
import 'moment-timezone';
import type { ShiftEvent } from './WeekBoardView';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

interface Props {
  events: ShiftEvent[];
  dateOptions: string[];
  onEdit?: (evt: ShiftEvent) => void;
  onDelete?: (evt: ShiftEvent) => void;
}

const MobileWeekView: React.FC<Props> = ({ events, dateOptions, onEdit, onDelete }) => (
  <div className="mobile-week-list">
    {dateOptions.map((d) => {
      const dayMoment = moment(d, 'YYYY-MM-DD'); 
      const label = dayMoment.format('ddd, MMM D');
      const dayEvents = events.filter((evt) => moment(evt.start).isSame(dayMoment, 'day'));

      return (
        <div key={d} className="mobile-day-column">
          <div className="mobile-day-header">{label}</div>

          {dayEvents.length === 0 ? (
            <div className="mobile-no-shifts">No shifts</div>
          ) : (
            dayEvents.map((evt) => {
              const startStr = moment(evt.start).format('h:mm a');
              const endStr = moment(evt.end).format('h:mm a');
              return (
                <div key={evt.id} className="mobile-shift-item">
                  <div className="mobile-shift-info">
                    <span className="mobile-shift-time">
                      {startStr} – {endStr}
                    </span>
                    <span className="mobile-shift-title">{evt.title}</span>
                  </div>
                  <div className="mobile-shift-actions">
                    {onEdit && evt.isOwn && (
                      <FiEdit size={16} className="action-icon" onClick={() => onEdit(evt)} />
                    )}
                    {onDelete && evt.isOwn && (
                      <FiTrash2 size={16} className="action-icon" onClick={() => onDelete(evt)} />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      );
    })}
  </div>
);

export default MobileWeekView;
