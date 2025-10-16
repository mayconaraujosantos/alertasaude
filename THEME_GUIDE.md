# 🎨 Sistema de Tema Dinâmico - Guia de Uso

## 📋 Resumo da Implementação

O sistema de tema foi implementado com suporte completo ao tema do sistema operacional (claro/escuro) e permite alternância manual entre os modos.

## 🏗️ Arquivos Criados/Modificados:

### ✅ Criados:

- `src/shared/ThemeContext.tsx` - Context principal do tema
- `src/presentation/hooks/useThemedStyles.ts` - Hook para estilos temáticos
- `src/presentation/views/ExampleThemedScreen.tsx` - Exemplo de uso

### ✅ Modificados:

- `App.tsx` - Wrapper com ThemeProvider
- `SettingsScreen.tsx` - Opção de alternar tema

## 🚀 Como Usar o Sistema de Tema:

### **1. Em qualquer componente:**

```tsx
import { useTheme } from '../../shared/ThemeContext';

export const MyComponent = () => {
  const { theme, isDark, themeMode, setTheme, toggleTheme } = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text }}>
        Tema atual: {isDark ? 'Escuro' : 'Claro'}
      </Text>
    </View>
  );
};
```

### **2. Para estilos mais complexos:**

```tsx
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Theme } from '../../shared/ThemeContext';

export const MyStyledComponent = () => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Texto com tema</Text>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
  });
```

## 🎨 Cores Disponíveis:

### Tema Claro:

- `background`: '#ffffff'
- `surface`: '#f9fafb'
- `card`: '#ffffff'
- `primary`: '#3b82f6'
- `text`: '#1f2937'
- `border`: '#e5e7eb'

### Tema Escuro:

- `background`: '#111827'
- `surface`: '#1f2937'
- `card': '#374151'
- `primary`: '#60a5fa'
- `text`: '#f9fafb'
- `border`: '#4b5563'

## ⚙️ Configurações do Tema:

### **Três modos disponíveis:**

1. **`'system'`** - Segue o tema do sistema operacional (padrão)
2. **`'light'`** - Tema claro fixo
3. **`'dark'`** - Tema escuro fixo

### **Como alterar:**

```tsx
const { setTheme } = useTheme();

// Alternar para modo sistema
setTheme('system');

// Forçar tema claro
setTheme('light');

// Forçar tema escuro
setTheme('dark');
```

## 📱 StatusBar Adaptativa:

O StatusBar é automaticamente adaptado ao tema:

- **Tema claro**: StatusBar com conteúdo escuro
- **Tema escuro**: StatusBar com conteúdo claro

## 🔧 Próximos Passos:

### Para aplicar o tema em todas as telas:

1. **Migre as telas existentes** para usar `useTheme()` ou `useThemedStyles()`
2. **Substitua cores fixas** por `theme.colors.*`
3. **Teste em diferentes temas** para garantir boa legibilidade
4. **Adicione persistência** para salvar a preferência do usuário

### Exemplo de migração rápida:

```tsx
// ❌ Antes (cores fixas)
<View style={{ backgroundColor: '#ffffff' }}>
  <Text style={{ color: '#000000' }}>Texto</Text>
</View>;

// ✅ Depois (com tema)
const { theme } = useTheme();
<View style={{ backgroundColor: theme.colors.background }}>
  <Text style={{ color: theme.colors.text }}>Texto</Text>
</View>;
```

## 🎉 Resultado:

✅ **Tema automático** baseado no sistema  
✅ **Alternância manual** entre claro/escuro/sistema  
✅ **StatusBar adaptativo**  
✅ **Cores consistentes** em toda a aplicação  
✅ **Fácil customização** e extensão

O usuário agora pode escolher entre usar o tema do sistema automaticamente ou fixar em claro/escuro conforme sua preferência! 🌓
