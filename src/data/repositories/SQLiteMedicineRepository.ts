import { MedicineEntity, Medicine } from '../../domain/entities';
import { MedicineRepository } from '../../domain/repositories';
import { DatabaseManager } from '../../infrastructure/database/DatabaseManager';

export class SQLiteMedicineRepository implements MedicineRepository {
  constructor(private databaseManager: DatabaseManager) {}

  async create(medicine: MedicineEntity): Promise<MedicineEntity> {
    console.log(
      '🔵 [SQLiteMedicineRepository] Iniciando criação de medicamento:',
      {
        name: medicine.name,
        description: medicine.description,
        dosage: medicine.dosage,
        quantidade: medicine.quantidade,
        unidade: medicine.unidade,
        forma: medicine.forma,
        imageUri: medicine.imageUri,
        createdAt: medicine.createdAt.toISOString(),
      },
    );

    try {
      const db = await this.databaseManager.getDatabase();
      console.log(
        '🔵 [SQLiteMedicineRepository] Database conectado com sucesso',
      );

      const insertParams = [
        medicine.name,
        medicine.description || null,
        medicine.dosage,
        medicine.quantidade || null,
        medicine.unidade || null,
        medicine.forma || null,
        medicine.imageUri || null,
        medicine.createdAt.toISOString(),
      ];

      console.log(
        '🔵 [SQLiteMedicineRepository] Parâmetros do INSERT:',
        insertParams,
      );

      const result = await db.runAsync(
        `INSERT INTO medicines (name, description, dosage, quantidade, unidade, forma, imageUri, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        insertParams,
      );

      console.log(
        '🟢 [SQLiteMedicineRepository] INSERT executado com sucesso:',
        {
          lastInsertRowId: result.lastInsertRowId,
          changes: result.changes,
        },
      );

      const medicineData: Medicine = {
        id: result.lastInsertRowId,
        name: medicine.name,
        description: medicine.description,
        dosage: medicine.dosage,
        quantidade: medicine.quantidade,
        unidade: medicine.unidade,
        forma: medicine.forma,
        imageUri: medicine.imageUri,
        createdAt: medicine.createdAt,
      };

      console.log(
        '🟢 [SQLiteMedicineRepository] Medicamento criado com sucesso:',
        medicineData,
      );
      return MedicineEntity.fromData(medicineData);
    } catch (error) {
      console.error(
        '🔴 [SQLiteMedicineRepository] Erro ao criar medicamento:',
        error,
      );
      console.error(
        '🔴 [SQLiteMedicineRepository] Dados do medicamento que falhou:',
        {
          name: medicine.name,
          description: medicine.description,
          dosage: medicine.dosage,
          quantidade: medicine.quantidade,
          unidade: medicine.unidade,
          forma: medicine.forma,
          imageUri: medicine.imageUri,
        },
      );
      throw error;
    }
  }

  async findById(id: number): Promise<MedicineEntity | null> {
    const db = await this.databaseManager.getDatabase();

    const result = (await db.getFirstAsync(
      'SELECT * FROM medicines WHERE id = ?',
      [id],
    )) as Medicine | null;

    return result ? MedicineEntity.fromData(result) : null;
  }

  async findByName(name: string): Promise<MedicineEntity[]> {
    const db = await this.databaseManager.getDatabase();

    const results = (await db.getAllAsync(
      'SELECT * FROM medicines WHERE name LIKE ? ORDER BY name ASC',
      [`%${name}%`],
    )) as Medicine[];

    return results.map(medicine => MedicineEntity.fromData(medicine));
  }

  async findActive(): Promise<MedicineEntity[]> {
    const db = await this.databaseManager.getDatabase();

    const results = (await db.getAllAsync(`
      SELECT DISTINCT m.* FROM medicines m
      INNER JOIN schedules s ON m.id = s.medicineId
      WHERE s.isActive = 1
      ORDER BY m.name ASC
    `)) as Medicine[];

    return results.map(medicine => MedicineEntity.fromData(medicine));
  }

  async update(medicine: MedicineEntity): Promise<MedicineEntity> {
    if (!medicine.id) {
      throw new Error('Medicine ID is required for update');
    }

    const db = await this.databaseManager.getDatabase();

    await db.runAsync(
      `UPDATE medicines 
       SET name = ?, description = ?, dosage = ?, quantidade = ?, unidade = ?, forma = ?, imageUri = ?
       WHERE id = ?`,
      [
        medicine.name,
        medicine.description || null,
        medicine.dosage,
        medicine.quantidade || null,
        medicine.unidade || null,
        medicine.forma || null,
        medicine.imageUri || null,
        medicine.id,
      ],
    );

    return medicine;
  }

  async delete(id: number): Promise<void> {
    const db = await this.databaseManager.getDatabase();

    await db.runAsync('DELETE FROM medicines WHERE id = ?', [id]);
  }

  async findAll(): Promise<MedicineEntity[]> {
    const db = await this.databaseManager.getDatabase();

    const results = (await db.getAllAsync(
      'SELECT * FROM medicines ORDER BY name ASC',
    )) as Medicine[];

    return results.map(medicine => MedicineEntity.fromData(medicine));
  }
}
