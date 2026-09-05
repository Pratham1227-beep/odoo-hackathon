import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  FileText,
  GraduationCap,
  Sparkles,
  Star,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import InternGoals from '../components/InternGoals';
import InternReviews from '../components/InternReviews';
import CreateReviewModal from '../components/CreateReviewModal';
import ConvertInternModal from '../components/ConvertInternModal';
import CompleteInternModal from '../components/CompleteInternModal';
import EditInternModal from '../components/EditInternModal';
import { internService } from '../services/internService';
import { employeeService } from '../../employees/services/employeeService';

export default function InternProfilePage() {
  const { id: internId } = useParams();
  const navigate = useNavigate();

  const [intern, setIntern] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  const fetchInternDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const [detailRes, empRes] = await Promise.all([
        internService.getInternById(internId),
        employeeService.listEmployees({ page: 1, page_size: 100 }),
      ]);
      setIntern(detailRes);
      setEmployees(empRes.items || []);
    } catch (err) {
      console.error('Failed to fetch intern profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [internId]);

  useEffect(() => {
    fetchInternDetail();
  }, [fetchInternDetail]);

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
        <p className="mt-3 text-sm text-slate-500">Loading intern profile...</p>
      </div>
    );
  }

  if (!intern) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Intern record not found</h3>
        <button
          onClick={() => navigate('/interns')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl"
        >
          Back to Interns List
        </button>
      </div>
    );
  }

  const emp = intern.employee || {};
  const mentor = intern.mentor || {};
  const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Intern';
  const isConverted = intern.conversion_status === 'CONVERTED';
  const isCompleted = intern.status === 'COMPLETED';

  // Action handlers
  const handleUpdateIntern = async (id, data) => {
    await internService.updateIntern(id, data);
    fetchInternDetail();
  };

  const handleAddGoal = async (goalData) => {
    await internService.createGoal(internId, goalData);
    fetchInternDetail();
  };

  const handleUpdateGoal = async (goalId, goalData) => {
    await internService.updateGoal(internId, goalId, goalData);
    fetchInternDetail();
  };

  const handleDeleteGoal = async (goalId) => {
    await internService.deleteGoal(internId, goalId);
    fetchInternDetail();
  };

  const handleCreateReview = async (reviewData) => {
    await internService.createReview(internId, reviewData);
    fetchInternDetail();
  };

  const handleCompleteInternship = async () => {
    await internService.completeInternship(internId);
    fetchInternDetail();
  };

  const handleConvertIntern = async () => {
    const res = await internService.convertIntern(internId);
    await fetchInternDetail();
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/interns')}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Interns</span>
      </button>

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white text-2xl font-bold flex items-center justify-center shadow-lg shadow-indigo-500/20">
            {fullName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{fullName}</h1>
              {isConverted ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200">
                  ✓ Converted to Employee
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200">
                  ● {intern.status}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">
              {intern.internship_domain} Intern • {intern.college_name || 'University'}
            </p>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          {!isCompleted && !isConverted && (
            <button
              onClick={() => setIsCompleteModalOpen(true)}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Complete Internship
            </button>
          )}

          {isCompleted && (
            <a
              href={internService.generateCertificateUrl(internId)}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 text-xs font-semibold rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate Certificate</span>
            </a>
          )}
        </div>
      </div>

      {/* Progress & Quick Stats Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Internship Progress</h3>
            <span className="text-xs font-semibold text-slate-500">
              Day {intern.days_completed} of {intern.duration_days}
            </span>
          </div>

          <div className="space-y-2">
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${intern.progress_percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>{intern.progress_percentage}% Completed</span>
              <span>{intern.days_remaining} Days Remaining</span>
            </div>
          </div>

          {intern.current_goal && (
            <div className="p-3 bg-indigo-50/50 dark:bg-slate-800/50 rounded-xl border border-indigo-100/50 text-xs text-indigo-900 dark:text-indigo-200">
              <strong>Current Goal:</strong> {intern.current_goal}
            </div>
          )}
        </div>

        {/* Overview Stats Column */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs">
            <p className="text-2xs font-semibold text-slate-400 uppercase">Mentor</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {mentor.first_name ? `${mentor.first_name} ${mentor.last_name}` : 'Unassigned'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs">
            <p className="text-2xs font-semibold text-slate-400 uppercase">Monthly Stipend</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              ₹{intern.stipend ? intern.stipend.toLocaleString() : 0}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs">
            <p className="text-2xs font-semibold text-slate-400 uppercase">Attendance</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {intern.attendance_summary?.attendance_percentage || 100}%
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs">
            <p className="text-2xs font-semibold text-slate-400 uppercase">Overall Rating</p>
            <p className="text-sm font-bold text-amber-500 mt-1">
              {intern.final_rating ? `${intern.final_rating} / 5` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        {['Overview', 'Goals', 'Reviews'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-bold transition-all relative cursor-pointer ${
              activeTab === tab
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Info Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Internship Information</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400">College Name</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{intern.college_name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-400">Course / Major</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{intern.course || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-400">Domain</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{intern.internship_domain}</p>
              </div>
              <div>
                <span className="text-slate-400">Type</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{intern.internship_type}</p>
              </div>
              <div>
                <span className="text-slate-400">Start Date</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{intern.start_date}</p>
              </div>
              <div>
                <span className="text-slate-400">End Date</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{intern.end_date}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-2xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Assigned Mentor</span>
              {mentor.first_name ? (
                <div className="mt-2 flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs">
                    {`${mentor.first_name[0]}${mentor.last_name ? mentor.last_name[0] : ''}`}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {mentor.first_name} {mentor.last_name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {mentor.designation_name || 'Senior Staff'} • {mentor.department_name || 'Engineering'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-1 italic">No mentor assigned yet.</p>
              )}
            </div>
          </div>


          {/* Timeline Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Internship Timeline</h3>
            <div className="space-y-3 text-xs pl-2 border-l-2 border-indigo-100 dark:border-slate-800">
              <div className="relative pl-4">
                <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full absolute -left-[21px] top-1" />
                <p className="font-bold text-slate-900 dark:text-white">Joined as Intern</p>
                <p className="text-slate-400">{intern.start_date}</p>
              </div>
              <div className="relative pl-4">
                <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full absolute -left-[21px] top-1" />
                <p className="font-bold text-slate-900 dark:text-white">Mentor Assigned</p>
                <p className="text-slate-400">
                  {mentor.first_name ? `${mentor.first_name} ${mentor.last_name}` : 'Pending assignment'}
                </p>
              </div>
              <div className="relative pl-4">
                <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full absolute -left-[21px] top-1" />
                <p className="font-bold text-slate-900 dark:text-white">Completion Target</p>
                <p className="text-slate-400">{intern.end_date}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Goals' && (
        <InternGoals
          goals={intern.goals}
          onAddGoal={handleAddGoal}
          onUpdateGoal={handleUpdateGoal}
          onDeleteGoal={handleDeleteGoal}
        />
      )}

      {activeTab === 'Reviews' && (
        <InternReviews
          reviews={intern.reviews}
          onCreateReview={() => setIsReviewModalOpen(true)}
          conversionStatus={intern.conversion_status}
        />
      )}

      {/* FINAL LIFECYCLE ACTION AREA */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Internship Lifecycle Action</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            {isConverted
              ? 'This intern has been successfully converted to a full-time employee.'
              : isCompleted
              ? 'Internship is completed. You can generate a certificate or convert to employee.'
              : 'Submit final performance review or transition to full-time employee.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {!isConverted && (
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Create Review
            </button>
          )}

          {!isConverted && (
            <button
              onClick={() => setIsConvertModalOpen(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              Convert to Employee
            </button>
          )}

          {isConverted && (
            <button
              onClick={() => navigate(`/employees/${emp.id}`)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              View Employee Profile →
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <EditInternModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateIntern}
        intern={intern}
        employees={employees}
      />

      <CreateReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSave={handleCreateReview}
      />

      <ConvertInternModal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        onConfirm={handleConvertIntern}
        internName={fullName}
        domain={intern.internship_domain}
      />

      <CompleteInternModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        onConfirm={handleCompleteInternship}
        internName={fullName}
      />
    </div>
  );
}
