import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Home,
  ChevronRight,
  ArrowLeft,
  Edit3,
  ChevronDown,
  FileText,
  Clock,
  Calendar,
  CreditCard,
  Download,
  UserX,
  Sparkles,
  Check
} from 'lucide-react';
import EmployeeProfileHeader from '../components/EmployeeProfileHeader';
import EmployeeTabs from '../components/EmployeeTabs';
import PersonalInfoCard from '../components/PersonalInfoCard';
import WorkInfoCard from '../components/WorkInfoCard';
import SalaryInfoCard from '../components/SalaryInfoCard';
import LeaveAttendanceSummary from '../components/LeaveAttendanceSummary';
import ProfileCompletionCard from '../components/ProfileCompletionCard';
import EmployeeQuickActions from '../components/EmployeeQuickActions';
import RecentActivityTimeline from '../components/RecentActivityTimeline';
import EmployeeDocumentsCard from '../components/EmployeeDocumentsCard';
import AddEmployeeModal from '../components/AddEmployeeModal';
import { defaultEmployeeProfile } from '../data/employeeProfileData';
import { initialEmployees } from '../data/employeesData';

export default function EmployeeProfilePage() {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  // Load employee details
  const [profile, setProfile] = useState(() => {
    const matched = initialEmployees.find((e) => e.id === employeeId);
    if (matched) {
      return {
        ...defaultEmployeeProfile,
        id: matched.id,
        name: matched.name,
        email: matched.email,
        department: matched.department,
        designation: matched.role,
        status: matched.status,
        personalInformation: {
          ...defaultEmployeeProfile.personalInformation,
          fullName: matched.name,
          email: matched.email,
          phone: matched.phone || defaultEmployeeProfile.phone,
        },
        workInformation: {
          ...defaultEmployeeProfile.workInformation,
          employeeId: matched.id,
          department: matched.department,
          designation: matched.role,
          joinDate: matched.joinDate,
        },
      };
    }
    return defaultEmployeeProfile;
  });

  const [activeTab, setActiveTab] = useState('Overview');
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const moreActionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreActionsRef.current && !moreActionsRef.current.contains(event.target)) {
        setShowMoreActions(false);
      }
    };

    if (showMoreActions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreActions]);

  const handleMoreAction = (action) => {
    setShowMoreActions(false);
    if (action === 'contract') navigate(`/payroll?employee=${profile.id}`);
    else if (action === 'attendance') navigate(`/attendance?employee=${profile.id}`);
    else if (action === 'leave') navigate(`/leave-management?employee=${profile.id}`);
    else if (action === 'payslips') navigate(`/payroll?employee=${profile.id}`);
    else if (action === 'download') alert(`Downloading full HR profile package for ${profile.name}...`);
    else if (action === 'deactivate') {
      if (confirm(`Are you sure you want to deactivate ${profile.name}?`)) {
        setProfile((prev) => ({ ...prev, status: 'Inactive' }));
      }
    }
  };

  const handleSaveProfile = (formData) => {
    setProfile((prev) => ({
      ...prev,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || prev.phone,
      department: formData.department,
      designation: formData.role,
      status: formData.status,
      personalInformation: {
        ...prev.personalInformation,
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone || prev.personalInformation.phone,
      },
      workInformation: {
        ...prev.workInformation,
        department: formData.department,
        designation: formData.role,
        employmentType: formData.employmentType,
        joinDate: formData.joinDate,
      },
    }));
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Action Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link
            to="/employees"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
          <Link
            to="/employees"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Employees
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
          <span className="text-slate-900 dark:text-white font-bold">
            Employee Profile
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Back to Employees */}
          <Link
            to="/employees"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Employees</span>
          </Link>

          {/* Edit Profile */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-900/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/90 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          {/* More Actions Dropdown */}
          <div className="relative" ref={moreActionsRef}>
            <button
              onClick={() => setShowMoreActions(!showMoreActions)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <span>More Actions</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Dropdown Menu */}
            {showMoreActions && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                <button
                  onClick={() => handleMoreAction('contract')}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>View Contract</span>
                </button>
                <button
                  onClick={() => handleMoreAction('attendance')}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>View Attendance</span>
                </button>
                <button
                  onClick={() => handleMoreAction('leave')}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>View Leave</span>
                </button>
                <button
                  onClick={() => handleMoreAction('payslips')}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>View Payslips</span>
                </button>
                <button
                  onClick={() => handleMoreAction('download')}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Download Employee Details</span>
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <button
                  onClick={() => handleMoreAction('deactivate')}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Deactivate Employee</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Large Profile Header Card */}
      <EmployeeProfileHeader employee={profile} />

      {/* Navigation Tabs */}
      <EmployeeTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content Display */}
      {activeTab === 'Overview' ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Main Left Column (approx 8 cols) */}
          <div className="xl:col-span-8 space-y-6">
            {/* 2-Column Row: Personal Info & Work Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PersonalInfoCard
                data={profile.personalInformation}
                onEdit={() => setIsEditModalOpen(true)}
              />
              <WorkInfoCard
                data={profile.workInformation}
                onEdit={() => setIsEditModalOpen(true)}
              />
            </div>

            {/* 2-Column Row: Salary Info & Leave/Attendance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SalaryInfoCard
                data={profile.salary}
                onEdit={() => setIsEditModalOpen(true)}
              />
              <LeaveAttendanceSummary
                data={profile.leaveAttendance}
                employeeId={profile.id}
              />
            </div>

            {/* Recent Activity Timeline Card */}
            <RecentActivityTimeline activities={profile.activities} />
          </div>

          {/* Right Rail Column (approx 4 cols) */}
          <div className="xl:col-span-4 space-y-6">
            {/* Profile Completion Card */}
            <ProfileCompletionCard
              data={profile.profileCompletion}
              onCompleteClick={() => setIsEditModalOpen(true)}
            />

            {/* Quick Actions 2x2 Grid */}
            <EmployeeQuickActions
              actions={profile.quickActions}
              employeeId={profile.id}
            />

            {/* Documents Card */}
            <EmployeeDocumentsCard documents={profile.documents} />
          </div>
        </div>
      ) : (
        /* Non-overview Tab View */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-100 dark:border-slate-800/80 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {activeTab} Details for {profile.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This module displays detailed historical records, analytics, and policy configurations for {profile.name}.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('Overview')}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-xs hover:bg-indigo-700 transition-colors"
            >
              Return to Overview
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <AddEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProfile}
        employeeToEdit={{
          id: profile.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          department: profile.department,
          role: profile.designation,
          employmentType: profile.workInformation.employmentType,
          status: profile.status,
          joinDate: profile.workInformation.joinDate,
        }}
      />
    </div>
  );
}
