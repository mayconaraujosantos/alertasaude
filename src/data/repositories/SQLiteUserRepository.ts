import { DatabaseManager } from '../../infrastructure/database/DatabaseManager';
import { UserEntity } from '../../domain/entities';
import { UserRepository } from '../../domain/repositories';

export class SQLiteUserRepository implements UserRepository {
  constructor(private db: DatabaseManager) {}

  async create(user: UserEntity): Promise<UserEntity> {
    try {
      const database = await this.db.getDatabase();
      const userData = user.toPersistence();

      const result = await database.runAsync(
        `INSERT INTO users (name, email, phone, birth_date, avatar_uri, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userData.name,
          userData.email || null,
          userData.phone || null,
          userData.birthDate || null,
          userData.avatarUri || null,
          userData.createdAt.toISOString(),
          userData.updatedAt.toISOString(),
        ],
      );

      const insertedId = result.lastInsertRowId;
      if (!insertedId) {
        throw new Error('Falha ao criar usuário');
      }

      return UserEntity.fromPersistence({
        ...userData,
        id: insertedId,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Falha ao criar usuário no banco de dados');
    }
  }

  async findById(id: number): Promise<UserEntity | null> {
    try {
      const database = await this.db.getDatabase();
      const result = await database.getFirstAsync(
        'SELECT * FROM users WHERE id = ? LIMIT 1',
        [id],
      );

      if (!result) {
        return null;
      }

      const userData = result as {
        id: number;
        name: string;
        email: string;
        phone: string;
        birth_date: string;
        avatar_uri: string;
        created_at: string;
        updated_at: string;
      };
      return UserEntity.fromPersistence({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        birthDate: userData.birth_date,
        avatarUri: userData.avatar_uri,
        createdAt: new Date(userData.created_at),
        updatedAt: new Date(userData.updated_at),
      });
    } catch (error) {
      console.error('Error finding user by id:', error);
      throw new Error('Falha ao buscar usuário por ID');
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      const database = await this.db.getDatabase();
      const result = await database.getFirstAsync(
        'SELECT * FROM users WHERE email = ? LIMIT 1',
        [email],
      );

      if (!result) {
        return null;
      }

      const userData = result as {
        id: number;
        name: string;
        email: string;
        phone: string;
        birth_date: string;
        avatar_uri: string;
        created_at: string;
        updated_at: string;
      };

      return UserEntity.fromPersistence({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        birthDate: userData.birth_date,
        avatarUri: userData.avatar_uri,
        createdAt: new Date(userData.created_at),
        updatedAt: new Date(userData.updated_at),
      });
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Falha ao buscar usuário por email');
    }
  }

  async update(user: UserEntity): Promise<UserEntity> {
    try {
      if (!user.id) {
        throw new Error('ID do usuário é obrigatório para atualização');
      }

      const database = await this.db.getDatabase();
      const userData = user.toPersistence();

      await database.runAsync(
        `UPDATE users SET 
         name = ?, email = ?, phone = ?, birth_date = ?, 
         avatar_uri = ?, updated_at = ?
         WHERE id = ?`,
        [
          userData.name,
          userData.email || null,
          userData.phone || null,
          userData.birthDate || null,
          userData.avatarUri || null,
          userData.updatedAt.toISOString(),
          user.id,
        ],
      );

      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Falha ao atualizar usuário no banco de dados');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const database = await this.db.getDatabase();
      await database.runAsync('DELETE FROM users WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Falha ao deletar usuário');
    }
  }

  async findAll(): Promise<UserEntity[]> {
    try {
      const database = await this.db.getDatabase();
      const rows = await database.getAllAsync(
        'SELECT * FROM users ORDER BY created_at DESC',
      );

      return (
        rows as {
          id: number;
          name: string;
          email: string;
          phone: string;
          birth_date: string;
          avatar_uri: string;
          created_at: string;
          updated_at: string;
        }[]
      ).map(userData =>
        UserEntity.fromPersistence({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          birthDate: userData.birth_date,
          avatarUri: userData.avatar_uri,
          createdAt: new Date(userData.created_at),
          updatedAt: new Date(userData.updated_at),
        }),
      );
    } catch (error) {
      console.error('Error finding all users:', error);
      throw new Error('Falha ao buscar todos os usuários');
    }
  }
}
