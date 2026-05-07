export type MemberType = 'student' | 'professor';
export type BookStatus = 'available' | 'borrowed' | 'maintenance';

export interface Member {
  id: string;
  name: string;
  type: MemberType;
}

export interface Book {
  id: string;
  title: string;
  status: BookStatus;
}

export interface Loan {
  memberId: string;
  bookId: string;
  borrowedAt: Date;
  dueAt: Date;
  returnedAt: Date | null;
}

export type BorrowReason =
  | 'MEMBER_NOT_FOUND'
  | 'BOOK_NOT_FOUND'
  | 'BOOK_NOT_AVAILABLE'
  | 'LIMIT_REACHED'
  | 'HAS_OVERDUE';

export interface BorrowResult {
  success: boolean;
  loan?: Loan;
  reason?: BorrowReason;
}

export type ReturnReason = 'LOAN_NOT_FOUND' | 'NOT_BORROWER';

export interface ReturnResult {
  success: boolean;
  feeInCents: number;
  daysLate: number;
  reason?: ReturnReason;
}

export interface MemberStatus {
  activeLoans: number;
  overdueLoans: number;
  remainingSlots: number;
  canBorrow: boolean;
}
