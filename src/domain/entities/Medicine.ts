export interface Medicine {
  id?: number;
  name: string;
  description?: string;
  dosage: string;
  quantidade?: string;
  unidade?: string;
  forma?: string;
  imageUri?: string;
  createdAt: Date;
}

export class MedicineEntity {
  constructor(
    public readonly id: number | undefined,
    public readonly name: string,
    public readonly description: string | undefined,
    public readonly dosage: string,
    public readonly quantidade: string | undefined,
    public readonly unidade: string | undefined,
    public readonly forma: string | undefined,
    public readonly imageUri: string | undefined,
    public readonly createdAt: Date,
  ) {}

  static create(data: Omit<Medicine, 'id' | 'createdAt'>): MedicineEntity {
    return new MedicineEntity(
      undefined,
      data.name,
      data.description,
      data.dosage,
      data.quantidade,
      data.unidade,
      data.forma,
      data.imageUri,
      new Date(),
    );
  }

  static fromData(data: Medicine): MedicineEntity {
    return new MedicineEntity(
      data.id,
      data.name,
      data.description,
      data.dosage,
      data.quantidade,
      data.unidade,
      data.forma,
      data.imageUri,
      typeof data.createdAt === 'string'
        ? new Date(data.createdAt)
        : data.createdAt,
    );
  }

  toPersistence(): Medicine {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      dosage: this.dosage,
      imageUri: this.imageUri,
      createdAt: this.createdAt,
    };
  }

  update({
    name,
    description,
    dosage,
    quantidade,
    unidade,
    forma,
    imageUri,
  }: {
    name?: string;
    description?: string;
    dosage?: string;
    quantidade?: string;
    unidade?: string;
    forma?: string;
    imageUri?: string;
  }): MedicineEntity {
    return new MedicineEntity(
      this.id,
      name ?? this.name,
      description ?? this.description,
      dosage ?? this.dosage,
      quantidade ?? this.quantidade,
      unidade ?? this.unidade,
      forma ?? this.forma,
      imageUri ?? this.imageUri,
      this.createdAt,
    );
  }

  hasImage(): boolean {
    return !!this.imageUri;
  }
}
