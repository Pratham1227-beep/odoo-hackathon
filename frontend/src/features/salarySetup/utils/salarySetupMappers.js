import {
  initialEmployeeSalaries,
  initialSalaryStructures,
  initialSalaryRules,
} from '../data/salarySetupData';

const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
  'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300',
  'bg-teal-100 text-teal-700 dark:bg-teal-950/70 dark:text-teal-300',
];

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (parts[0]?.[0] || 'U').toUpperCase();
};

const pickAvatarColor = (seed = '') => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[hash];
};

export const mapCategoryToUi = (cat) => {
  switch (String(cat || '').toUpperCase()) {
    case 'BASIC':
      return 'Basic';
    case 'ALLOWANCE':
      return 'Allowance';
    case 'GROSS':
      return 'Gross';
    case 'DEDUCTION':
      return 'Deduction';
    case 'NET':
      return 'Net Salary';
    default:
      return cat || 'Allowance';
  }
};

export const mapCategoryToApi = (cat) => {
  switch (String(cat || '').toUpperCase()) {
    case 'BASIC':
      return 'BASIC';
    case 'ALLOWANCE':
      return 'ALLOWANCE';
    case 'GROSS':
      return 'GROSS';
    case 'DEDUCTION':
      return 'DEDUCTION';
    case 'NET':
    case 'NET SALARY':
      return 'NET';
    default:
      return 'ALLOWANCE';
  }
};

export const mapComputationTypeToUi = (calcType) => {
  switch (String(calcType || '').toUpperCase()) {
    case 'PERCENTAGE':
      return 'percentage';
    case 'FORMULA':
      return 'formula';
    case 'FIXED':
    default:
      return 'fixed';
  }
};

export const mapComputationTypeToApi = (type) => {
  switch (String(type || '').toLowerCase()) {
    case 'percentage':
      return 'PERCENTAGE';
    case 'formula':
      return 'FORMULA';
    case 'fixed':
    default:
      return 'FIXED';
  }
};

export const mapStructureToUi = (backendStr, ruleCount = 0) => {
  const rCount = backendStr.rules?.length || ruleCount || 0;
  return {
    id: backendStr.id,
    structureId: backendStr.id,
    code: backendStr.code,
    name: backendStr.name,
    description: backendStr.description || 'Standard compensation structure',
    rulesCount: rCount,
    employeesCount: backendStr.employees_count || 12,
    active: backendStr.is_active ?? true,
    isDefault: backendStr.is_default ?? false,
    raw: backendStr,
  };
};

export const mapRuleToUi = (backendRule) => {
  const compType = mapComputationTypeToUi(backendRule.calculation_type);
  const categoryUi = mapCategoryToUi(backendRule.category);

  return {
    id: backendRule.id,
    ruleId: backendRule.id,
    code: backendRule.code,
    name: backendRule.name,
    category: categoryUi,
    apiCategory: backendRule.category,
    computationType: compType,
    value: Number(backendRule.fixed_amount || 0),
    percentageOf: backendRule.percentage_base || 'BASIC',
    percentageValue: Number(backendRule.percentage || 0),
    formula: backendRule.formula || null,
    active: backendRule.is_active ?? true,
    sequence: backendRule.sequence ?? 1,
    taxable: backendRule.taxable ?? true,
    isStatutory: backendRule.is_statutory ?? false,
    raw: backendRule,
  };
};

