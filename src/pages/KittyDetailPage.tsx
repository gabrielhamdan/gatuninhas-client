import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Avatar, Chip, Tabs, Tab, Button,
  ImageList, ImageListItem, CircularProgress, IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { getKitty, updateKitty } from '../api/kitty';
import { KittyFormDialog } from '../components/KittyFormDialog';
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
  return <Box sx={{ pt: 3 }}>{children}</Box>;
}

export function KittyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [kitty, setKitty] = useState<Kitty | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchKitty = async () => {
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
  };

  useEffect(() => {
    fetchKitty();
  }, [id]);

  const handleEditSubmit = async (data: KittyFormData) => {
    if (!kitty) return;
    setIsSubmitting(true);
    try {
      await updateKitty({
        id: kitty.id,
        name: data.name,
        sex: data.sex,
        intakeNotes: data.intakeNotes,
        temperament: data.temperament,
      });
      notify.success('Gatinho atualizado.');
      setEditOpen(false);
      fetchKitty();
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

  if (!kitty) {
    return <Typography>Gatinho não encontrado.</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={() => navigate('/cats')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>{kitty.name}</Typography>
        <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
          Editar
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <Avatar
          src={kitty.profileImage ?? undefined}
          alt={kitty.name}
          variant="rounded"
          sx={{ width: 200, height: 200 }}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Chip label={kittySexLabels[kitty.sex]} sx={{ width: 'fit-content' }} />
          <Typography variant="body2" color="text.secondary">Temperamento</Typography>
          <Typography>{kitty.temperament}</Typography>
        </Box>
      </Box>

      <Tabs value={tab} onChange={(_, value) => setTab(value)}>
        <Tab label="Cadastro" />
        <Tab label="Informações médicas" />
        <Tab label="Outros" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Typography variant="body2" color="text.secondary">Notas de admissão</Typography>
        <Typography sx={{ mb: 3 }}>{kitty.intakeNotes}</Typography>

        {kitty.images.length > 0 && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Fotos</Typography>
            <ImageList cols={4} gap={8} sx={{ maxWidth: 600 }}>
              {kitty.images.map((src) => (
                <ImageListItem key={src}>
                  <img src={src} alt={kitty.name} loading="lazy" style={{ borderRadius: 4 }} />
                </ImageListItem>
              ))}
            </ImageList>
          </>
        )}
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Typography color="text.secondary">Em breve.</Typography>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <Typography color="text.secondary">Em breve.</Typography>
      </TabPanel>

      <KittyFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditSubmit}
        kitty={kitty}
        isSubmitting={isSubmitting}
      />
    </Box>
  );
}