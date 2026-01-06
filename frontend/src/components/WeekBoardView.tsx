import React from 'react';
import moment from 'moment';
import 'moment-timezone';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

export interface ShiftEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  userId?: string | null;
  isOwn?: boolean;
}

interface Props {
  events: ShiftEvent[];
  dateOptions: string[];
  onEdit?: (evt: ShiftEvent) => void;
  onDelete?: (evt: ShiftEvent) => void;
}

const WeekBoardView: React.FC<Props> = ({ events, dateOptions, onEdit, onDelete }) => {
  return (
    <div className="week-board">
      {dateOptions.map((d) => {
        const m = moment(d, 'YYYY-MM-DD');
        const isToday = m.isSame(moment(), 'day');

        const dayEvents = events
          .filter((evt) => moment(evt.start).isSame(m, 'day'))
          .sort((a, b) => +moment(a.start) - +moment(b.start));

        return (
          <div
            key={d}
            className={`week-board__col ${isToday ? 'week-board__col--today' : ''}`}
          >
            <div className="week-board__header">
              <div className="week-board__dow">{m.format('ddd')}</div>
              <div className="week-board__date">{m.format('MMM D')}</div>
            </div>

            {dayEvents.length === 0 ? (
              <div className="week-board__empty">No shifts</div>
            ) : (
              dayEvents.map((evt) => {
                const start = moment(evt.start).format('h:mm a');
                const end = moment(evt.end).format('h:mm a');
                return (
                  <div key={evt.id} className="week-board__card">
                    <div className="week-board__card-main">
                      <div className="week-board__time">
                        {start} – {end}
                      </div>
                      <div className="week-board__title">{evt.title}</div>
                    </div>
                    <div className="week-board__actions">
                      {onEdit && evt.isOwn && (
                        <FiEdit
                          size={16}
                          className="week-board__icon"
                          onClick={() => onEdit(evt)}
                        />
                      )}
                      {onDelete && evt.isOwn && (
                        <FiTrash2
                          size={16}
                          className="week-board__icon"
                          onClick={() => onDelete(evt)}
                        />
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
};

export default WeekBoardView;
