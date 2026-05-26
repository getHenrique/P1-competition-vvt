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
  describe('Método borrowBook()', () => {

    it.each([{type: 'student', dueDaysInMs: 7 * 24 * 60 * 60 * 1000}, {type: 'professor', dueDaysInMs: 14 * 24 * 60 * 60 * 1000}] as {type: 'student' | 'professor', dueDaysInMs: number}[])
    ('Permite $type emprestar livro disponível', ({ type, dueDaysInMs }) => {//OK - Passou
      
      //Arrange
      const repo = mock<LibraryRepository>();
      repo.findMemberById.mockReturnValue(makeMember({type: type}));//Mock student
      repo.findBookById.mockReturnValue(makeBook());//Mock book
      repo.findActiveLoansByMemberId.mockReturnValue([]);//Mock active loans for student
      const service = new LibraryService(repo);

      //Act
      const result = service.borrowBook('m1', 'b1', today);

      //Assert
      expect(result.success).toBe(true);
      expect(result.loan?.borrowedAt).toStrictEqual(today);
      expect(result.loan?.dueAt).toStrictEqual(new Date(today.getTime() + dueDaysInMs));
      expect(result.loan?.memberId).toBe('m1');
      expect(result.loan?.bookId).toBe('b1');
      expect(repo.findBookById('b1')?.status).toBe('borrowed');

    });
    
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

    it.each([{type: 'student'}, {type: 'professor'}] as {type: 'student' | 'professor'}[])
    ('$type tenta emprestar livro que não existe', ({type}) => {//NOVO - Passou

      //Arrange
      const repo = mock<LibraryRepository>();
      repo.findMemberById.mockReturnValue(makeMember({type: type}));
      repo.findBookById.mockReturnValue(null);//Mock book not found
      const service = new LibraryService(repo);

      //Act
      const result = service.borrowBook('m1', 'b0', today);

      //Assert
      expect(result.success).toBe(false);
      expect(result.reason).toBe('BOOK_NOT_FOUND');

    });

    it.each([{bookStatus: 'maintenance'}, {bookStatus: 'borrowed'}] as {bookStatus: 'maintenance' | 'borrowed'}[])
    ('Bloqueia empréstimo quando livro tem status $bookStatus', ({bookStatus}) => {//OK - Passou

      //Arrange
      const repo = mock<LibraryRepository>();
      repo.findMemberById.mockReturnValue(makeMember({ id: 'm2', name: 'Bob' }));//Mock student
      repo.findBookById.mockReturnValue(makeBook({ status: bookStatus }));//Mock
      const service = new LibraryService(repo);

      //Act
      const result = service.borrowBook('m2', 'b1', today);

      //Assert
      expect(result.success).toBe(false);
      expect(result.reason).toBe('BOOK_NOT_AVAILABLE');

    });

    it.each([{type: 'student', dueDate: new Date('2025-05-10T10:00:00Z')}, {type: 'professor', dueDate: new Date('2025-05-20T10:00:00Z')}] as {type: 'student' | 'professor', dueDate: Date}[])
    ('$type com algum overdue Tenta emprestar livro', ({type, dueDate}) => {//NOVO - Passou

      //Arrange
      const repo = mock<LibraryRepository>();
      repo.findMemberById.mockReturnValue(makeMember({ type: type }));//Mock student
      repo.findBookById.mockReturnValue(makeBook());//Mock book
      const overdueLoan: Loan = {
        memberId: 'm1',
        bookId: 'b1',
        borrowedAt: new Date('2025-05-01T10:00:00Z'),
        dueAt: dueDate,
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

    it.each([{type: 'student', loans: [
        { memberId: 's1', bookId: 'b1', borrowedAt: today, dueAt: new Date('2025-06-24T10:00:00Z'), returnedAt: null },
        { memberId: 's1', bookId: 'b2', borrowedAt: today, dueAt: new Date('2025-06-24T10:00:00Z'), returnedAt: null },
        { memberId: 's1', bookId: 'b3', borrowedAt: today, dueAt: new Date('2025-06-24T10:00:00Z'), returnedAt: null },
      ]}, 
      {type: 'professor', loans: [
        { memberId: 's1', bookId: 'b2', borrowedAt: today, dueAt: new Date('2025-06-24T10:00:00Z'), returnedAt: null },
        { memberId: 's1', bookId: 'b1', borrowedAt: today, dueAt: new Date('2025-06-24T10:00:00Z'), returnedAt: null },
        { memberId: 's1', bookId: 'b3', borrowedAt: today, dueAt: new Date('2025-06-24T10:00:00Z'), returnedAt: null },
        { memberId: 's1', bookId: 'b4', borrowedAt: today, dueAt: new Date('2025-06-24T10:00:00Z'), returnedAt: null },
        { memberId: 's1', bookId: 'b5', borrowedAt: today, dueAt: new Date('2025-06-24T10:00:00Z'), returnedAt: null },
      ]}] as {type: 'student' | 'professor', loans: Loan[]}[] )
    ('Bloqueia empréstimo para $type (tentativa de emprestar mais de $loans.length livros simultâneos)', ({type, loans}) => {//OK - Passou

      //Arrange
      const member = makeMember({ id: 's1', type: type });
      const activeLoans: Loan[] = loans;
      const repo = mock<LibraryRepository>()
      repo.findMemberById.mockReturnValue(member);//Mock member
      repo.findBookById.mockReturnValue(makeBook({ id: 'b4' }));//Mock book
      repo.findActiveLoansByMemberId.mockReturnValue(activeLoans);//Mock active loans for professor
      const service = new LibraryService(repo);

      //Act
      const result = service.borrowBook('s1', 'b4', today);

      //Assert
      expect(result.success).toBe(false);
      expect(result.reason).toBe('LIMIT_REACHED');

    });
  });

  /**===================================================================
   * returnBook()
   ===================================================================*/
  describe('Método returnBook()', () => {

    it.each([{dueDate: new Date('2025-06-05T10:00:00Z')}, {dueDate: new Date('2025-06-10T10:00:00Z')}] as {dueDate: Date}[])
    ('Retorno, $dueDate, antes da data de vencimento tem tarifa de 0 centavos', ({dueDate}) => {//NOVO - Passou
      
      //Arrange
      const loan: Loan = {
        memberId: 'm1',
        bookId: 'b1',
        borrowedAt: new Date('2025-06-01T10:00:00Z'),
        dueAt: new Date('2025-06-10T10:00:00Z'),
        returnedAt: null,
      };
      const repo = mock<LibraryRepository>()
      repo.findActiveLoanByBookId.mockReturnValue(loan);//Mock loan
      repo.findBookById.mockReturnValue(makeBook());//Mock book
      const service = new LibraryService(repo);

      //Act
      const result = service.returnBook(
        'm1',
        'b1',
        dueDate,//0 dias de atraso
      );

      //Assert
      expect(result.success).toBe(true);
      expect(result.daysLate).toBe(0);
      expect(result.feeInCents).toBe(0);

    });
    
    it('Ao retornar empréstimo, calcula multa de 2 dias atrasado', () => {//OK - Passou
      // elegivel a teste parametrico
      //Arrange
      const loan: Loan = {
        memberId: 'm1',
        bookId: 'b1',
        borrowedAt: new Date('2025-06-01T10:00:00Z'),
        dueAt: new Date('2025-06-08T10:00:00Z'),
        returnedAt: null,
      };
      const repo = mock<LibraryRepository>()
      repo.findActiveLoanByBookId.mockReturnValue(loan);//Mock loan
      repo.findBookById.mockReturnValue(makeBook());//Mock book
      const service = new LibraryService(repo);

      //Act
      const result = service.returnBook(
        'm1',
        'b1',
        new Date('2025-06-10T10:00:00Z'),//2 dias de atraso
      );

      //Assert
      expect(result.success).toBe(true);
      expect(result.daysLate).toBe(2);
      expect(result.feeInCents).toBe(400);//2 * 200 = 400

    });

    it('Ao retornar empréstimo, calcula multa de 5 dias atrasado', () => {//CORRIGIDO - Passou

      //Arrange
      const loan: Loan = {
        memberId: 'm1',
        bookId: 'b1',
        borrowedAt: new Date('2025-06-01T10:00:00Z'),
        dueAt: new Date('2025-06-08T10:00:00Z'),
        returnedAt: null,
      };
      const repo = mock<LibraryRepository>()
      repo.findActiveLoanByBookId.mockReturnValue(loan);//Mock loan
      repo.findBookById.mockReturnValue(makeBook());//Mock book
      const service = new LibraryService(repo);

      //Act
      const result = service.returnBook(
        'm1',
        'b1',
        new Date('2025-06-13T10:00:00Z'),//5 dias de atraso
      );

      //Assert
      expect(result.feeInCents).toBe(1600);//3 * 200 + 2 * 500 = 1600

    });

    it('Ao não encontrar empréstimo feito por membro ao tentar retornar livro, devolve razão \'NOT_BORROWER\'', () => {//NOVO - Passou
          
      //Arrange
      const loan: Loan = {
        memberId: 'm1',
        bookId: 'b1',
        borrowedAt: new Date('2025-06-01T10:00:00Z'),
        dueAt: new Date('2025-06-08T10:00:00Z'),
        returnedAt: null,
      };
      const repo = mock<LibraryRepository>()
      repo.findActiveLoanByBookId.mockReturnValue(loan);//Mock loan
      repo.findBookById.mockReturnValue(makeBook());//Mock book
      const service = new LibraryService(repo);

      //Act
      const result = service.returnBook(
        'm2',
        'b1',
        new Date('2025-06-13T10:00:00Z'),//5 dias de atraso
      );

      //Assert
      expect(result.reason).toBe('NOT_BORROWER');
      expect(result.success).toBe(false);
      expect(result.feeInCents).toBe(0);
      expect(result.daysLate).toBe(0);

    });

    it('Ao não encontrar empréstimo algum do livro ao tentar retorná-lo, retora a razão \'LOAN_NOT_FOUND\'', () => {//NOVO - Passou

      //Arrange
      const repo = mock<LibraryRepository>()
      repo.findBookById.mockReturnValue(makeBook());//Mock book
      const service = new LibraryService(repo);

      //Act
      const result = service.returnBook(
        'm2',
        'b1',
        new Date('2025-06-13T10:00:00Z'),//5 dias de atraso
      );

      //Assert
      expect(result.reason).toBe('LOAN_NOT_FOUND');
      expect(result.success).toBe(false);
      expect(result.feeInCents).toBe(0);
      expect(result.daysLate).toBe(0);

    });

  });  

  /**===================================================================
   * getMemberStatus()
   ===================================================================*/
  describe('Método getMemberStatus()', () => {
    
    it('Busca status de um membro e o retorna com sucesso', () => {//NOVO - Falhou
          
      //Arrange
      const repo = mock<LibraryRepository>()
      repo.findMemberById.mockReturnValue(makeMember());//Mock member
      repo.findActiveLoansByMemberId.mockReturnValue([]);//Mock active loans for member
      const service = new LibraryService(repo);

      //Act
      const status = service.getMemberStatus('m1', today);

      //Assert
      expect(status.activeLoans).toBe(0);
      expect(status.overdueLoans).toBe(0);
      expect(status.remainingSlots).toBe(3);
      expect(status.canBorrow).toBe(true);

    });
    
    it('Buscar status de membro inexistente lança erro', () => {//CORRIGIDO - Passou

        //Arrange
      const repo = mock<LibraryRepository>()
      repo.findMemberById.mockReturnValue(null);//Mock null member
      const service = new LibraryService(repo);

      //Act
      const status = () => service.getMemberStatus('m999', today);

      //Assert
      expect(status).toThrow('MEMBER_NOT_FOUND');

    });
  
  });

});