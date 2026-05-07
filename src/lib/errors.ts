export type LibraryErrorCode = 'MEMBER_NOT_FOUND';

export class LibraryError extends Error {
  constructor(
    public readonly code: LibraryErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'LibraryError';
  }
}
