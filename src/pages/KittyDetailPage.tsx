import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Avatar, Paper, Chip, Tabs, Tab,
  ImageList, ImageListItem, CircularProgress, IconButton,
  Divider, Modal
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import EditIcon from '@mui/icons-material/Edit';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BoltIcon from '@mui/icons-material/Bolt';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import SnoozeIcon from '@mui/icons-material/Snooze';
import AddIcon from '@mui/icons-material/Add';
import { getKitty, updateKitty } from '../api/kitty';
import { KittyFormDialog } from '../components/KittyFormDialog';
import { TraitScale } from '../components/TraitScale';
import { kittySexLabels } from '../schemas/kittySchema';
import { notify } from '../lib/notify';
import { getErrorMessage } from '../lib/errors';
import type { Kitty } from '../types/kitty';
import type { KittyFormData } from '../schemas/kittySchema';

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  if (value !== index) return null;
  return (
    <Box sx={{ pt: 3, maxWidth: 600, mx: 'auto' }}>
      {children}
    </Box>
  );
}

// Placeholder até existir contrato de API pra características.
const MOCK_TRAITS = { carinho: 4, energia: 3, curiosidade: 5, timidez: 2, soninho: 3, medo: 1 };

export function KittyDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [kitty, setKitty] = useState<Kitty | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const fetchKitty = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getKitty(id);
      setKitty(data);
    } catch (error) {
      notify.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchKitty();
  }, [fetchKitty]);

  const handleEditSubmit = async (data: KittyFormData) => {
    if (!kitty) return;
    setIsSubmitting(true);
    try {
      await updateKitty({
        id: kitty.id,
        name: data.name,
        sex: data.sex,
        dob: {
          date: data.dob.precision === 'UNKNOWN' ? null : data.dob.date,
          precision: data.dob.precision,
        },
        intakeNotes: data.intakeNotes,
        temperament: data.temperament,
        observations: data.observations,
      });
      notify.success('Alterações salvas.');
      setDialogOpen(false);
      fetchKitty();
    } catch (error) {
      notify.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    notify.warning('Troca de foto ainda não implementada.');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!kitty) {
    return <Typography>Gatinho não encontrado.</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3, position: 'relative' }}>

        <IconButton
          onClick={() => setDialogOpen(true)}
          sx={{ position: 'absolute', top: 12, right: 12 }}
        >
          <EditIcon />
        </IconButton>


        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box
            component="label"
            sx={{
              position: 'relative',
              width: 250,
              height: 250,
              borderRadius: 1,
              overflow: 'hidden',
              cursor: 'pointer',
              display: 'block',
              '&:hover .photo-overlay': { opacity: 1 },
            }}
          >
            <Avatar
              src={kitty.profileImage ?? undefined}
              alt={kitty.name}
              variant="rounded"
              sx={{ width: '100%', height: '100%' }}
            />
            <Box
              className="photo-overlay"
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.2s',
              }}
            >
              <CameraAltIcon sx={{ color: '#fff', fontSize: 32 }} />
            </Box>
            <input type="file" accept="image/*" hidden onChange={handlePhotoChange} />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="h4" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>
              {kitty.name}
            </Typography>
            <Chip label={kittySexLabels[kitty.sex]} sx={{ width: 'fit-content', my: 1 }} />
            <Typography variant="body2" color="text.secondary">Data de nascimento</Typography>
            <Typography>
              {kitty.dob.precision === 'UNKNOWN'
                ? 'Desconhecida'
                : `${new Date(kitty.dob.date + 'T00:00:00').toLocaleDateString('pt-BR')}${kitty.dob.precision === 'APPROXIMATE' ? ' (aproximada)' : ''}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">Pelagem</Typography>
            <Typography>—</Typography>
          </Box>
        </Box>

        <Divider />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">Notas de entrada</Typography>
            <Typography>{kitty.intakeNotes || '—'}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Temperamento</Typography>
            <Typography>{kitty.temperament || '—'}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Observações</Typography>
            <Typography>{kitty.observations || '—'}</Typography>
          </Box>
        </Box>
      </Paper>

      <Tabs value={tab} onChange={(_, value) => setTab(value)}>
        <Tab label="Personalidade" />
        <Tab label="Histórico clínico" />
        <Tab label="Medicações" />
        <Tab label="Imagens" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Paper variant="outlined" sx={{ p: 3, maxWidth: 600 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              columnGap: 4,
              rowGap: 2,
            }}
          >
            <TraitScale icon={FavoriteIcon} label="Carinho" value={MOCK_TRAITS.carinho} />
            <TraitScale icon={BoltIcon} label="Energia" value={MOCK_TRAITS.energia} />
            <TraitScale icon={QuestionMarkIcon} label="Curiosidade" value={MOCK_TRAITS.curiosidade} />
            <TraitScale icon={TheaterComedyIcon} label="Timidez" value={MOCK_TRAITS.timidez} />
            <TraitScale icon={SnoozeIcon} label="Soninho" value={MOCK_TRAITS.soninho} />
            <TraitScale icon={ReportProblemIcon} label="Medo" value={MOCK_TRAITS.medo} />
          </Box>
        </Paper>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Typography color="text.secondary">Em breve.</Typography>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <Typography color="text.secondary">Em breve.</Typography>
      </TabPanel>

      <TabPanel value={tab} index={3}>
        <ImageList variant="masonry" cols={4} gap={8} sx={{ maxWidth: 600 }}>
          <ImageListItem>
            <Box
              component="label"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                aspectRatio: '1 / 1',
                borderRadius: 1,
                border: '2px dashed',
                borderColor: 'divider',
                cursor: 'pointer',
                color: 'text.secondary',
                '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
              }}
            >
              <AddIcon fontSize="large" />
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={() => notify.warning('Envio de imagens ainda não implementado.')}
              />
            </Box>
          </ImageListItem>

          {kitty.images.map((src) => (
            <ImageListItem key={src} onClick={() => setLightboxSrc(src)} sx={{ cursor: 'pointer' }}>
              <img src={src} alt={kitty.name} loading="lazy" style={{ borderRadius: 4, display: 'block', width: '100%' }} />
            </ImageListItem>
          ))}
        </ImageList>

        <Modal open={!!lightboxSrc} onClose={() => setLightboxSrc(null)}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              outline: 'none',
            }}
            onClick={() => setLightboxSrc(null)}
          >
            <img
              src={lightboxSrc ?? undefined}
              alt={kitty.name}
              style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8 }}
              onClick={(e) => e.stopPropagation()}
            />
          </Box>
        </Modal>
      </TabPanel>

      <KittyFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleEditSubmit}
        kitty={kitty}
        isSubmitting={isSubmitting}
      />
    </Box>
  );
}