export const mapEmployeeToSalaryUi = (backendEmp, components = []) => {
  const name = `${backendEmp.first_name || ''} ${backendEmp.last_name || ''}`.trim() || backendEmp.name || 'Employee';
  const empCode = backendEmp.employee_code || backendEmp.id?.slice(0, 8) || 'EMP';
  const role = backendEmp.designation?.title || backendEmp.role || 'Team Member';
  const department = backendEmp.department?.name || backendEmp.department || 'Engineering';

  // Parse allowances and deductions from components override
  const allowances = [];
  const deductions = [];
  let basicSalary = 75000;

  if (components && components.length > 0) {
    components.forEach((c) => {
      const val = Number(c.value || 0);
      const cat = String(c.rule_category || '').toUpperCase();
      const code = String(c.rule_code || '').toUpperCase();

      if (code === 'BASIC' || cat === 'BASIC') {
        basicSalary = val;
      } else if (cat === 'DEDUCTION') {
        deductions.push({
          id: c.id || `ded-${c.salary_rule_id}`,
          ruleId: c.salary_rule_id,
          name: c.rule_name || c.rule_code || 'Deduction',
          type: c.value_type === 'PERCENTAGE' ? 'percentage' : 'fixed',
          value: val,
          amount: val,
          editable: true,
          frequency: 'Monthly',
          isTaxDeductible: true,
        });
      } else {
        allowances.push({
          id: c.id || `all-${c.salary_rule_id}`,
          ruleId: c.salary_rule_id,
          name: c.rule_name || c.rule_code || 'Allowance',
          type: c.value_type === 'PERCENTAGE' ? 'percentage' : 'fixed',
          value: val,
          amount: val,
          editable: true,
          frequency: 'Monthly',
          taxable: true,
        });
      }
    });
  }

  // Fallback allowances if empty
  const finalAllowances = allowances.length > 0 ? allowances : [
    {
      id: 'hra',
      name: 'House Rent Allowance (HRA)',
      type: 'percentage',
      value: 40,
      amount: Math.round(basicSalary * 0.4),
      editable: true,
      frequency: 'Monthly',
      taxable: true,
    },
    {
      id: 'special',
      name: 'Special Allowance',
      type: 'fixed',
      value: Math.round(basicSalary * 0.2),
      amount: Math.round(basicSalary * 0.2),
      editable: true,
      frequency: 'Monthly',
      taxable: true,
    },
  ];

  // Fallback deductions if empty
  const finalDeductions = deductions.length > 0 ? deductions : [
    {
      id: 'pf',
      name: 'Provident Fund (PF)',
      type: 'percentage',
      value: 12,
      amount: Math.round(basicSalary * 0.12),
      editable: false,
      frequency: 'Monthly',
      isTaxDeductible: true,
    },
    {
      id: 'pt',
      name: 'Professional Tax (PT)',
      type: 'fixed',
      value: 200,
      amount: 200,
      editable: false,
      frequency: 'Monthly',
      isTaxDeductible: true,
    },
  ];

  return {
    id: backendEmp.id || empCode,
    employeeUuid: backendEmp.id,
    userId: backendEmp.user_id || backendEmp.id,
    name,
    role,
    department,
    employeeType: backendEmp.employment_type || 'Full-time',
    initials: getInitials(name),
    avatarBg: pickAvatarColor(backendEmp.id || name),
    structure: 'Standard Executive CTC',
    structureId: 'STR-001',
    currency: 'INR',
    effectiveDate: backendEmp.joining_date || '2026-04-01',
    basicSalary,
    allowances: finalAllowances,
    deductions: finalDeductions,
    paymentDetails: {
      paymentMethod: 'Bank Transfer (NEFT/RTGS)',
      bankName: 'HDFC Bank Ltd.',
      accountNumber: '987654321098',
      ifscCode: 'HDFC0001234',
      accountHolder: name,
      taxRegime: 'New Regime (FY 2026-27)',
      panNumber: 'ABCDE1234F',
      uanNumber: '100987654321',
    },
    raw: backendEmp,
  };
};

export const mapUiRuleToApiCreate = (uiRule) => {
  const calcType = mapComputationTypeToApi(uiRule.computationType || uiRule.type);
  const category = mapCategoryToApi(uiRule.category || (uiRule.type === 'deduction' ? 'Deduction' : 'Allowance'));
  const code = (uiRule.code || uiRule.name || 'RULE').toUpperCase().replace(/[^A-Z0-9_]/g, '_');

  const payload = {
    name: uiRule.name,
    code,
    category,
    calculation_type: calcType,
    sequence: Number(uiRule.sequence || 1),
    taxable: uiRule.taxable ?? true,
    is_statutory: uiRule.isStatutory ?? false,
    is_active: uiRule.active ?? true,
  };

  if (calcType === 'FIXED') {
    payload.fixed_amount = Number(uiRule.amount || uiRule.value || 0);
  } else if (calcType === 'PERCENTAGE') {
    payload.percentage = Number(uiRule.value || uiRule.percentageValue || 0);
    payload.percentage_base = uiRule.percentageOf || 'BASIC';
  } else if (calcType === 'FORMULA') {
    payload.formula = uiRule.formula || 'BASIC * 0.5';
  }

  return payload;
};
