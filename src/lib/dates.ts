export const formatDate = (date: string | null) =>
  date ? new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR') : null;

export const formatPeriod = (start: string, end: string | null) =>
  `${formatDate(start)} → ${end ? formatDate(end) : 'em andamento'}`;