# Guia de Uso do Drizzle ORM

## Comandos Disponíveis

### 1. Gerar nova migração
```bash
npm run db:generate
```
Este comando analisa o schema e gera uma nova migração SQL caso haja mudanças.

### 2. Aplicar migrações
```bash  
npm run db:migrate
```
Aplica todas as migrações pendentes no banco de dados.

### 3. Visualizar banco no Drizzle Studio
```bash
npm run db:studio
```
Abre uma interface web para visualizar e editar dados do banco.

### 4. Push schema diretamente (desenvolvimento)
```bash
npm run db:push
```
Aplica mudanças do schema diretamente sem criar migrações (útil em desenvolvimento).

### 5. Remover migração
```bash
npm run db:drop
```
Remove a última migração gerada.

## Fluxo de Desenvolvimento

### Para adicionar nova tabela ou coluna:

1. **Edite o schema**: `src/infrastructure/database/drizzle/schema.ts`
2. **Gere migração**: `npm run db:generate`
3. **Aplique migração**: As migrações são aplicadas automaticamente quando o app inicia

### Exemplo de mudança no schema:

```typescript
// Adicionar nova coluna na tabela medicines
export const medicines = sqliteTable('medicines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  // ... outras colunas existentes
  
  // NOVA COLUNA:
  expirationDate: text('expirationDate'), // Data de validade
});
```

Depois execute:
```bash
npm run db:generate  # Gera migração
```

## Vantagens do Drizzle

✅ **Type Safety**: Tipos TypeScript gerados automaticamente
✅ **Migrações Automáticas**: Controle de versão do banco  
✅ **Performance**: Query builder otimizado
✅ **Schema First**: Schema como fonte da verdade
✅ **Rollback Seguro**: Migrações reversíveis
✅ **Developer Experience**: Drizzle Studio para debug

## Migração do Sistema Atual

O DrizzleDatabaseManager pode conviver com o DatabaseManager atual:

1. **Gradual**: Migrar repository por repository
2. **Compatível**: Ambos usam o mesmo arquivo de banco SQLite
3. **Seguro**: Testes podem validar equivalência

Para usar:
```typescript
// No DIContainer ou onde inicializar
const drizzleDb = DrizzleDatabaseManager.getInstance();
await drizzleDb.initDatabase();

// Usar o novo repository
const doseReminderRepo = new DrizzleDoseReminderRepository(drizzleDb);
```