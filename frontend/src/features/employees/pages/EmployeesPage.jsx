import React, { useState, useMemo, useEffect, useCallback } from 'react';
import EmployeeHeader from '../components/EmployeeHeader';
import EmployeeStats from '../components/EmployeeStats';
import EmployeeFilterBar from '../components/EmployeeFilterBar';
import EmployeeTable from '../components/EmployeeTable';
import EmployeePagination from '../components/EmployeePagination';
import AddEmployeeModal from '../components/AddEmployeeModal';
import { employeeService } from '../services/employeeService';
import { organizationService } from '../../../shared/services/organizationService';
import { Loader2 } from 'lucide-react';

const avatarThemes = ['purple', 'blue', 'pink', 'teal', 'violet', 'sky', 'rose', 'mint'];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('All Types');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);

  const fetchEmployeesData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [empRes, deptRes, statsRes] = await Promise.allSettled([
        employeeService.getEmployees({ page: 1, page_size: 100 }),
        organizationService.getDepartments(),
        employeeService.getEmployeeStats(),
      ]);

      if (empRes.status === 'fulfilled' && empRes.value?.items) {
        const mapped = empRes.value.items.map((emp, index) => {
          const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Employee';
          const initials = fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'EM';
          return {
            id: emp.employee_code || emp.id,
            realId: emp.id,
            name: fullName,
            email: emp.email,
            phone: emp.phone,
            department: emp.department_name || 'Unassigned',
            departmentId: emp.department_id,
            role: emp.designation_title || 'Staff',
            designationId: emp.designation_id,
            status: emp.status === 'ACTIVE' ? 'Active' : emp.status === 'ON_LEAVE' ? 'On Leave' : 'Inactive',
            employmentType: emp.employment_type === 'FULL_TIME' ? 'Full-Time' : emp.employment_type === 'PART_TIME' ? 'Part-Time' : 'Contract',
            joinDate: emp.joining_date ? new Date(emp.joining_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent',
            initials: initials,
            avatarTheme: avatarThemes[index % avatarThemes.length],
          };
        });
        setEmployees(mapped);
      }

      if (deptRes.status === 'fulfilled' && Array.isArray(deptRes.value)) {
        setDepartmentsList(deptRes.value);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setStats(statsRes.value);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployeesData();
  }, [fetchEmployeesData]);

  // Compute live KPIs
  const totalEmployees = employees.length;
  const activeCount = employees.filter((e) => e.status === 'Active').length;
  const onLeaveCount = employees.filter((e) => e.status === 'On Leave').length;
  const newJoinsCount = stats?.new_hires_this_month ?? 0;

  const dynamicKPIs = [
    {
      id: 'total-emp',
      title: 'Total Employees',
      value: String(totalEmployees),
      trend: `${activeCount} Active`,
      trendType: 'positive',
      icon: 'Users',
      theme: 'purple',
    },
    {
      id: 'active-emp',
      title: 'Active Employees',
      value: String(activeCount),
      trend: totalEmployees > 0 ? `${Math.round((activeCount / totalEmployees) * 100)}% active rate` : '100%',
      trendType: 'positive',
      icon: 'UserCheck',
      theme: 'teal',
    },
    {
      id: 'on-leave-emp',
      title: 'On Leave',
      value: String(onLeaveCount),
      trend: `${onLeaveCount} out today`,
      trendType: 'amber',
      icon: 'UserMinus',
      theme: 'amber',
    },
    {
      id: 'new-joins-emp',
      title: 'New Hires',
      value: String(newJoinsCount),
      trend: 'This period',
      trendType: 'positive',
      icon: 'UserPlus',
      theme: 'violet',
    },
  ];

  // Check if any filter is active
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedDepartment !== 'All Departments' ||
    selectedEmploymentType !== 'All Types' ||
    selectedStatus !== 'All Statuses';

  // Filtered Employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Search matching
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = emp.name.toLowerCase().includes(query);
        const matchesEmail = emp.email.toLowerCase().includes(query);
        const matchesId = String(emp.id).toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesId) return false;
      }

      // Department filter
      if (
        selectedDepartment !== 'All Departments' &&
        emp.department !== selectedDepartment
      ) {
        return false;
      }

      // Employment Type filter
      if (
        selectedEmploymentType !== 'All Types' &&
        emp.employmentType !== selectedEmploymentType
      ) {
        return false;
      }

      // Status filter
      if (
        selectedStatus !== 'All Statuses' &&
        emp.status !== selectedStatus
      ) {
        return false;
      }

      return true;
    });
  }, [employees, searchQuery, selectedDepartment, selectedEmploymentType, selectedStatus]);

  // Pagination calculations
  const totalItems = filteredEmployees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Handler functions
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleDepartmentChange = (val) => {
    setSelectedDepartment(val);
    setCurrentPage(1);
  };

  const handleEmploymentTypeChange = (val) => {
    setSelectedEmploymentType(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val) => {
    setSelectedStatus(val);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('All Departments');
    setSelectedEmploymentType('All Types');
    setSelectedStatus('All Statuses');
    setCurrentPage(1);
  };

  const handleOpenAddModal = () => {
    setEmployeeToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setEmployeeToEdit(emp);
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (empData) => {
    try {
      const names = (empData.name || '').trim().split(/\s+/);
      const firstName = names[0] || 'User';
      const lastName = names.slice(1).join(' ').trim() || firstName;

      const matchedDept = departmentsList.find(
        (d) => d.name?.toLowerCase() === empData.department?.toLowerCase()
      );

      let joinDateIso = new Date().toISOString().split('T')[0];
      if (empData.joinDate) {
        const parsed = new Date(empData.joinDate);
        if (!isNaN(parsed.getTime())) {
          joinDateIso = parsed.toISOString().split('T')[0];
        }
      }

      const formattedStatus =
        empData.status === 'On Leave'
          ? 'ON_LEAVE'
          : empData.status === 'Inactive'
          ? 'INACTIVE'
          : 'ACTIVE';

      const formattedEmpType =
        empData.employmentType === 'Part-Time'
          ? 'PART_TIME'
          : empData.employmentType === 'Contract'
          ? 'CONTRACT'
          : 'FULL_TIME';

      if (empData.id && employeeToEdit?.realId) {
        // Update existing employee
        await employeeService.updateEmployee(employeeToEdit.realId, {
          first_name: firstName,
          last_name: lastName,
          phone: empData.phone || null,
          department_id: matchedDept?.id || undefined,
          status: formattedStatus,
        });
        alert('Employee updated successfully!');
      } else {
        // Create new employee / admin
        const res = await employeeService.createEmployee({
          first_name: firstName,
          last_name: lastName,
          email: empData.email.trim().toLowerCase(),
          phone: empData.phone?.trim() || null,
          user_role: empData.user_role || 'EMPLOYEE',
          create_user_account: true,
          department_id: matchedDept?.id || null,
          employment_type: formattedEmpType,
          status: formattedStatus,
          joining_date: joinDateIso,
        });

        const tempPw = res?.temporary_password;
        if (tempPw) {
          alert(`Employee (${empData.user_role || 'EMPLOYEE'}) created successfully!\n\nTemporary Login Credentials:\nEmail: ${empData.email}\nTemporary Password: ${tempPw}\n\nThese credentials have also been emailed.`);
        } else {
          alert('Employee created successfully! Their login credentials have been generated and emailed.');
        }
      }
      setIsModalOpen(false);
      fetchEmployeesData();
    } catch (error) {
      let errorMsg = error.message;
      if (error.response?.data) {
        const data = error.response.data;
        if (data.error?.message) {
          errorMsg = data.error.message;
        } else if (typeof data.detail === 'string') {
          errorMsg = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMsg = data.detail
            .map((d) => (d.loc ? `${d.loc.slice(-1)}: ` : '') + d.msg)
            .join('; ');
        } else if (typeof data.detail === 'object') {
          errorMsg = JSON.stringify(data.detail);
        }
      }
      alert('Error saving employee: ' + errorMsg);
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <EmployeeHeader onAddClick={handleOpenAddModal} />

      {/* KPI Stats Row */}
      <EmployeeStats kpis={dynamicKPIs} />

      {/* Main Employee Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-2">
        {/* Filter Bar */}
        <EmployeeFilterBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={handleDepartmentChange}
          selectedEmploymentType={selectedEmploymentType}
          onEmploymentTypeChange={handleEmploymentTypeChange}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-xs font-medium text-slate-500">Loading live employee directory...</p>
          </div>
        ) : (
          <>
            {/* Table Content */}
            <EmployeeTable
              employees={currentEmployees}
              startIndex={startIndex}
              onEditEmployee={handleOpenEditModal}
            />

            {/* Pagination */}
            <EmployeePagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </>
        )}
      </div>

      {/* Add / Edit Employee Modal */}
      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEmployee}
        employeeToEdit={employeeToEdit}
      />
    </div>
  );
}
