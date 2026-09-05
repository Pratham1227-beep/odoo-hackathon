import React, { useState, useEffect, useCallback } from 'react';
import InternHeader from '../components/InternHeader';
import InternStats from '../components/InternStats';
import InternFilters from '../components/InternFilters';
import InternTable from '../components/InternTable';
import AddInternModal from '../components/AddInternModal';
import EditInternModal from '../components/EditInternModal';
import { internService } from '../services/internService';
import { employeeService } from '../../employees/services/employeeService';

export default function InternsPage() {
  const [interns, setInterns] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [domainFilter, setDomainFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInternToEdit, setSelectedInternToEdit] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [internsRes, statsRes, empRes] = await Promise.allSettled([
        internService.getInterns({
          search: search || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        }),
        internService.getInternStats(),
        employeeService.listEmployees({ page: 1, page_size: 100 }),
      ]);

      if (internsRes.status === 'fulfilled') {
        setInterns(internsRes.value.items || []);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }
      if (empRes.status === 'fulfilled') {
        setEmployees(empRes.value.items || []);
      }
    } catch (err) {
      console.error('Error fetching interns data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const domains = Array.from(new Set(interns.map((i) => i.internship_domain).filter(Boolean)));

  const filteredInterns = interns.filter((i) => {
    if (domainFilter !== 'ALL' && i.internship_domain !== domainFilter) return false;
    return true;
  });

  const handleCreateIntern = async (data) => {
    try {
      await internService.createIntern(data);
      await fetchData();
    } catch (err) {
      console.error('Failed to create intern:', err);
      throw err;
    }
  };

  const handleUpdateIntern = async (internId, data) => {
    try {
      await internService.updateIntern(internId, data);
      await fetchData();
    } catch (err) {
      console.error('Failed to update intern:', err);
      throw err;
    }
  };


  const handleEditClick = (intern) => {
    setSelectedInternToEdit(intern);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <InternHeader onAddIntern={() => setIsAddModalOpen(true)} />
      <InternStats stats={stats} />
      <InternFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        domainFilter={domainFilter}
        setDomainFilter={setDomainFilter}
        domains={domains}
      />
      <InternTable
        interns={filteredInterns}
        isLoading={isLoading}
        onEditIntern={handleEditClick}
      />

      <AddInternModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleCreateIntern}
        employees={employees}
      />

      <EditInternModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedInternToEdit(null);
        }}
        onSave={handleUpdateIntern}
        intern={selectedInternToEdit}
        employees={employees}
      />
    </div>
  );
}
