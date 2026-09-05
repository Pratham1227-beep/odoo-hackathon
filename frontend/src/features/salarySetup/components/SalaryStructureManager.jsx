import React, { useState } from 'react';
import {
  Layers,
  ArrowUp,
  ArrowDown,
  Plus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Code2,
  Percent,
  DollarSign,
  ChevronRight,
  Settings2,
} from 'lucide-react';
import { formatCurrency } from '../data/salarySetupData';

export default function SalaryStructureManager({
  structures,
  rules,
  onUpdateRuleSequence,
  onAddRule,
  onToggleRuleStatus,
}) {
  const [selectedStructureId, setSelectedStructureId] = useState(structures[0]?.id || 'STR-001');

  const currentStructure = structures.find((s) => s.id === selectedStructureId) || structures[0];

  // Filter rules that belong to current structure or show all sequenced rules
  const sortedRules = [...rules].sort((a, b) => a.sequence - b.sequence);

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newRules = [...sortedRules];
    const temp = newRules[index].sequence;
    newRules[index].sequence = newRules[index - 1].sequence;
    newRules[index - 1].sequence = temp;
    onUpdateRuleSequence(newRules);
  };

  const handleMoveDown = (index) => {
    if (index === sortedRules.length - 1) return;
    const newRules = [...sortedRules];
    const temp = newRules[index].sequence;
    newRules[index].sequence = newRules[index + 1].sequence;
    newRules[index + 1].sequence = temp;
    onUpdateRuleSequence(newRules);
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'Basic':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Allowance':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Gross':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Deduction':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'Net Salary':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Cards: Salary Structures List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Configured Salary Structures</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Salary structures act as containers for ordered salary rules applied to payslips.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {structures.map((str) => {
            const isSelected = str.id === selectedStructureId;
            return (
              <div
                key={str.id}
                onClick={() => setSelectedStructureId(str.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500/60 shadow-sm ring-2 ring-indigo-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                    {str.id}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      str.active
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {str.active ? 'Active' : 'Draft'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 line-clamp-1">
                  {str.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {str.description}
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span>{str.rulesCount} Rules</span>
                  <span>{str.employeesCount} Employees</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ordered Salary Rules Engine */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Ordered Salary Rules — {currentStructure.name}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rules execute sequentially from top to bottom. Later rules depend on values calculated by earlier rules.
            </p>
          </div>
          <button
            type="button"
            onClick={onAddRule}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Salary Rule</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold text-xs bg-slate-50/30 dark:bg-slate-800/20">
                <th className="px-3.5 py-3 text-center w-14">Seq</th>
                <th className="px-4 py-3">Rule Name & Code</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Computation Type</th>
                <th className="px-4 py-3">Default Value / Formula</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-3 py-3 text-center w-20">Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {sortedRules.map((rule, idx) => (
                <tr
                  key={rule.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Sequence Number */}
                  <td className="px-3.5 py-3.5 text-center font-bold text-slate-400 text-xs">
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 inline-flex items-center justify-center text-slate-600 dark:text-slate-300">
                      {idx + 1}
                    </span>
                  </td>

                  {/* Rule Name & Code */}
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {rule.name}
                    </div>
                    <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                      {rule.code}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getCategoryBadge(
                        rule.category
                      )}`}
                    >
                      {rule.category}
                    </span>
                  </td>

                  {/* Computation Type */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {rule.computationType === 'percentage' && (
                        <>
                          <Percent className="w-3.5 h-3.5 text-indigo-500" />
                          <span>% of {rule.percentageOf || 'Basic'} ({rule.percentageValue}%)</span>
                        </>
                      )}
                      {rule.computationType === 'fixed' && (
                        <>
                          <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Fixed Amount</span>
                        </>
                      )}
                      {rule.computationType === 'formula' && (
                        <>
                          <Code2 className="w-3.5 h-3.5 text-purple-500" />
                          <span className="font-mono text-[11px]">Formula Engine</span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Value / Formula */}
                  <td className="px-4 py-3.5">
                    {rule.formula ? (
                      <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                        {rule.formula}
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-800 dark:text-slate-100 tabular-nums">
                        {formatCurrency(rule.value)}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleRuleStatus(rule.id)}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                        rule.active
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {rule.active ? 'Active' : 'Disabled'}
                    </button>
                  </td>

                  {/* Reorder Arrows */}
                  <td className="px-3 py-3.5 text-center">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveUp(idx)}
                        className="p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move Rule Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === sortedRules.length - 1}
                        onClick={() => handleMoveDown(idx)}
                        className="p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move Rule Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
