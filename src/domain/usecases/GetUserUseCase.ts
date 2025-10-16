import { UserEntity } from '../entities';
import { UserRepository } from '../repositories';

export class GetUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(id: number): Promise<UserEntity | null> {
    try {
      const user = await this.userRepository.findById(id);

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      throw new Error('Falha ao carregar dados do usuário');
    }
  }

  async getByEmail(email: string): Promise<UserEntity | null> {
    try {
      return await this.userRepository.findByEmail(email);
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw new Error('Falha ao buscar usuário por email');
    }
  }

  async getCurrentUser(): Promise<UserEntity | null> {
    try {
      // For now, we'll get the first user as the current user
      // In a real app, this would be based on authentication
      const users = await this.userRepository.findAll();
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw new Error('Falha ao carregar usuário atual');
    }
  }
}
