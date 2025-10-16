# Instalação do Drizzle ORM

## Dependências necessárias:

```bash
# Drizzle ORM e SQLite adapter
npm install drizzle-orm
npm install drizzle-kit --save-dev

# Para React Native com Expo SQLite
npm install @expo/sqlite
```

## Comando de instalação:

```bash
npm install drizzle-orm drizzle-kit@latest @expo/sqlite
```

## Estrutura que criaremos:

```
src/
  infrastructure/
    database/
      drizzle/
        schema.ts          # Definição das tabelas
        migrations/        # Migrações geradas
        config.ts          # Configuração do Drizzle
      DrizzleDatabaseManager.ts  # Nova implementação
```