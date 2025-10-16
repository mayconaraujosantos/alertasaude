import { UserEntity } from '../entities';

export interface UserRepository {
  create(user: UserEntity): Promise<UserEntity>;
  findById(id: number): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  update(user: UserEntity): Promise<UserEntity>;
  delete(id: number): Promise<void>;
  findAll(): Promise<UserEntity[]>;
}
