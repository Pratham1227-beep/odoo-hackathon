import React, { useState } from 'react';
import { RotateCw, Plus, Users, Calendar, ArrowRight, Play, Pause } from 'lucide-react';
import { initialRotationalSchedules } from '../data/workingScheduleData';
import RotationalScheduleModal from './RotationalScheduleModal';

export default function RotationalSchedulesTab() {
  const [rotations, setRotations] = useState(initialRotationalSchedules);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreate = (newRot) => {
    setRotations([...rotations, newRot]);
  };

  const handleToggleStatus = (id) => {
    setRotations((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === 'Active' ? 'Paused' : 'Active' }
          : r
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Rotational Shift Schedules
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automate recurring shift transitions across weekly cycles.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Rotation</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rotations.map((rot) => (
          <div
            key={rot.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <RotateCw className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {rot.name}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {rot.department} • {rot.cycleWeeks} Weeks Cycle
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    rot.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                  }`}
                >
                  {rot.status}
                </span>
              </div>

              {/* Current vs Next Shift */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs mb-4">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Current Shift
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {rot.currentShift}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Next Shift
                  </div>
                  <div className="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {rot.nextShift}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {rot.employeesCount} Employees Enrolled
              </span>

              <button
                type="button"
                onClick={() => handleToggleStatus(rot.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition-colors cursor-pointer"
              >
                {rot.status === 'Active' ? (
                  <>
                    <Pause className="w-3 h-3 text-amber-500" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-emerald-500" />
                    <span>Resume</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <RotationalScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateRotation={handleCreate}
      />
    </div>
  );
}
