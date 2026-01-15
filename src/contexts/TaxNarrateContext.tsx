import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Types
export type UserMode = 'lite' | 'secure' | 'secure_plus';
export type UserType = 'individual' | 'business';
export type PaymentPlan = 'monthly' | 'quarterly' | 'annual';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  brand?: string;
  isPrimary: boolean;
}

export interface Payment {
  id: string;
  type: 'tax' | 'subscription';
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'failed';
  receiptNumber?: string;
  description: string;
}

export const DEPARTMENTS = [
  'Engineering',
  'Sales',
  'Marketing',
  'Finance',
  'Human Resources',
  'Operations',
  'Customer Support',
  'Legal',
  'Executive',
  'Other',
] as const;

export type Department = typeof DEPARTMENTS[number];

export interface Employee {
  id: string;
  name: string;
  nin?: string;
  department: Department;
  monthlySalary: number;
  annualRent: number;
  monthlyTax: number;
  annualTax: number;
  status: 'active' | 'inactive';
}

export interface TaxNarrateState {
  // User Settings
  userType: UserType;
  currentMode: UserMode;
  
  // Individual Data
  individual: {
    monthlyIncome: number;
    annualRent: number;
    taxDue2026: number;
    taxDue2025: number;
    savings: number;
  };
  
  // Business Data
  business: {
    companyName: string;
    rcNumber: string;
    tin: string;
    annualTurnover: number;
    isExempt: boolean;
    citDue: number;
    employees: Employee[];
  };
  
  // Subscription
  subscription: {
    plan: UserMode;
    autoRenewalEnabled: boolean;
    renewalDate: string | null;
    planAmount: number;
    paymentMethods: PaymentMethod[];
  };
  
  // Tax Auto-Pay
  taxAutoPay: {
    enabled: boolean;
    plan: PaymentPlan;
    nextPayment: string | null;
    totalPaid: number;
    authorized: boolean;
  };
  
  // Payment History
  payments: Payment[];
  
  // Compliance
  compliance: {
    ninVerified: boolean;
    tinVerified: boolean;
    score: number;
    taxCalculated: boolean;
    paymentMethodAdded: boolean;
    autoPayEnabled: boolean;
  };
  
  // UI State
  demoBannerDismissed: boolean;
}

// Initial State
const initialState: TaxNarrateState = {
  userType: 'individual',
  currentMode: 'lite',
  
  individual: {
    monthlyIncome: 0,
    annualRent: 0,
    taxDue2026: 0,
    taxDue2025: 0,
    savings: 0,
  },
  
  business: {
    companyName: '',
    rcNumber: '',
    tin: '',
    annualTurnover: 0,
    isExempt: true,
    citDue: 0,
    employees: [],
  },
  
  subscription: {
    plan: 'lite',
    autoRenewalEnabled: false,
    renewalDate: null,
    planAmount: 0,
    paymentMethods: [],
  },
  
  taxAutoPay: {
    enabled: false,
    plan: 'monthly',
    nextPayment: null,
    totalPaid: 0,
    authorized: false,
  },
  
  payments: [],
  
  compliance: {
    ninVerified: false,
    tinVerified: false,
    score: 0,
    taxCalculated: false,
    paymentMethodAdded: false,
    autoPayEnabled: false,
  },
  
  demoBannerDismissed: false,
};

