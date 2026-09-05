import { payrollService } from '../../payroll/services/payrollService';

export const payrunService = {
  ...payrollService,
  getPayrollDashboard: payrollService.getDashboard,
  getPayrunDetail: payrollService.getPayrun,
};

export default payrunService;
