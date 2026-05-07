import type {
  BorrowResult,
  Loan,
  MemberStatus,
  MemberType,
  ReturnResult,
} from './domain';
import { LibraryError } from './errors';
import type { LibraryRepository } from './ports';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const STUDENT_LIMIT = 3;
export const PROFESSOR_LIMIT = 5;
export const STUDENT_DUE_DAYS = 7;
export const PROFESSOR_DUE_DAYS = 14;

export const FEE_TIER_1_DAYS = 3;
export const FEE_TIER_1_CENTS = 200;
export const FEE_TIER_2_CENTS = 500;

export class LibraryService {
  constructor(private readonly repository: LibraryRepository) {}

  borrowBook(memberId: string, bookId: string, today: Date): BorrowResult {
    const member = this.repository.findMemberById(memberId);
    if (!member) return { success: false, reason: 'MEMBER_NOT_FOUND' };

    const book = this.repository.findBookById(bookId);
    if (!book) return { success: false, reason: 'BOOK_NOT_FOUND' };

    if (book.status !== 'available') {
      return { success: false, reason: 'BOOK_NOT_AVAILABLE' };
    }

    const active = this.repository.findActiveLoansByMemberId(memberId);

    const hasOverdue = active.some(
      (l) => today.getTime() > l.dueAt.getTime(),
    );
    if (hasOverdue) return { success: false, reason: 'HAS_OVERDUE' };

    const limit = this.getLimit(member.type);
    if (active.length >= limit) {
      return { success: false, reason: 'LIMIT_REACHED' };
    }

    const dueAt = new Date(
      today.getTime() + this.getDueDays(member.type) * MS_PER_DAY,
    );
    const loan: Loan = {
      memberId,
      bookId,
      borrowedAt: new Date(today.getTime()),
      dueAt,
      returnedAt: null,
    };
    this.repository.saveLoan(loan);

    book.status = 'borrowed';
    this.repository.saveBook(book);

    return { success: true, loan };
  }

  returnBook(memberId: string, bookId: string, today: Date): ReturnResult {
    const activeForBook = this.repository.findActiveLoanByBookId(bookId);
    if (!activeForBook) {
      return {
        success: false,
        feeInCents: 0,
        daysLate: 0,
        reason: 'LOAN_NOT_FOUND',
      };
    }
    if (activeForBook.memberId !== memberId) {
      return {
        success: false,
        feeInCents: 0,
        daysLate: 0,
        reason: 'NOT_BORROWER',
      };
    }

    activeForBook.returnedAt = new Date(today.getTime());
    this.repository.saveLoan(activeForBook);

    const book = this.repository.findBookById(bookId);
    if (book) {
      book.status = 'available';
      this.repository.saveBook(book);
    }

    const daysLate = this.computeDaysLate(activeForBook.dueAt, today);
    const feeInCents = this.computeFee(daysLate);

    return { success: true, feeInCents, daysLate };
  }

  getMemberStatus(memberId: string, today: Date): MemberStatus {
    const member = this.repository.findMemberById(memberId);
    if (!member) throw new LibraryError('MEMBER_NOT_FOUND');

    const active = this.repository.findActiveLoansByMemberId(memberId);
    const overdueLoans = active.filter(
      (l) => today.getTime() > l.dueAt.getTime(),
    ).length;
    const limit = this.getLimit(member.type);
    const remainingSlots = Math.max(0, limit - active.length);

    return {
      activeLoans: active.length,
      overdueLoans,
      remainingSlots,
      canBorrow: remainingSlots > 0 && overdueLoans === 0,
    };
  }

  private getLimit(type: MemberType): number {
    return type === 'student' ? STUDENT_LIMIT : PROFESSOR_LIMIT;
  }

  private getDueDays(type: MemberType): number {
    return type === 'student' ? STUDENT_DUE_DAYS : PROFESSOR_DUE_DAYS;
  }

  private computeDaysLate(dueAt: Date, today: Date): number {
    if (today.getTime() <= dueAt.getTime()) return 0;
    return Math.ceil((today.getTime() - dueAt.getTime()) / MS_PER_DAY);
  }

  private computeFee(daysLate: number): number {
    if (daysLate <= 0) return 0;
    if (daysLate <= FEE_TIER_1_DAYS) return daysLate * FEE_TIER_1_CENTS;
    return (
      FEE_TIER_1_DAYS * FEE_TIER_1_CENTS +
      (daysLate - FEE_TIER_1_DAYS) * FEE_TIER_2_CENTS
    );
  }
}
