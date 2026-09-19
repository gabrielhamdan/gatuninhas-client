import { isAxiosError } from 'axios';

const DEFAULT_MESSAGES: Record<number, string> = {
  400: 'Requisição inválida.',
  401: 'Não autorizado.',
  403: 'Você não tem permissão para isso.',
  404: 'Recurso não encontrado.',
  409: 'Conflito ao processar a requisição.',
  422: 'Dados inválidos.',
  500: 'Erro interno do servidor.',
};

const FALLBACK_MESSAGE = 'Ocorreu um erro inesperado. Tente novamente.';

export function getErrorMessage(error: unknown, overrides?: Partial<Record<number, string>>): string {
  if (!isAxiosError(error)) return FALLBACK_MESSAGE;

  const status = error.response?.status;
  const backendMessage = error.response?.data?.message;

  if (status && overrides?.[status]) return overrides[status]!;
  if (backendMessage) return backendMessage;
  if (status && DEFAULT_MESSAGES[status]) return DEFAULT_MESSAGES[status];

  return FALLBACK_MESSAGE;
}