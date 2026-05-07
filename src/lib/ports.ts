import type { Book, Loan, Member } from './domain';

export interface LibraryRepository {
  findMemberById(id: string): Member | null;

  findBookById(id: string): Book | null;
  saveBook(book: Book): void;

  findActiveLoansByMemberId(memberId: string): Loan[];
  findActiveLoanByBookId(bookId: string): Loan | null;
  saveLoan(loan: Loan): void;
}
