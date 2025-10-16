import { UserEntity } from '../entities';
import { UserRepository } from '../repositories';

export class UpdateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(
    id: number,
    name?: string,
    email?: string,
    phone?: string,
    birthDate?: string,
    avatarUri?: string,
  ): Promise<UserEntity> {
    try {
      // Get current user
      const currentUser = await this.userRepository.findById(id);
      if (!currentUser) {
        throw new Error('Usuário não encontrado');
      }

      // Validate email format if provided
      if (email && email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error('Formato de email inválido');
        }

        // Check if email is already taken by another user
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser && existingUser.id !== id) {
          throw new Error('Este email já está sendo usado por outro usuário');
        }
      }

      // Validate name
      if (name && name.trim().length < 2) {
        throw new Error('Nome deve ter pelo menos 2 caracteres');
      }

      // Update user profile
      const updatedUser = currentUser.updateProfile(
        name?.trim(),
        email?.trim(),
        phone?.trim(),
        birthDate?.trim(),
        avatarUri,
      );

      // Save to repository
      return await this.userRepository.update(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Falha ao atualizar perfil do usuário');
    }
  }

  async updateAvatar(id: number, avatarUri: string): Promise<UserEntity> {
    try {
      const currentUser = await this.userRepository.findById(id);
      if (!currentUser) {
        throw new Error('Usuário não encontrado');
      }

      const updatedUser = currentUser.updateProfile(
        undefined,
        undefined,
        undefined,
        undefined,
        avatarUri,
      );

      return await this.userRepository.update(updatedUser);
    } catch (error) {
      console.error('Error updating avatar:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Falha ao atualizar foto do perfil');
    }
  }
}
