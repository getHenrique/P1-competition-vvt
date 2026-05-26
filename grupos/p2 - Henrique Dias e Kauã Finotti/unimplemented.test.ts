import { describe, it, expect } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { LibraryService } from '../../src/lib/library';
import type { Book, Loan, Member } from '../../src/lib/domain';
import type { LibraryRepository } from '../../src/lib/ports';

const today = new Date('2025-06-10T10:00:00Z');

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

describe('LibraryService', () => {
  
  /**===================================================================
   * borrowBook()
   ===================================================================*/

  it('Membro inexistente tenta emprestar livro', () => {//NOVO - Passou

    //Arrange
    const repo = mock<LibraryRepository>();
    repo.findMemberById.mockReturnValue(null);//Mock member not found
    repo.findBookById.mockReturnValue(makeBook());//Mock book
    const service = new LibraryService(repo);

    //Act
    const result = service.borrowBook('nonexistent_member', 'b1', today);

    //Assert
    expect(result.success).toBe(false);
    expect(result.reason).toBe('MEMBER_NOT_FOUND');

  });

  it('Membro tenta emprestar livro que não existe', () => {//NOVO - Passou

    //Arrange
    const repo = mock<LibraryRepository>();
    repo.findMemberById.mockReturnValue(makeMember());//Mock student
    repo.findBookById.mockReturnValue(null);//Mock book not found
    const service = new LibraryService(repo);

    //Act
    const result = service.borrowBook('m1', 'b0', today);

    //Assert
    expect(result.success).toBe(false);
    expect(result.reason).toBe('BOOK_NOT_FOUND');

  });

  it('Membro com algum overdue Tenta emprestar livro', () => {//NOVO - Passou

    //Arrange
    const repo = mock<LibraryRepository>();
    repo.findMemberById.mockReturnValue(makeMember());//Mock student
    repo.findBookById.mockReturnValue(makeBook());//Mock book
    const overdueLoan: Loan = {
      memberId: 'm1',
      bookId: 'b1',
      borrowedAt: new Date('2025-05-01T10:00:00Z'),
      dueAt: new Date('2025-05-08T10:00:00Z'),
      returnedAt: null,
    };
    repo.findActiveLoansByMemberId.mockReturnValue([overdueLoan]);//Mock active loans with one overdue
    const service = new LibraryService(repo);

    //Act
    const result = service.borrowBook('m1', 'b1', today);

    //Assert
    expect(result.success).toBe(false);
    expect(result.reason).toBe('HAS_OVERDUE');

  });

  it('Bloqueia empréstimo quando livro tem status \'maintenance\'', () =>{//NOVO - Passou
    //elegivel para teste parametrico(available, maintenance ou borrowed)

    //Arrange
    const repo = mock<LibraryRepository>();
    repo.findMemberById.mockReturnValue(makeMember({ id: 'm2', name: 'Bob' }));//Mock student
    repo.findBookById.mockReturnValue(makeBook({ status: 'maintenance' }));//Mock
    const service = new LibraryService(repo);

    //Act
    const result = service.borrowBook('m2', 'b1', today);

    //Assert
    expect(result.success).toBe(false);
    expect(result.reason).toBe('BOOK_NOT_AVAILABLE');

  });

  it('Bloqueia empréstimo para aluno (tentativa de emprestar mais de 3 livros simultâneos)', () => {//NOVO - Passou
    //elegivel para teste parametrico (student ou professor)

    //Arrange
    const student = makeMember({ id: 's1', type: 'student' });
    const activeLoans: Loan[] = [
      { memberId: 's1', bookId: 'b1', borrowedAt: today, dueAt: new Date('2025-06-24T10:00:00Z'), returnedAt: null },
      { memberId: 's1', bookId: 'b2', borrowedAt: today, dueAt: new Date('2025-06-24T10:00:00Z'), returnedAt: null },
      { memberId: 's1', bookId: 'b3', borrowedAt: today, dueAt: new Date('2025-06-24T10:00:00Z'), returnedAt: null },
      { memberId: 's1', bookId: 'b4', borrowedAt: today, dueAt: new Date('2025-06-24T10:00:00Z'), returnedAt: null },
      { memberId: 's1', bookId: 'b5', borrowedAt: today, dueAt: new Date('2025-06-24T10:00:00Z'), returnedAt: null },
    ];
    const repo = mock<LibraryRepository>()
    repo.findMemberById.mockReturnValue(student);//Mock student
    repo.findBookById.mockReturnValue(makeBook({ id: 'b4' }));//Mock book
    repo.findActiveLoansByMemberId.mockReturnValue(activeLoans);//Mock active loans for professor
    const service = new LibraryService(repo);

    //Act
    const result = service.borrowBook('p1', 'b4', today);

    //Assert
    expect(result.success).toBe(false);
    expect(result.reason).toBe('LIMIT_REACHED');

  });
});
/*
    it('Permite professor emprestar livro disponível', () => {//NOVO - Passou
      //elegivel para teste parametrico (student ou professor)
      //Arrange
      const fourteenDaysInMs = 14 * 24 * 60 * 60 * 1000;
      const prof = makeMember({ id: 'p1', type: 'professor' });
      const repo = mock<LibraryRepository>();
      repo.findMemberById.mockReturnValue(prof);//Mock professor
      repo.findBookById.mockReturnValue(makeBook());//Mock book
      repo.findActiveLoansByMemberId.mockReturnValue([]);//Mock active loans for student
      const service = new LibraryService(repo);

      //Act
      const result = service.borrowBook('m1', 'b1', today);

      //Assert
      expect(result.success).toBe(true);
      expect(result.loan?.borrowedAt).toStrictEqual(today);
      expect(result.loan?.dueAt).toStrictEqual(new Date(today.getTime() + fourteenDaysInMs));
      expect(result.loan?.memberId).toBe('m1');
      expect(result.loan?.bookId).toBe('b1');
      expect(repo.findBookById('b1')?.status).toBe('borrowed');

    });
     */

    /*
        it('Bloqueia empréstimo para professor (tentativa de emprestar mais de 5 livros simultâneos)', () => {//CORRIGIDO - Passou
          //elegivel para teste parametrico (student ou professor)
    
          //Arrange
          const prof = makeMember({ id: 'p1', type: 'professor' });
          const activeLoans: Loan[] = [
            { memberId: 'p1', bookId: 'b1', borrowedAt: today, dueAt: new Date('2025-06-24T10:00:00Z'), returnedAt: null },
            { memberId: 'p1', bookId: 'b2', borrowedAt: today, dueAt: new Date('2025-06-24T10:00:00Z'), returnedAt: null },
            { memberId: 'p1', bookId: 'b3', borrowedAt: today, dueAt: new Date('2025-06-24T10:00:00Z'), returnedAt: null },
            { memberId: 'p1', bookId: 'b4', borrowedAt: today, dueAt: new Date('2025-06-24T10:00:00Z'), returnedAt: null },
            { memberId: 'p1', bookId: 'b5', borrowedAt: today, dueAt: new Date('2025-06-24T10:00:00Z'), returnedAt: null },
          ];
          const repo = mock<LibraryRepository>()
          repo.findMemberById.mockReturnValue(prof);//Mock professor
          repo.findBookById.mockReturnValue(makeBook({ id: 'b4' }));//Mock book
          repo.findActiveLoansByMemberId.mockReturnValue(activeLoans);//Mock active loans for professor
          const service = new LibraryService(repo);
    
          //Act
          const result = service.borrowBook('p1', 'b4', today);
    
          //Assert
          expect(result.success).toBe(false);
          expect(result.reason).toBe('LIMIT_REACHED');
    
        });
        */