import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Calculator, Percent, DollarSign } from 'lucide-react';

export default function AddEditComponentModal({
  isOpen,
  onClose,
  onSubmit,
  type = 'allowance', // 'allowance' or 'deduction'
  initialData = null,
  basicSalary = 40000,
}) {
  const [name, setName] = useState('');
  const [computationType, setComputationType] = useState('fixed'); // 'fixed' | 'percentage' | 'formula'
  const [amount, setAmount] = useState('');
  const [percentageValue, setPercentageValue] = useState(10);
  const [formula, setFormula] = useState('');
  const [error, setError] = useState('');

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setComputationType(initialData.computationType || 'fixed');
      setAmount(initialData.amount !== undefined ? initialData.amount : '');
      setPercentageValue(initialData.percentageValue || 10);
      setFormula(initialData.formula || '');
    } else {
      setName('');
      setComputationType('fixed');
      setAmount('');
      setPercentageValue(10);
      setFormula('');
    }
    setError('');
  }, [initialData, isOpen]);

  // Recalculate amount if percentage changes
  useEffect(() => {
    if (computationType === 'percentage' && basicSalary) {
      const calculated = (Number(basicSalary) * Number(percentageValue)) / 100;
      setAmount(Math.round(calculated));
    }
  }, [computationType, percentageValue, basicSalary]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Component name is required.');
      return;
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      setError('Please enter a valid amount.');
      return;
    }

    onSubmit({
      id: initialData?.id || `${type === 'allowance' ? 'allw' : 'ded'}-${Date.now()}`,
      name: name.trim(),
      amount: numAmount,
      computationType,
      percentageValue: computationType === 'percentage' ? Number(percentageValue) : undefined,
      formula: computationType === 'formula' ? formula : undefined,
    });

    onClose();
  };

  const isAllowance = type === 'allowance';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div
          className={`px-6 py-4 flex items-center justify-between border-b ${
            isAllowance
              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/40 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-base">
            {isEditing ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>
              {isEditing ? 'Edit' : 'Add'} {isAllowance ? 'Allowance' : 'Deduction'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Component Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Component Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isAllowance ? 'e.g. Travel Allowance' : 'e.g. Health Insurance'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              autoFocus
            />
          </div>

          {/* Computation Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Computation Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setComputationType('fixed')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  computationType === 'fixed'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Fixed (₹)</span>
              </button>

              <button
                type="button"
                onClick={() => setComputationType('percentage')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  computationType === 'percentage'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>% of Basic</span>
              </button>

              <button
                type="button"
                onClick={() => setComputationType('formula')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  computationType === 'formula'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Formula</span>
              </button>
            </div>
          </div>

          {/* Conditional Input based on computationType */}
          {computationType === 'percentage' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Percentage of Basic Salary (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={percentageValue}
                  onChange={(e) => setPercentageValue(e.target.value)}
                  className="w-24 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm font-medium"
                />
                <span className="text-xs text-slate-500">
                  = ₹{((Number(basicSalary) * Number(percentageValue)) / 100).toLocaleString('en-IN')} / month
                </span>
              </div>
            </div>
          )}

          {computationType === 'formula' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Calculation Formula
              </label>
              <input
                type="text"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="e.g. BASIC * 0.15 + 1000"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm font-mono"
              />
            </div>
          )}

          {/* Amount (₹) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Monthly Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-semibold">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4.5 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-transform active:scale-95 ${
                isAllowance
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {isEditing ? 'Save Changes' : `Add ${isAllowance ? 'Allowance' : 'Deduction'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
