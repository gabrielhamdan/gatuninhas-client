import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Avatar, TextField, MenuItem, Button,
  Tabs, Tab, IconButton, CircularProgress, ImageList, ImageListItem,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getKitty, createKitty, updateKitty } from '../api/kitty';
import { kittySchema, kittySexOptions, kittySexLabels } from '../schemas/kittySchema';
import type { KittyFormInput, KittyFormData } from '../schemas/kittySchema';
import type { Kitty } from '../types/kitty';
import { notify } from '../lib/notify';
import { getErrorMessage } from '../lib/errors';

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  if (value !== index) return null;
  return <Box sx={{ pt: 3 }}>{children}</Box>;
}

export function KittyFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isCreating = !id;

  const [kitty, setKitty] = useState<Kitty | null>(null);
  const [loading, setLoading] = useState(!isCreating);
  const [tab, setTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { register, handleSubmit, control, reset, watch, formState: { errors, isDirty } } =
    useForm<KittyFormInput, unknown, KittyFormData>({
      resolver: zodResolver(kittySchema),
      defaultValues: { name: '', sex: 'UNKNOWN', dob: '', intakeNotes: '', temperament: '' },
    });

  const profileImageFiles = watch('profileImage');

  useEffect(() => {
    if (!isCreating) return;
    const file = profileImageFiles?.[0];
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [profileImageFiles, isCreating]);

  useEffect(() => {
    if (isCreating || !id) return;
    setLoading(true);
    getKitty(id)
      .then((data) => {
        setKitty(data);
        reset({ name: data.name, sex: data.sex, dob: '', intakeNotes: data.intakeNotes, temperament: data.temperament });
      })
      .catch((error) => notify.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [id, isCreating, reset]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const handleBack = () => {
    if (isDirty && !window.confirm('Existem alterações não salvas. Deseja sair mesmo assim?')) {
      return;
    }
    navigate('/cats');
  };

  const onSubmit = async (data: KittyFormData) => {
    setIsSubmitting(true);
    try {
      if (isCreating) {
        const created = await createKitty({
          name: data.name,
          sex: data.sex,
          intakeNotes: data.intakeNotes,
          temperament: data.temperament,
          profileImage: data.profileImage,
        });
        notify.success('Gatinho cadastrado.');
        navigate(`/cats/${created.id}`, { replace: true });
      } else if (kitty) {
        await updateKitty({
          id: kitty.id,
          name: data.name,
          sex: data.sex,
          intakeNotes: data.intakeNotes,
          temperament: data.temperament,
        });
        notify.success('Alterações salvas.');
        reset({ name: data.name, sex: data.sex, dob: data.dob, intakeNotes: data.intakeNotes, temperament: data.temperament });
      }
    } catch (error) {
      notify.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const avatarSrc = isCreating ? (previewUrl ?? undefined) : (kitty?.profileImage ?? undefined);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate
         sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          {isCreating ? 'Cadastrar gatinho' : kitty?.name}
        </Typography>
        <Button type="submit" variant="contained" disabled={!isDirty || isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <Button
          component="label"
          sx={{ p: 0, width: 160, height: 160, borderRadius: 2, overflow: 'hidden' }}
          disabled={!isCreating}
        >
          <Avatar src={avatarSrc} variant="rounded" sx={{ width: '100%', height: '100%' }} />
          {isCreating && <input type="file" accept="image/*" hidden {...register('profileImage')} />}
        </Button>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 240 }}>
          <TextField
            label="Nome" fullWidth
            {...register('name')} error={!!errors.name} helperText={errors.name?.message}
          />

          <Controller
            name="sex"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Sexo" fullWidth error={!!errors.sex} helperText={errors.sex?.message}>
                {kittySexOptions.map((option) => (
                  <MenuItem key={option} value={option}>{kittySexLabels[option]}</MenuItem>
                ))}
              </TextField>
            )}
          />

          <TextField
            label="Data de nascimento" type="date" fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            {...register('dob')}
            helperText="Em breve"
          />
        </Box>
      </Box>

      {!isCreating && (
        <Tabs value={tab} onChange={(_, value) => setTab(value)}>
          <Tab label="Cadastro" />
          <Tab label="Informações médicas" />
          <Tab label="Outros" />
        </Tabs>
      )}

      <TabPanel value={tab} index={0}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600 }}>
          <TextField
            label="Notas de admissão" fullWidth multiline rows={3}
            {...register('intakeNotes')} error={!!errors.intakeNotes} helperText={errors.intakeNotes?.message}
          />
          <TextField
            label="Temperamento" fullWidth multiline rows={2}
            {...register('temperament')} error={!!errors.temperament} helperText={errors.temperament?.message}
          />

          {!isCreating && kitty && kitty.images.length > 0 && (
            <ImageList cols={4} gap={8}>
              {kitty.images.map((src) => (
                <ImageListItem key={src}>
                  <img src={src} alt={kitty.name} loading="lazy" style={{ borderRadius: 4 }} />
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </Box>
      </TabPanel>

      {!isCreating && (
        <>
          <TabPanel value={tab} index={1}>
            <Typography color="text.secondary">Em breve.</Typography>
          </TabPanel>
          <TabPanel value={tab} index={2}>
            <Typography color="text.secondary">Em breve.</Typography>
          </TabPanel>
        </>
      )}
    </Box>
  );
}