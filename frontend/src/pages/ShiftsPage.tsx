import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import 'moment-timezone';
import Header from '../components/Header';
import type { ShiftEvent } from '../components/WeekBoardView';
import MobileWeekView from '../components/MobileWeekView';
import WeekBoardView from '../components/WeekBoardView';
import { useAuth } from '../context/Auth.context';
import {
  fetchShifts,
  createShift,
  updateShift,
  deleteShift,
  getShiftReward,
  type RewardInfo,
} from '../api/shifts';
import { toast } from 'react-toastify';
import { useMediaQuery } from '../hooks/useMediaQuery';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/shift.css';

const USER_TZ = moment.tz.guess();
moment.updateLocale('en', { week: { dow: 1, doy: 4 } });

const apiErrorMessage = (e: unknown) => {
  if (axios.isAxiosError(e)) {
    const res = e.response;
    const data = res?.data as any;

    const pickFromDetailsObject = () => {
      const details = data?.details;
      if (details && typeof details === 'object') {
        for (const scope of ['body', 'query', 'params']) {
          const bucket = details[scope];
          if (bucket && typeof bucket === 'object') {
            const firstKey = Object.keys(bucket)[0];
            if (firstKey) {
              const v = bucket[firstKey];
              if (typeof v === 'string') return v;
              if (Array.isArray(v) && v.length) return String(v[0]);
            }
          }
        }
      }
      return null;
    };

    const msg =
      pickFromDetailsObject() ??
      (typeof data?.error === 'string' ? data.error : null) ??
      data?.message ??
      (Array.isArray(data?.details) ? data.details.join('\n') : null) ??
      e.message;

    if (!msg && res?.status === 409) return 'Shift overlaps with an existing shift';
    return msg ?? 'Something went wrong';
  }
  return (e as any)?.message ?? 'Something went wrong';
};

const ShiftsPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [shifts, setShifts] = useState<ShiftEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftEvent | null>(null);

  const [dateOptions, setDateOptions] = useState<string[]>([]);
  const [formDate, setFormDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const [rewardInfo, setRewardInfo] = useState<RewardInfo | null>(null);
  const [rewardLoading, setRewardLoading] = useState(false);

  const isMobile = useMediaQuery('(max-width: 640px)');

  const load = async (currentUsername?: string, canManageAllFlag?: boolean) => {
    try {
      const data = await fetchShifts();
      setShifts(
        data.map((s: any) => ({
          id: s.id,
          title: s.userId ? `🗓 ${s.userId}` : '🟢 Open',
          start: new Date(s.startTime),
          end: new Date(s.endTime),
          userId: s.userId ?? null,
          isOwn:
            !!currentUsername &&
            (s.userId === currentUsername || !!canManageAllFlag),
        }))
      );
    } catch (e: any) {
      toast.error(apiErrorMessage(e));
    }
  };

  useEffect(() => {
    const canManageAll = (user?.rank ?? 0) >= 240;
    load(user?.username, canManageAll);

    const mondayLocal = moment().startOf('isoWeek');
    const opts = Array.from({ length: 7 }, (_, i) =>
      mondayLocal.clone().add(i, 'day').format('YYYY-MM-DD')
    );
    setDateOptions(opts);
    setFormDate(opts[0]);
  }, [user?.username, user?.rank]);

  useEffect(() => {
    if (!isModalOpen) return;
    if (!formDate || !startTime || !endTime) {
      setRewardInfo(null);
      return;
    }

    const startLocal = moment.tz(`${formDate} ${startTime}`, 'YYYY-MM-DD HH:mm', USER_TZ);
    const endLocal = moment.tz(`${formDate} ${endTime}`, 'YYYY-MM-DD HH:mm', USER_TZ);
    if (!endLocal.isAfter(startLocal)) {
      setRewardInfo(null);
      return;
    }

    let cancelled = false;
    setRewardLoading(true);

    const isoStart = startLocal.toDate().toISOString();
    const isoEnd = endLocal.toDate().toISOString();

    const excludeId = editingShift?.id ?? undefined;

    getShiftReward(isoStart, isoEnd, excludeId)
      .then((info) => {
        if (!cancelled) setRewardInfo(info);
      })
      .catch(() => {
        if (!cancelled) setRewardInfo(null);
      })
      .finally(() => {
        if (!cancelled) setRewardLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isModalOpen, formDate, startTime, endTime, editingShift?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--primary-bg)]">
        <span className="text-gray-600">Checking login…</span>
      </div>
    );
  }

  const openCreate = () => {
    setEditingShift(null);
    setFormDate(dateOptions[0]);
    setStartTime('09:00');
    setEndTime('17:00');
    setRewardInfo(null);
    setIsModalOpen(true);
  };

  const handleEdit = (evt: ShiftEvent) => {
    if (!evt.isOwn) return;
    const startLocal = moment(evt.start).local();
    const endLocal = moment(evt.end).local();
    setEditingShift(evt);
    setFormDate(startLocal.format('YYYY-MM-DD'));
    setStartTime(startLocal.format('HH:mm'));
    setEndTime(endLocal.format('HH:mm'));
    setRewardInfo(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (evt: ShiftEvent) => {
    if (!evt.isOwn) return;
    const whenLocal = moment(evt.start).local().format('MMM D [at] h:mm a');
    if (window.confirm(`Delete shift on ${whenLocal} (${USER_TZ})?`)) {
      try {
        await deleteShift(evt.id);
        toast.success('Deleted shift!');
        const canManageAll = (user?.rank ?? 0) >= 240;
        load(user?.username, canManageAll);
      } catch (e: any) {
        toast.error(apiErrorMessage(e));
      }
    }
  };

  const handleSubmit = async () => {
    const startLocal = moment.tz(`${formDate} ${startTime}`, 'YYYY-MM-DD HH:mm', USER_TZ);
    const endLocal = moment.tz(`${formDate} ${endTime}`, 'YYYY-MM-DD HH:mm', USER_TZ);
    const isoStart = startLocal.toDate().toISOString();
    const isoEnd = endLocal.toDate().toISOString();

    try {
      if (editingShift) {
        if (!editingShift.isOwn) return;
        await updateShift(editingShift.id, isoStart, isoEnd);
        toast.success('Shift updated!');
      } else {
        await createShift(isoStart, isoEnd);
        toast.success('Shift created!');
      }
      setIsModalOpen(false);
      setRewardInfo(null);
      const canManageAll = (user?.rank ?? 0) >= 240;
      load(user?.username, canManageAll);
    } catch (e: any) {
      toast.error(apiErrorMessage(e));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--primary-bg)]">
      <Header />

      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <div className="flex items-baseline justify-between mb-4">
          <h1 className="text-3xl font-semibold text-gray-800">Shift Schedule</h1>
          <span className="text-sm text-gray-500">
            Times shown in your timezone: <b>{USER_TZ}</b>
          </span>
        </div>

        {user && (
          <div className="mb-4">
            <button
              onClick={openCreate}
              className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded shadow"
            >
              + Create Shift
            </button>
          </div>
        )}

        <div className="flex-1">
          {isMobile ? (
            <MobileWeekView
              events={shifts}
              dateOptions={dateOptions}
              onEdit={user ? handleEdit : undefined}
              onDelete={user ? handleDelete : undefined}
            />
          ) : (
            <WeekBoardView
              events={shifts}
              dateOptions={dateOptions}
              onEdit={user ? handleEdit : undefined}
              onDelete={user ? handleDelete : undefined}
            />
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="overlay overlay--after-open">
          <div className="modal modal--after-open">
            <h2 className="text-2xl font-semibold mb-4">
              {editingShift ? 'Edit Shift' : 'Create Shift'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Date</label>
                <select
                  className="w-full border rounded px-3 py-2 pr-10 appearance-none"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                >
                  {dateOptions.map((d) => (
                    <option key={d} value={d}>
                      {moment(d, 'YYYY-MM-DD').format('dddd, MMMM Do')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  Start Time ({USER_TZ})
                </label>
                <input
                  type="time"
                  className="w-full border rounded px-3 py-2"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  End Time ({USER_TZ})
                </label>
                <input
                  type="time"
                  className="w-full border rounded px-3 py-2"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>

              <div className="mt-2 text-sm">
                {(!formDate || !startTime || !endTime) && (
                  <span className="text-gray-500">Select a date and times to see the reward.</span>
                )}
                {formDate && startTime && endTime && rewardLoading && (
                  <span className="text-gray-600">Calculating reward…</span>
                )}
                {formDate && startTime && endTime && !rewardLoading && rewardInfo !== null && (
                  <div className={`reward-chip ${rewardInfo.reward === 0 ? 'reward-chip--limit' : ''}`}>
                    Estimated reward: <b>{rewardInfo.reward} R$</b>
                    {rewardInfo.reward === 0 && rewardInfo.cooldown && (
                      <span className="ml-2 text-xs text-orange-600">
                        (Ineligible: another shift ended &lt; 60 min earlier)
                      </span>
                    )}
                    {rewardInfo.reward === 0 && !rewardInfo.cooldown && rewardInfo.poolEmpty && (
                      <span className="ml-2 text-xs text-red-600">
                        (Weekly limit reached)
                      </span>
                    )}
                    {rewardInfo.reward === 0 && !rewardInfo.cooldown && !rewardInfo.poolEmpty && (
                      <span className="ml-2 text-xs text-gray-600">
                        (No payout)
                      </span>
                    )}
                  </div>
                )}
                {formDate && startTime && endTime && !rewardLoading && rewardInfo === null && (
                  <span className="text-red-600">Enter a valid time range to get a reward.</span>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
              {editingShift?.isOwn && (
                <button
                  onClick={() => {
                    if (editingShift) {
                      handleDelete(editingShift);
                    }
                    setIsModalOpen(false);
                  }}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded"
                >
                  Delete
                </button>
              )}
              <div className="flex-1 flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setRewardInfo(null);
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  {editingShift ? 'Save' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftsPage;