// Action Types
type Action =
  | { type: 'SET_USER_TYPE'; payload: UserType }
  | { type: 'SET_MODE'; payload: UserMode }
  | { type: 'UPDATE_INDIVIDUAL'; payload: Partial<TaxNarrateState['individual']> }
  | { type: 'UPDATE_BUSINESS'; payload: Partial<TaxNarrateState['business']> }
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'UPDATE_EMPLOYEE'; payload: { id: string; updates: Partial<Employee> } }
  | { type: 'REMOVE_EMPLOYEE'; payload: string }
  | { type: 'UPDATE_SUBSCRIPTION'; payload: Partial<TaxNarrateState['subscription']> }
  | { type: 'ADD_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'REMOVE_PAYMENT_METHOD'; payload: string }
  | { type: 'SET_PRIMARY_PAYMENT_METHOD'; payload: string }
  | { type: 'UPDATE_TAX_AUTO_PAY'; payload: Partial<TaxNarrateState['taxAutoPay']> }
  | { type: 'ADD_PAYMENT'; payload: Payment }
  | { type: 'UPDATE_COMPLIANCE'; payload: Partial<TaxNarrateState['compliance']> }
  | { type: 'DISMISS_DEMO_BANNER' }
  | { type: 'LOAD_STATE'; payload: Partial<TaxNarrateState> }
  | { type: 'RESET_STATE' };

// Reducer
function taxNarrateReducer(state: TaxNarrateState, action: Action): TaxNarrateState {
  switch (action.type) {
    case 'SET_USER_TYPE':
      return { ...state, userType: action.payload };
      
    case 'SET_MODE':
      return { 
        ...state, 
        currentMode: action.payload,
        subscription: { ...state.subscription, plan: action.payload }
      };
      
    case 'UPDATE_INDIVIDUAL':
      return { ...state, individual: { ...state.individual, ...action.payload } };
      
    case 'UPDATE_BUSINESS':
      return { ...state, business: { ...state.business, ...action.payload } };
      
    case 'ADD_EMPLOYEE':
      return { 
        ...state, 
        business: { 
          ...state.business, 
          employees: [...state.business.employees, action.payload] 
        } 
      };
      
    case 'UPDATE_EMPLOYEE':
      return {
        ...state,
        business: {
          ...state.business,
          employees: state.business.employees.map(emp =>
            emp.id === action.payload.id ? { ...emp, ...action.payload.updates } : emp
          ),
        },
      };
      
    case 'REMOVE_EMPLOYEE':
      return {
        ...state,
        business: {
          ...state.business,
          employees: state.business.employees.filter(emp => emp.id !== action.payload),
        },
      };
      
    case 'UPDATE_SUBSCRIPTION':
      return { ...state, subscription: { ...state.subscription, ...action.payload } };
      
    case 'ADD_PAYMENT_METHOD':
      return {
        ...state,
        subscription: {
          ...state.subscription,
          paymentMethods: [...state.subscription.paymentMethods, action.payload],
        },
        compliance: { ...state.compliance, paymentMethodAdded: true },
      };
      
    case 'REMOVE_PAYMENT_METHOD':
      return {
        ...state,
        subscription: {
          ...state.subscription,
          paymentMethods: state.subscription.paymentMethods.filter(pm => pm.id !== action.payload),
        },
      };
      
    case 'SET_PRIMARY_PAYMENT_METHOD':
      return {
        ...state,
        subscription: {
          ...state.subscription,
          paymentMethods: state.subscription.paymentMethods.map(pm => ({
            ...pm,
            isPrimary: pm.id === action.payload,
          })),
        },
      };
      
    case 'UPDATE_TAX_AUTO_PAY':
      return { 
        ...state, 
        taxAutoPay: { ...state.taxAutoPay, ...action.payload },
        compliance: { 
          ...state.compliance, 
          autoPayEnabled: action.payload.enabled ?? state.taxAutoPay.enabled 
        },
      };
      
    case 'ADD_PAYMENT':
      return { ...state, payments: [action.payload, ...state.payments] };
      
    case 'UPDATE_COMPLIANCE':
      return { ...state, compliance: { ...state.compliance, ...action.payload } };
      
    case 'DISMISS_DEMO_BANNER':
      return { ...state, demoBannerDismissed: true };
      
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
      
    case 'RESET_STATE':
      return initialState;
      
    default:
      return state;
  }
}

// Context
interface TaxNarrateContextType {
  state: TaxNarrateState;
  dispatch: React.Dispatch<Action>;
  
  // Helper functions
  setUserType: (type: UserType) => void;
  setMode: (mode: UserMode) => void;
  updateIndividual: (data: Partial<TaxNarrateState['individual']>) => void;
  updateBusiness: (data: Partial<TaxNarrateState['business']>) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  removeEmployee: (id: string) => void;
  addPayment: (payment: Payment) => void;
  dismissDemoBanner: () => void;
  
  // Mode checks
  isLiteMode: boolean;
  isSecureMode: boolean;
  isSecurePlusMode: boolean;
  canAccessFeature: (requiredMode: UserMode) => boolean;
}

const TaxNarrateContext = createContext<TaxNarrateContextType | undefined>(undefined);

// Storage key prefix
const STORAGE_PREFIX = 'taxnarrate_';

// Provider
export function TaxNarrateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taxNarrateReducer, initialState);
  
  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const storedState: Partial<TaxNarrateState> = {};
      
      const keys = [
        'user_mode', 'user_type', 'individual_data', 'business_data',
        'subscription', 'auto_pay', 'payment_history', 'compliance', 'demo_dismissed'
      ];
      
      keys.forEach(key => {
        const stored = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          switch (key) {
            case 'user_mode':
              storedState.currentMode = parsed;
              break;
            case 'user_type':
              storedState.userType = parsed;
              break;
            case 'individual_data':
              storedState.individual = parsed;
              break;
            case 'business_data':
              storedState.business = parsed;
              break;
            case 'subscription':
              storedState.subscription = parsed;
              break;
            case 'auto_pay':
              storedState.taxAutoPay = parsed;
              break;
            case 'payment_history':
              storedState.payments = parsed;
              break;
            case 'compliance':
              storedState.compliance = parsed;
              break;
            case 'demo_dismissed':
              storedState.demoBannerDismissed = parsed;
              break;
          }
        }
      });
      
      if (Object.keys(storedState).length > 0) {
        dispatch({ type: 'LOAD_STATE', payload: storedState });
      }
    } catch (error) {
      console.error('Failed to load state from localStorage:', error);
    }
  }, []);
  
  // Save state to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}user_mode`, JSON.stringify(state.currentMode));
      localStorage.setItem(`${STORAGE_PREFIX}user_type`, JSON.stringify(state.userType));
      localStorage.setItem(`${STORAGE_PREFIX}individual_data`, JSON.stringify(state.individual));
      localStorage.setItem(`${STORAGE_PREFIX}business_data`, JSON.stringify(state.business));
      localStorage.setItem(`${STORAGE_PREFIX}subscription`, JSON.stringify(state.subscription));
      localStorage.setItem(`${STORAGE_PREFIX}auto_pay`, JSON.stringify(state.taxAutoPay));
      localStorage.setItem(`${STORAGE_PREFIX}payment_history`, JSON.stringify(state.payments));
      localStorage.setItem(`${STORAGE_PREFIX}compliance`, JSON.stringify(state.compliance));
      localStorage.setItem(`${STORAGE_PREFIX}demo_dismissed`, JSON.stringify(state.demoBannerDismissed));
    } catch (error) {
      console.error('Failed to save state to localStorage:', error);
    }
  }, [state]);
  
  // Helper functions
  const setUserType = (type: UserType) => dispatch({ type: 'SET_USER_TYPE', payload: type });
  const setMode = (mode: UserMode) => dispatch({ type: 'SET_MODE', payload: mode });
  const updateIndividual = (data: Partial<TaxNarrateState['individual']>) => 
    dispatch({ type: 'UPDATE_INDIVIDUAL', payload: data });
  const updateBusiness = (data: Partial<TaxNarrateState['business']>) => 
    dispatch({ type: 'UPDATE_BUSINESS', payload: data });
  const addEmployee = (employee: Employee) => dispatch({ type: 'ADD_EMPLOYEE', payload: employee });
  const updateEmployee = (id: string, updates: Partial<Employee>) => 
    dispatch({ type: 'UPDATE_EMPLOYEE', payload: { id, updates } });
  const removeEmployee = (id: string) => dispatch({ type: 'REMOVE_EMPLOYEE', payload: id });
  const addPayment = (payment: Payment) => dispatch({ type: 'ADD_PAYMENT', payload: payment });
  const dismissDemoBanner = () => dispatch({ type: 'DISMISS_DEMO_BANNER' });
  
  // Mode checks
  const isLiteMode = state.currentMode === 'lite';
  const isSecureMode = state.currentMode === 'secure';
  const isSecurePlusMode = state.currentMode === 'secure_plus';
  
  const canAccessFeature = (requiredMode: UserMode): boolean => {
    const modeHierarchy: Record<UserMode, number> = {
      lite: 0,
      secure: 1,
      secure_plus: 2,
    };
    return modeHierarchy[state.currentMode] >= modeHierarchy[requiredMode];
  };
  
  const value: TaxNarrateContextType = {
    state,
    dispatch,
    setUserType,
    setMode,
    updateIndividual,
    updateBusiness,
    addEmployee,
    updateEmployee,
    removeEmployee,
    addPayment,
    dismissDemoBanner,
    isLiteMode,
    isSecureMode,
    isSecurePlusMode,
    canAccessFeature,
  };
  
  return (
    <TaxNarrateContext.Provider value={value}>
      {children}
    </TaxNarrateContext.Provider>
  );
}

// Hook
export function useTaxNarrate() {
  const context = useContext(TaxNarrateContext);
  if (context === undefined) {
    throw new Error('useTaxNarrate must be used within a TaxNarrateProvider');
  }
  return context;
}
