import React, { useState, useMemo } from 'react';
import EmployeeHeader from '../components/EmployeeHeader';
import EmployeeStats from '../components/EmployeeStats';
import EmployeeFilterBar from '../components/EmployeeFilterBar';
import EmployeeTable from '../components/EmployeeTable';
import EmployeePagination from '../components/EmployeePagination';
import AddEmployeeModal from '../components/AddEmployeeModal';
import { employeeKPIs, initialEmployees } from '../data/employeesData';
import { employeeService } from '../services/employeeService';

const avatarThemes = ['purple', 'blue', 'pink', 'teal', 'violet', 'sky', 'rose', 'mint'];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('All Types');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);

  // Check if any filter is active
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedDepartment !== 'All Departments' ||
    selectedEmploymentType !== 'All Types' ||
    selectedStatus !== 'All Statuses';

  // Filtered Employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Search matching (name, email, or employee ID)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = emp.name.toLowerCase().includes(query);
        const matchesEmail = emp.email.toLowerCase().includes(query);
        const matchesId = emp.id.toLowerCase().includes(query);
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
    if (empData.id) {
      // Update existing employee (mock)
      setEmployees((prev) =>
        prev.map((item) =>
          item.id === empData.id
            ? {
                ...item,
                ...empData,
                initials: empData.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2),
              }
            : item
        )
      );
    } else {
      try {
        // Call Backend API to create Employee and provision user
        const result = await employeeService.createEmployee(empData);
        
        alert(`Employee created successfully! Their login credentials have been emailed to them.`);

        // Add to local state to reflect UI changes immediately
        const nextIdNumber = employees.length + 1;
        const formattedId = result.employee_code || `EMP${String(nextIdNumber).padStart(3, '0')}`;
        const initials = empData.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        const randomTheme = avatarThemes[Math.floor(Math.random() * avatarThemes.length)];

        const newEmp = {
          ...empData,
          id: formattedId,
          initials: initials || 'EM',
          avatarTheme: randomTheme,
        };

        setEmployees((prev) => [newEmp, ...prev]);
      } catch (error) {
        alert("Error creating employee: " + (error.response?.data?.detail || error.message));
      }
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <EmployeeHeader onAddClick={handleOpenAddModal} />

      {/* KPI Stats Row */}
      <EmployeeStats kpis={employeeKPIs} />

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
