import React, { useState, useMemo } from 'react';
import ContractHeader from '../components/ContractHeader';
import ContractStats from '../components/ContractStats';
import ContractFilterBar from '../components/ContractFilterBar';
import ContractTable from '../components/ContractTable';
import ContractDetailsCard from '../components/ContractDetailsCard';
import ContractExpiryCard from '../components/ContractExpiryCard';
import ContractQuickActions from '../components/ContractQuickActions';
import ContractPagination from '../components/ContractPagination';

import CreateContractModal from '../components/CreateContractModal';
import EditContractModal from '../components/EditContractModal';
import ContractDetailModal from '../components/ContractDetailModal';
import RenewContractModal from '../components/RenewContractModal';
import TerminateContractModal from '../components/TerminateContractModal';
import ContractDocumentViewer from '../components/ContractDocumentViewer';
import ContractTemplatesModal from '../components/ContractTemplatesModal';
import ImportContractsModal from '../components/ImportContractsModal';

import { initialContracts, computeContractStats } from '../data/contractsData';

export default function ContractsPage() {
  // Master contracts state
  const [contracts, setContracts] = useState(initialContracts);
  const [selectedContractId, setSelectedContractId] = useState('CON001');

  // Multi-row selection for bulk operations
  const [selectedIds, setSelectedIds] = useState([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [typeFilter, setTypeFilter] = useState('All Contract Types');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Active target contract for modals
  const [modalTargetContract, setModalTargetContract] = useState(null);
  const [activeTemplate, setActiveTemplate] = useState(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Currently inspected contract in right sidebar
  const activeSelectedContract = useMemo(() => {
    return (
      contracts.find((c) => c.id === selectedContractId) ||
      contracts[0] ||
      null
    );
  }, [contracts, selectedContractId]);

  // Derived statistics (KPIs)
  const stats = useMemo(() => {
    return computeContractStats(contracts);
  }, [contracts]);

  // Filtered contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      // Search query against name, ID, designation
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.employeeName?.toLowerCase().includes(q);
        const matchesId = c.employeeId?.toLowerCase().includes(q);
        const matchesRole = c.designation?.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesRole) return false;
      }

      // Department filter
      if (
        departmentFilter !== 'All Departments' &&
        c.department !== departmentFilter
      ) {
        return false;
      }

      // Contract Type filter
      if (
        typeFilter !== 'All Contract Types' &&
        c.contractType !== typeFilter
      ) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'All Statuses' && c.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [contracts, searchQuery, departmentFilter, typeFilter, statusFilter]);

  // Paginated contracts for display
  const paginatedContracts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredContracts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredContracts, currentPage]);

  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage) || 1;

  const hasActiveFilters =
    searchQuery !== '' ||
    departmentFilter !== 'All Departments' ||
    typeFilter !== 'All Contract Types' ||
    statusFilter !== 'All Statuses';

  const handleResetFilters = () => {
    setSearchQuery('');
    setDepartmentFilter('All Departments');
    setTypeFilter('All Contract Types');
    setStatusFilter('All Statuses');
    setCurrentPage(1);
  };

  // Row selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === paginatedContracts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedContracts.map((c) => c.id));
    }
  };

  const handleToggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handlers for individual actions
  const handleOpenDetailModal = (contract) => {
    setModalTargetContract(contract);
    setIsDetailModalOpen(true);
  };

  const handleOpenEditModal = (contract) => {
    setModalTargetContract(contract);
    setIsEditModalOpen(true);
  };

  const handleOpenRenewModal = (contract) => {
    setModalTargetContract(contract);
    setIsRenewModalOpen(true);
  };

  const handleOpenTerminateModal = (contract) => {
    setModalTargetContract(contract);
    setIsTerminateModalOpen(true);
  };

  const handleOpenDocViewer = (contract) => {
    setModalTargetContract(contract);
    setIsDocViewerOpen(true);
  };

  const handleDeleteContract = (id) => {
    setContracts((prev) => prev.filter((c) => c.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    showToast('Contract deleted successfully.');
  };

  // Bulk handlers
  const handleBulkDelete = () => {
    setContracts((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
    setSelectedIds([]);
    showToast('Selected contracts deleted successfully.');
  };

  const handleBulkRenew = () => {
    setContracts((prev) =>
      prev.map((c) =>
        selectedIds.includes(c.id) ? { ...c, status: 'Active' } : c
      )
    );
    setSelectedIds([]);
    showToast('Selected contracts renewed to Active status.');
  };

  const handleBulkDownload = () => {
    showToast(`Exported ${selectedIds.length} contracts.`);
    setSelectedIds([]);
  };

  // Modals Save Handlers
  const handleCreateContract = (newContract) => {
    setContracts([newContract, ...contracts]);
    setSelectedContractId(newContract.id);
    showToast('Contract created successfully.');
  };

  const handleSaveContract = (updated) => {
    setContracts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    showToast('Contract updated successfully.');
  };

  const handleConfirmRenewal = (contractId, renewalData) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id === contractId) {
          const newHistory = [
            {
              id: `H-${Date.now()}`,
              date: 'Just now',
              title: 'Contract Renewed',
              subtitle: `${renewalData.contractType} terms extended. ${renewalData.renewalNotes}`,
              author: 'HR Admin',
            },
            ...(c.history || []),
          ];
          return {
            ...c,
            ...renewalData,
            history: newHistory,
            lastUpdated: 'Just now',
          };
        }
        return c;
      })
    );
    showToast('Contract renewed successfully.');
  };

  const handleConfirmTermination = (contractId, termData) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id === contractId) {
          const newHistory = [
            {
              id: `H-${Date.now()}`,
              date: termData.terminationDate,
              title: 'Contract Terminated',
              subtitle: `Reason: ${termData.reason}. ${termData.notes}`,
              author: 'HR Compliance',
            },
            ...(c.history || []),
          ];
          return {
            ...c,
            status: 'Expired',
            endDate: termData.terminationDate,
            history: newHistory,
            lastUpdated: 'Just now',
          };
        }
        return c;
      })
    );
    showToast('Contract terminated and moved to Expired status.');
  };

  const handleUseTemplate = (tpl) => {
    setActiveTemplate(tpl);
    setIsCreateModalOpen(true);
  };

  const handleImportComplete = (importedList) => {
    setContracts((prev) => [...importedList, ...prev]);
    showToast(`Successfully imported ${importedList.length} contract.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-150">
          {toastMessage.msg}
        </div>
      )}

      {/* Header & Breadcrumb */}
      <ContractHeader
        onOpenCreateModal={() => {
          setActiveTemplate(null);
          setIsCreateModalOpen(true);
        }}
      />

      {/* 4 KPI Statistics Cards */}
      <ContractStats stats={stats} />

      {/* Search & Filter Bar */}
      <ContractFilterBar
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        departmentFilter={departmentFilter}
        setDepartmentFilter={(d) => {
          setDepartmentFilter(d);
          setCurrentPage(1);
        }}
        typeFilter={typeFilter}
        setTypeFilter={(t) => {
          setTypeFilter(t);
          setCurrentPage(1);
        }}
        statusFilter={statusFilter}
        setStatusFilter={(s) => {
          setStatusFilter(s);
          setCurrentPage(1);
        }}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left 9 Columns: Primary Contracts Table */}
        <div className="xl:col-span-8 2xl:col-span-9 space-y-4">
          <ContractTable
            contracts={paginatedContracts}
            selectedContract={activeSelectedContract}
            onSelectContract={(contract) => setSelectedContractId(contract.id)}
            selectedIds={selectedIds}
            onToggleSelectAll={handleToggleSelectAll}
            onToggleSelectRow={handleToggleSelectRow}
            onViewContract={handleOpenDetailModal}
            onEditContract={handleOpenEditModal}
            onDownloadContract={handleOpenDocViewer}
            onRenewContract={handleOpenRenewModal}
            onTerminateContract={handleOpenTerminateModal}
            onDeleteContract={handleDeleteContract}
            onBulkDelete={handleBulkDelete}
            onBulkRenew={handleBulkRenew}
            onBulkDownload={handleBulkDownload}
          />

          <ContractPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredContracts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>

        {/* Right 3 Columns: Contract Details, Expirations, Quick Actions */}
        <div className="xl:col-span-4 2xl:col-span-3 space-y-5">
          <ContractDetailsCard
            contract={activeSelectedContract}
            onViewEdit={handleOpenDetailModal}
            onOpenDocument={handleOpenDocViewer}
          />

          <ContractExpiryCard
            onSelectEmployeeExpiry={(empId) => {
              const matched = contracts.find((c) => c.employeeId === empId);
              if (matched) setSelectedContractId(matched.id);
            }}
            onViewAllExpirations={() => {
              setStatusFilter('Expiring Soon');
              setCurrentPage(1);
            }}
          />

          <ContractQuickActions
            onOpenCreateModal={() => {
              setActiveTemplate(null);
              setIsCreateModalOpen(true);
            }}
            onOpenTemplatesModal={() => setIsTemplatesModalOpen(true)}
            onOpenImportModal={() => setIsImportModalOpen(true)}
          />
        </div>
      </div>

      {/* Modals */}
      <CreateContractModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateContract={handleCreateContract}
        prefilledTemplate={activeTemplate}
        availableEmployees={contracts}
      />

      <EditContractModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        contract={modalTargetContract}
        onSaveContract={handleSaveContract}
      />

      <ContractDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        contract={modalTargetContract || activeSelectedContract}
        onEdit={handleOpenEditModal}
        onRenew={handleOpenRenewModal}
        onTerminate={handleOpenTerminateModal}
        onOpenDocument={handleOpenDocViewer}
      />

      <RenewContractModal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        contract={modalTargetContract}
        onConfirmRenewal={handleConfirmRenewal}
      />

      <TerminateContractModal
        isOpen={isTerminateModalOpen}
        onClose={() => setIsTerminateModalOpen(false)}
        contract={modalTargetContract}
        onConfirmTermination={handleConfirmTermination}
      />

      <ContractDocumentViewer
        isOpen={isDocViewerOpen}
        onClose={() => setIsDocViewerOpen(false)}
        contract={modalTargetContract || activeSelectedContract}
      />

      <ContractTemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onUseTemplate={handleUseTemplate}
      />

      <ImportContractsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
}
