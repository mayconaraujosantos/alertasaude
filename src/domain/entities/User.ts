export interface User {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  avatarUri?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserEntity {
  constructor(
    public readonly id: number | undefined,
    public readonly name: string,
    public readonly email: string | undefined,
    public readonly phone: string | undefined,
    public readonly birthDate: string | undefined,
    public readonly avatarUri: string | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  ): UserEntity {
    const now = new Date();
    return new UserEntity(
      undefined,
      data.name,
      data.email,
      data.phone,
      data.birthDate,
      data.avatarUri,
      now,
      now,
    );
  }

  static fromPersistence(data: User): UserEntity {
    return new UserEntity(
      data.id,
      data.name,
      data.email,
      data.phone,
      data.birthDate,
      data.avatarUri,
      typeof data.createdAt === 'string'
        ? new Date(data.createdAt)
        : data.createdAt,
      typeof data.updatedAt === 'string'
        ? new Date(data.updatedAt)
        : data.updatedAt,
    );
  }

  toPersistence(): User {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      birthDate: this.birthDate,
      avatarUri: this.avatarUri,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  updateProfile(
    name?: string,
    email?: string,
    phone?: string,
    birthDate?: string,
    avatarUri?: string,
  ): UserEntity {
    return new UserEntity(
      this.id,
      name ?? this.name,
      email ?? this.email,
      phone ?? this.phone,
      birthDate ?? this.birthDate,
      avatarUri ?? this.avatarUri,
      this.createdAt,
      new Date(),
    );
  }

  getInitials(): string {
    return this.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  isValidEmail(): boolean {
    if (!this.email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }
}
