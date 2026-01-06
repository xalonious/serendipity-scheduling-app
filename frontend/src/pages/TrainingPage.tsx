import React, { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import WeeklySchedule from "../components/WeeklySchedule";
import type { DayGroup } from "../components/WeeklySchedule";
import { useAuth } from "../context/Auth.context";
import { fetchTrainings, toggleTrainingClaim } from "../api/training";
import type { TrainingDTO } from "../api/training";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";

const TrainingPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [groups, setGroups] = useState<DayGroup[]>([]);

  const canManageTrainingSlots = !!user && user.rank >= 210;
  const canClear = !!user && user.rank >= 240; 

  const groupByDay = useCallback((data: TrainingDTO[]): DayGroup[] => {
    const map = new Map<string, TrainingDTO[]>();

    for (const slot of data) {
      const estKey = new Date(slot.date).toLocaleDateString("en-US", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      if (!map.has(estKey)) {
        map.set(estKey, []);
      }
      map.get(estKey)!.push(slot);
    }

    return Array.from(map.entries())
      .slice(0, 7)
      .map(([key, slots]) => {
        const [m, d, y] = key.split("/");
        const isoDate = `${y.padStart(4, "0")}-${m.padStart(2, "0")}-${d.padStart(
          2,
          "0"
        )}T05:00:00.000Z`;
        return { date: isoDate, slots };
      });
  }, []);

  const reload = useCallback(async () => {
    const all = await fetchTrainings();
    setGroups(groupByDay(all));
  }, [groupByDay]);

  useEffect(() => {
    (async () => {
      try {
        await reload();
      } catch (err) {
        console.error("Failed loading trainings", err);
        toast.error("Could not load trainings.");
      }
    })();
  }, [reload]);

  const handleToggle = async (id: number) => {
    if (!user) {
      toast.info("Please sign in to manage slots.");
      return;
    }
    if (!canManageTrainingSlots) {
      toast.info("You need rank 210+ to claim/unclaim training slots.");
      return;
    }

    try {
      await toggleTrainingClaim(id);
      toast.success("Slot updated!");
      await reload();
    } catch (err: unknown) {
      const e = err as AxiosError;
      if (e.response?.status === 409) {
        toast.error("That slot is already claimed by someone else.");
      } else if (e.response?.status === 400) {
        toast.error("You have reached the maximum of 5 claimed sessions.");
      } else {
        toast.error("Error updating slot.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--primary-bg)]">
        <span className="text-gray-600">Checking login…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--primary-bg)]">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">
          Weekly Training Schedule
        </h1>

        {!user && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-center">
            You’re viewing as a guest.
          </div>
        )}

        <WeeklySchedule
          groups={groups}
          onToggle={handleToggle}
          canManage={canManageTrainingSlots}
          canClear={canClear} 
          currentUserName={user?.username ?? null}
        />
      </div>
    </div>
  );
};

export default TrainingPage;
