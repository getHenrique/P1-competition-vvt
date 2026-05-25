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

  it('Permite estudante emprestar livro disponível', () => {//OK - Passou
    
    //Arrange
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const repo = mock<LibraryRepository>();
    repo.findMemberById.mockReturnValue(makeMember());//Mock student
    repo.findBookById.mockReturnValue(makeBook());//Mock book
    repo.findActiveLoansByMemberId.mockReturnValue([]);//Mock active loans for student
    const service = new LibraryService(repo);

    //Act
    const result = service.borrowBook('m1', 'b1', today);

    //Assert
    expect(result.success).toBe(true);
    expect(result.loan?.borrowedAt).toStrictEqual(today);
    expect(result.loan?.dueAt).toStrictEqual(new Date(today.getTime() + sevenDaysInMs));
    expect(result.loan?.memberId).toBe('m1');
    expect(result.loan?.bookId).toBe('b1');
    expect(repo.findBookById('b1')?.status).toBe('borrowed');

  });

  it('Permite professor emprestar livro disponível', () => {//NOVO
    
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

  it('Membro inexistente tenta emprestar livro', () => {

    //Arrange

    //Act

    //Assert

  });

  it('Membro tenta emprestar livro que não existe', () => {

    //Arrange

    //Act

    //Assert

  });

  it('Membro com algum overdue Tenta emprestar livro', () => {

    //Arrange

    //Act

    //Assert

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

  it('Bloqueia empréstimo quando livro tem status \'maintenance\'', () =>{//NOVO

    //Arrange

    //Act

    //Assert

  });

  it('Bloqueia empréstimo para aluno (tentativa de emprestar mais de 3 livros simultâneos)', () => {//NOVO

    //Arrange

    //Act

    //Assert

  });
  
  it('Bloqueia empréstimo para professor (tentativa de emprestar mais de 3 livros simultâneos)', () => {//CORRIGIDO - Passou

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

  /**===================================================================
   * returnBook()
   ===================================================================*/

//Estes testes só mudam a quantidade de dias de atraso, podemos fazê-los paramétricos? Como?

  it('Multa para 0 dias de atraso de empréstimo tem valor de 0 centavos', () => {
    
    //Arrange

    //Act

    //Assert

  });

  it('Ao retornar empréstimo, calcula multa de 2 dias atrasado', () => {//OK - Passou
    
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

  it('Não encontra empréstimo de livro por membro tentando retornar', () => {
        
    //Arrange

    //Act

    //Assert

  });

  it('Não encontra empréstimo algum do livro ao tentar retornar', () => {

  });

  /**===================================================================
   * getMemberStatus()
   ===================================================================*/

  it('Busca status de um membro', () => {
        
    //Arrange

    //Act

    //Assert

  })

  it('Buscar status de membro inexistente lança erro', () => {//CORRIGIDO - Passou

    //Arrange
    const repo = mock<LibraryRepository>()
    repo.findMemberById.mockReturnValue(null);//Mock null member
    const service = new LibraryService(repo);

    //Act
    const status = () => service.getMemberStatus('m999', today);

    //Assert
    expect(status).toThrow();

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