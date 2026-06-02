export type ActiveTab = 'home' | 'sales' | 'inventory' | 'approvals';

export interface User {
  name: string;
  employeeId: string;
  roleId: string;
  isLoggedIn: boolean;
  profileImage?: string;
}

export interface BrandPerformance {
  brand: string;
  target: number;
  actual: number;
  rate: number; // percentage, e.g., 95.8
}

export interface CircularPerformance {
  title: string;
  subTitle: string;
  overallRate: number; // e.g. 93
  data: BrandPerformance[];
}

export interface StoreSales {
  id: string;
  storeName: string;
  actualSales: number;
  completedRate: number; // e.g., 105
  stretchGoal: number;
  brand: string;
  channel: '직영점' | '백화점' | '아울렛' | '기타';
}

export interface InventoryItem {
  id: string;
  code: string;
  productName: string;
  location: string;
  currentStock: number;
  availableStock: number;
  status: '시즌 신상품' | '재고부족' | '예약 가능';
  category: string;
  brand: string;
}

export interface ApprovalRequest {
  id: string;
  reqCode: string;
  title: string;
  usageStatus: string; // e.g., 미사용 / 사용중
  requesterName: string;
  requesterRole: string; // e.g., 대리 / 과장 / 사원
  startDate: string;
  endDate: string;
  status: '결재대기' | '승인완료' | '반려됨';
}
