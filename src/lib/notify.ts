import type { OptionsObject, SnackbarMessage } from 'notistack';

type EnqueueFn = (message: SnackbarMessage, options?: OptionsObject) => void;
let enqueue: EnqueueFn | null = null;

export const notify = {
  bind(fn: EnqueueFn) { enqueue = fn; },
  error(message: string) { enqueue?.(message, { variant: 'error' }); },
  warning(message: string) { enqueue?.(message, { variant: 'warning' }); },
  success(message: string) { enqueue?.(message, { variant: 'success' }); },
};