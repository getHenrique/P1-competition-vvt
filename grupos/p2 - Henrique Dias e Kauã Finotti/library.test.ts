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

     it('Com inputs válidos, borrowBook não lança erros', () => {// INCOMPLETO

    //Arrange
    const repo = mock<LibraryRepository>();
    repo.findMemberById.mockReturnValue(makeMember());
    repo.findBookById.mockReturnValue(makeBook());
    repo.findActiveLoansByMemberId.mockReturnValue([]);
    const service = new LibraryService(repo);

    //Act

    //Assert
    expect(() => service.borrowBook('m1', 'b1', today)).not.toThrow();

  });

  it('Permite estudante emprestar livro disponível', () => {//OK - Passou
    
    //Arrange
    const repo = mock<LibraryRepository>();
    repo.findMemberById.mockReturnValue(makeMember());//Mock student
    repo.findBookById.mockReturnValue(makeBook());//Mock book
    repo.findActiveLoansByMemberId.mockReturnValue([]);//Mock active loans for student
    const service = new LibraryService(repo);

    //Act
    const result = service.borrowBook('m1', 'b1', today);

    //Assert
    expect(result.success).toBe(true);
    expect(result.loan?.memberId).toBe('m1');
    expect(result.loan?.bookId).toBe('b1');

  });

  it('Bloqueia empréstimo quando livro tem status \'borrowed\'', () => {//OK - Passou

    //Arrange
    const repo = mock<LibraryRepository>();
    repo.findMemberById.mockReturnValue(makeMember({ id: 'm2', name: 'Bob' }));//Mock student
    repo.findBookById.mockReturnValue(makeBook({ status: 'borrowed' }));//Mock
    const service = new LibraryService(repo);

    //Act
    const result = service.borrowBook('m2', 'b1', today);

    //Assert
    expect(result.success).toBe(false);
    expect(result.reason).toBe('BOOK_NOT_AVAILABLE');

  });

  //Bloqueia empréstimo quando livro tem status \'borrowed\'

  it('retorna algo ao emprestar', () => {//MORTO - EXCLUIR

    //Arrange
    const repo = mock<LibraryRepository>();
    repo.findMemberById.mockReturnValue(makeMember());
    repo.findBookById.mockReturnValue(makeBook());
    repo.findActiveLoansByMemberId.mockReturnValue([]);
    const service = new LibraryService(repo);

    //Act
    const result = service.borrowBook('m1', 'b1', today);

    //Assert
    expect(result).toBeDefined();

  });

  // Bloqueia empréstimo para aluno (tentativa de emprestar mais de 3 livros simultâneos)
  
  it('Bloqueia empréstimo para professor (tentativa de emprestar mais de 3 livros simultâneos)', () => {//INCORRETO - Professor pode emprestar até 5 livros

    //Arrange
    const prof = makeMember({ id: 'p1', type: 'professor' });
    const activeLoans: Loan[] = [
      { memberId: 'p1', bookId: 'b1', borrowedAt: today, dueAt: new Date('2025-06-24T10:00:00Z'), returnedAt: null },
      { memberId: 'p1', bookId: 'b2', borrowedAt: today, dueAt: new Date('2025-06-24T10:00:00Z'), returnedAt: null },
      { memberId: 'p1', bookId: 'b3', borrowedAt: today, dueAt: new Date('2025-06-24T10:00:00Z'), returnedAt: null },
    ];
    const repo = mock<LibraryRepository>();
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


  /**===================================================================
   * returnBook()
   ===================================================================*/

//multa para 0 dias

  it('Calcula multa de 2 dias atrasado para student', () => {//OK - Passou
    
    //Arrange
    const loan: Loan = {
      memberId: 'm1',
      bookId: 'b1',
      borrowedAt: new Date('2025-06-01T10:00:00Z'),
      dueAt: new Date('2025-06-08T10:00:00Z'),
      returnedAt: null,
    };
    const repo = mock<LibraryRepository>();
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

  //multas para -1, 1, 3 e 4 dias

  it('returnBook calcula multa', () => {//INCOMPLETO - INÚTIL

    //Arrange
    const service = mock<LibraryService>();
    service.returnBook.mockReturnValue({
      success: true,
      feeInCents: 999,
      daysLate: 5,
    });

    //Assert
    expect(service.returnBook('m1', 'b1', today).feeInCents).toBe(999);
    
  });

  it('calcula multa de 5 dias atrasado', () => {//INCORRETO

    //Arrange
    const loan: Loan = {
      memberId: 'm1',
      bookId: 'b1',
      borrowedAt: new Date('2025-06-01T10:00:00Z'),
      dueAt: new Date('2025-06-08T10:00:00Z'),
      returnedAt: null,
    };
    const repo = mock<LibraryRepository>();
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
    expect(result.feeInCents).toBe(1000);//3 * 200 + 2 * 500 = 1600

  });

  /**===================================================================
   * getMemberStatus()
   ===================================================================*/

  it('getMemberStatus retorna um objeto', () => {//OK, ÚTIL?

    //Arrange
    const repo = mock<LibraryRepository>();
    repo.findMemberById.mockReturnValue(makeMember());
    repo.findActiveLoansByMemberId.mockReturnValue([]);
    const service = new LibraryService(repo);

    //Act
    const status = service.getMemberStatus('m1', today);

    //Assert
    expect(typeof status).toBe('object');

  });

  it('canBorrow é booleano', () => {//OK, ÚTIL? NÃO

    //Arrage
    const repo = mock<LibraryRepository>();
    repo.findMemberById.mockReturnValue(makeMember());
    repo.findActiveLoansByMemberId.mockReturnValue([]);
    const service = new LibraryService(repo);

    //Act
    const status = service.getMemberStatus('m1', today);

    //Assert
    expect(typeof status.canBorrow).toBe('boolean');

  });

  it('getMemberStatus para membro inexistente', () => {//INCORRETO

    //Arrange
    const repo = mock<LibraryRepository>();
    repo.findMemberById.mockReturnValue(null);//Mock null member
    const service = new LibraryService(repo);

    //Act
    const status = service.getMemberStatus('m999', today);

    //Assert
    expect(status.activeLoans).toBe(0);

  });

  /**===================================================================
   * getlimit()
   ===================================================================*/
  /**===================================================================
   * getDueDays()
   ===================================================================*/
  /**===================================================================
   * computeDaysLate()
   ===================================================================*/
  /**===================================================================
   * computeFee()
   ===================================================================*/

});