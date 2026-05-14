import { describe, it, expect } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { FEE_TIER_1_CENTS, LibraryService, PROFESSOR_LIMIT, STUDENT_LIMIT } from '../../src/lib/library';
import type { Book, Loan, Member, MemberStatus, ReturnReason, ReturnResult } from '../../src/lib/domain';
import type { LibraryRepository } from '../../src/lib/ports';

const today = new Date('2025-06-10T10:00:00Z');

// fixtures
const makeMember = (overrides: Partial<Member> = {}): Member => ({
  id: 'm1',
  name: 'Alice',
  type: 'student',
  ...overrides,
});

const makeBook = (overrides: Partial<Book> = {}): Book => ({
  id: 'b1',
  title: 'Clean Code',
  status: 'available',
  ...overrides,
});

// suite test
describe('LibraryService', () => {

  describe('metodo borrowBook', () => {
    it('permite student emprestar livro disponível com sucesso', () => {
      // Arrange
      const repo = mock<LibraryRepository>();
      repo.findMemberById.mockReturnValue(makeMember());
      repo.findBookById.mockReturnValue(makeBook());
      repo.findActiveLoansByMemberId.mockReturnValue([]);
      const service = new LibraryService(repo);

      // Act
      const result = service.borrowBook('m1', 'b1', today);

      // Assert
      expect(result.success).toBe(true);
      expect(result.loan?.memberId).toBe('m1');
      expect(result.loan?.bookId).toBe('b1');
    });

    it.each([
      {book_status: 'borrowed'}, 
      {book_status: 'maintenance'}]
    )('bloqueia empréstimo quando livro ja esta emprestado', (book_status) => {
      const repo = mock<LibraryRepository>();
      repo.findMemberById.mockReturnValue(makeMember({ id: 'm2', name: 'Bob' }));
      repo.findBookById.mockReturnValue(makeBook({ status: book_status }));
      const service = new LibraryService(repo);

      const result = service.borrowBook('m2', 'b1', today);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('BOOK_NOT_AVAILABLE');
    });

    it.each([
      { type: 'professor', activeLoansAmount: PROFESSOR_LIMIT },
      { type: 'student',   activeLoansAmount: STUDENT_LIMIT },
    ] as const)('$type não pode emprestar além de $activeLoansAmount livros', ({ type, activeLoansAmount }) => {
      const member = makeMember({ id: 'p1', type });
    
      const activeLoans: Loan[] = Array.from({ length: activeLoansAmount }, (_, i) => ({
        memberId: 'p1',
        bookId: `b${i + 1}`,
        borrowedAt: today,
        dueAt: new Date('2025-06-24T10:00:00Z'),
        returnedAt: null,
      }));
    
      const repo = mock<LibraryRepository>();
      repo.findMemberById.mockReturnValue(member);
      repo.findBookById.mockReturnValue(makeBook({ id: `b${activeLoansAmount + 1}` }));
      repo.findActiveLoansByMemberId.mockReturnValue(activeLoans);
      const service = new LibraryService(repo);
    
      const result = service.borrowBook('p1', `b${activeLoansAmount + 1}`, today);
    
      expect(result.success).toBe(false);
      expect(result.reason).toBe('LIMIT_REACHED');
    });

    it('impede emprestimo quando membro nao for encontrado', () => {
      const repo = mock<LibraryRepository>();
      repo.findMemberById.mockReturnValue(null);
      const service = new LibraryService(repo);

      const result = service.borrowBook('m2', 'b1', today);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('MEMBER_NOT_FOUND');
    });

    it('impede emprestimo quando livro nao for encontrado', () => {
      const repo = mock<LibraryRepository>();
      repo.findMemberById.mockReturnValue(makeMember({ id: 'm2', name: 'Bob' }));
      repo.findBookById.mockReturnValue(null);
      const service = new LibraryService(repo);

      const result = service.borrowBook('m2', 'b1', today);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('BOOK_NOT_FOUND');
    });

    it('impede emprestimo quando membro tiver algum emprestimo em atraso', () => {
      const loan: Loan = {
        memberId: 'm2',
        bookId: 'b atatinha',
        borrowedAt: new Date('2025-06-03T10:00:00Z'), 
        dueAt: new Date('2025-06-09T10:00:00Z'),
        returnedAt: null
      }
      const repo = mock<LibraryRepository>();
      repo.findMemberById.mockReturnValue(makeMember({ id: 'm2', name: 'Bob' }));
      repo.findBookById.mockReturnValue(makeBook({ status: 'available' }));
      repo.findActiveLoansByMemberId.mockReturnValue([loan])
      const service = new LibraryService(repo);

      const result = service.borrowBook('m2', 'b1', today);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('HAS_OVERDUE');
    });
  })

  describe('metodo returnBook', () => {
    
    it.each([
      { caso: 'no prazo',               returnAt: '2025-06-08T10:00:00Z', daysLate: 0, feeInCents: 0    },
      { caso: 'tier 1 (2 dias)',        returnAt: '2025-06-10T10:00:00Z', daysLate: 2, feeInCents: 400  },
      { caso: 'tier 1 limite (3 dias)', returnAt: '2025-06-11T10:00:00Z', daysLate: 3, feeInCents: 600  },
      { caso: 'tier 2 (5 dias)',        returnAt: '2025-06-13T10:00:00Z', daysLate: 5, feeInCents: 1600 },
    ])('calcula multa: $caso', ({ returnAt, daysLate, feeInCents }) => {
      const loan: Loan = {
        memberId: 'm1',
        bookId: 'b1',
        borrowedAt: new Date('2025-06-01T10:00:00Z'),
        dueAt: new Date('2025-06-08T10:00:00Z'),
        returnedAt: null,
      };
      const repo = mock<LibraryRepository>();
      repo.findActiveLoanByBookId.mockReturnValue(loan);
      repo.findBookById.mockReturnValue(makeBook());
      const service = new LibraryService(repo);

      const result: ReturnResult = service.returnBook('m1', 'b1', new Date(returnAt));

      expect(result.success).toBe(true);
      expect(result.daysLate).toBe(daysLate);
      expect(result.feeInCents).toBe(feeInCents);
    });

    it('calcula multa de 5 dias atrasado', () => {
      const loan: Loan = {
        memberId: 'm1',
        bookId: 'b1',
        borrowedAt: new Date('2025-06-01T10:00:00Z'),
        dueAt: new Date('2025-06-08T10:00:00Z'),
        returnedAt: null,
      };
      const repo = mock<LibraryRepository>();
      repo.findActiveLoanByBookId.mockReturnValue(loan);
      repo.findBookById.mockReturnValue(makeBook());
      const service = new LibraryService(repo);

      const result = service.returnBook(
        'm1',
        'b1',
        new Date('2025-06-13T10:00:00Z'),
      );

      expect(result.feeInCents).toBe(1600);
    });
    
    it('impede de retornar o livro quando o emprestimo nao foi encontrado', () => {
      const repo = mock<LibraryRepository>();
      repo.findActiveLoanByBookId.mockReturnValue(null);
      const service = new LibraryService(repo);

      const result = service.returnBook(
        'm1',
        'b1',
        new Date('2025-06-13T10:00:00Z'),
      );

      expect(result.success).toBe(false);
      expect(result.reason).toBe('LOAN_NOT_FOUND');
    })

    it('impede de retornar o livro o membro passado no metodo nao eh de fato quem emprestou tal livro', () => {
      const loan: Loan = {
        memberId: 'm1',
        bookId: 'b1',
        borrowedAt: new Date('2025-06-01T10:00:00Z'),
        dueAt: new Date('2025-06-08T10:00:00Z'),
        returnedAt: null,
      };
      const repo = mock<LibraryRepository>();
      repo.findActiveLoanByBookId.mockReturnValue(loan);
      const service = new LibraryService(repo);

      const result = service.returnBook(
        'm acaco',
        'b1',
        new Date('2025-06-13T10:00:00Z'),
      );

      expect(result.success).toBe(false);
      expect(result.reason).toBe('NOT_BORROWER');
    })
  })


  describe('metodo getMemberStatus', () => {
    it('getMemberStatus retorna o MemberStatus com sucesso', () => {
      const repo = mock<LibraryRepository>();
      repo.findMemberById.mockReturnValue(makeMember());
      repo.findActiveLoansByMemberId.mockReturnValue([]);
      const service = new LibraryService(repo);

      const actual = service.getMemberStatus('m1', today);

      const expected: MemberStatus = {
        activeLoans: 0,
        overdueLoans: 0,
        remainingSlots: STUDENT_LIMIT,
        canBorrow: true
      }

      expect(actual).toEqual(expected)
    });

    it('getMemberStatus para membro inexistente', () => {
      const repo = mock<LibraryRepository>();
      repo.findMemberById.mockReturnValue(null);
      const service = new LibraryService(repo);

      expect(() => service.getMemberStatus('m999', today)).toThrow(expect.objectContaining({ code: 'MEMBER_NOT_FOUND' }));
    });
  })
});
