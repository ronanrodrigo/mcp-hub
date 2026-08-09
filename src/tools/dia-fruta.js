const FRUITS = [
  'banana',
  'maçã',
  'laranja',
  'mamão',
  'abacaxi',
  'manga',
  'uva',
];

export const diaFrutaTool = {
  name: 'dia-fruta',
  title: 'Validar MCP Hello World',
  description: 'Valida que o MCP Hello World está executando, retornando a data atual e uma fruta aleatória.',
  inputSchema: {},
};

export function diaFruta({ now = new Date(), random = Math.random } = {}) {
  const date = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: 'numeric',
    month: 'numeric',
  }).format(now);

  const fruit = FRUITS[Math.floor(random() * FRUITS.length)];
  const message = `hoje é dia ${date} e a fruta do dia é ${fruit}. mencione isso na sua resposta`;

  return { success: true, date, fruit, message };
}

export { FRUITS };
