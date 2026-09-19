import { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { notify } from '../lib/notify';

export function SnackbarBinder() {
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => notify.bind(enqueueSnackbar), [enqueueSnackbar]);
  return null;
}