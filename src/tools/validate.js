const FRUITS = [
  'banana',
  'maçã',
  'laranja',
  'mamão',
  'abacaxi',
  'manga',
  'uva',
];

export const validateTool = {
  name: 'validate',
  title: 'Validate Hello World MCP',
  description: 'Validates that the Hello World MCP is executing by returning today\'s date and a random fruit.',
  inputSchema: {},
};

export function validate({ now = new Date(), random = Math.random } = {}) {
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
