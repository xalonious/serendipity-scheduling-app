import React from "react";
import "../styles/training.css";
import type { TrainingDTO } from "../api/training";

export interface DayGroup {
  date: string;
  slots: TrainingDTO[];
}

interface WeeklyScheduleProps {
  groups: DayGroup[];
  onToggle: (id: number) => void;
  canManage: boolean;
  canClear: boolean;             
  currentUserName: string | null;
}

const TIME_SLOTS = [
  { slot: "T0000", label: "12:00 AM" },
  { slot: "T0300", label: "3:00 AM" },
  { slot: "T0600", label: "6:00 AM" },
  { slot: "T0800", label: "8:00 AM" },
  { slot: "T1000", label: "10:00 AM" },
  { slot: "T1200", label: "12:00 PM" },
  { slot: "T1500", label: "3:00 PM" },
  { slot: "T1700", label: "5:00 PM" },
  { slot: "T2000", label: "8:00 PM" },
  { slot: "T2200", label: "10:00 PM" },
];

const formatDateEST = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "numeric",
    day: "numeric",
  });

const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({
  groups,
  onToggle,
  canManage,
  canClear,
  currentUserName,
}) => {
  if (groups.length === 0) {
    return <div className="placeholder">No trainings scheduled this week.</div>;
  }

  return (
    <div className="schedule-container">
      <div className="schedule-grid">
        <div className="grid-cell corner">Time (EST)</div>

        {groups.map((g) => (
          <div key={g.date} className="grid-cell header">
            {formatDateEST(g.date)}
          </div>
        ))}

        {TIME_SLOTS.map(({ slot, label }) => (
          <React.Fragment key={slot}>
            <div className="grid-cell time-cell">{label}</div>

            {groups.map((g) => {
              const t = g.slots.find((s) => s.slot === slot);

              if (!t) {
                return <div key={g.date + slot} className="grid-cell slot-cell" />;
              }

              if (!canManage) {
                return (
                  <div
                    key={g.date + slot}
                    className={`grid-cell slot-cell ${t.userId ? "slot-claimed" : ""}`}
                  >
                    {t.userId ? (
                      <span className="slot-user">{t.userId}</span>
                    ) : (
                      <span className="slot-unclaimed text-gray-500">Not claimed</span>
                    )}
                  </div>
                );
              }

              const isMine = t.userId === currentUserName;
              let labelText = "Claim";
              let canClick = true;
              let btnClass = "slot-button claim";

              if (t.userId) {
                if (isMine) {
                  labelText = "Unclaim";
                  btnClass = "slot-button unclaim";
                  canClick = true;
                } else if (canClear) {
                  labelText = "Unclaim";
                  btnClass = "slot-button unclaim";
                  canClick = true;
                } else {
                  labelText = "Claimed";
                  btnClass = "slot-button claimed disabled";
                  canClick = false;
                }
              }

              return (
                <div
                  key={g.date + slot}
                  className={`grid-cell slot-cell ${t.userId ? "slot-claimed" : ""}`}
                >
                  {t.userId && <span className="slot-user">{t.userId}</span>}
                  <button
                    className={btnClass}
                    disabled={!canClick}
                    onClick={() => canClick && onToggle(t.id)}
                  >
                    {labelText}
                  </button>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default WeeklySchedule;
