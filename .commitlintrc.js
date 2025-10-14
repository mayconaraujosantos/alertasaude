module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // Nova funcionalidade
        'fix', // Correção de bug
        'docs', // Documentação
        'style', // Formatação, missing semi colons, etc; sem mudanças no código
        'refactor', // Refatoração do código
        'test', // Adição de testes
        'chore', // Tarefas de manutenção
        'perf', // Melhoria de performance
        'ci', // Mudanças em CI/CD
        'build', // Mudanças no sistema de build
        'revert', // Reverter commit anterior
      ],
    ],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
  },
};
