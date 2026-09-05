import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, Clock, Trash2 } from 'lucide-react';

export default function InternGoals({ goals = [], onAddGoal, onUpdateGoal, onDeleteGoal }) {
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await onAddGoal({ title: newTitle.trim(), status: 'TODO' });
    setNewTitle('');
    setIsAdding(false);
  };

  const toggleStatus = async (goal) => {
    const nextStatus =
      goal.status === 'COMPLETED' ? 'TODO' : goal.status === 'TODO' ? 'IN_PROGRESS' : 'COMPLETED';
    await onUpdateGoal(goal.id, { status: nextStatus });
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Internship Goals</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track and manage assigned learning goals</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 text-xs font-semibold rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Goal</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Build REST API for authentication"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none"
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 cursor-pointer"
          >
            Save
          </button>
        </form>
      )}

      {goals.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No goals set yet</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Add the first learning goal for this intern.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {goals.map((goal) => {
            const isDone = goal.status === 'COMPLETED';
            const inProg = goal.status === 'IN_PROGRESS';

            return (
              <div
                key={goal.id}
                className="flex items-center justify-between p-3.5 bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => toggleStatus(goal)}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : inProg ? (
                    <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" />
                  )}

                  <span
                    className={`text-sm font-medium ${
                      isDone
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {goal.title}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-2xs font-semibold ${
                      isDone
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                        : inProg
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                        : 'bg-slate-200/60 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {goal.status}
                  </span>
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
