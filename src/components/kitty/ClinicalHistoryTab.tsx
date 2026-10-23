import { useCallback, useEffect, useState } from 'react';
import { Box, Chip, CircularProgress, FormControlLabel, FormGroup, List, ListItem, ListItemText, Switch, Tab, Tabs, Typography } from '@mui/material';
import { getClinicalHistory, setClinicalSigns } from '../../api/clinicalHistory';
import { getErrorMessage } from '../../lib/errors';
import { notify } from '../../lib/notify';
import type { ClinicalHistory, ClinicalSigns } from '../../types/clinicalHistory';
import { TreatmentsPanel } from './TreatmentsPanel';
import { ConditionsPanel } from './ConditionsPanel';
import { TestsPanel } from './TestsPanel';
import { PrescriptionsPanel } from './PrescriptionsPanel';

const SUB_TABS = ['Sinais clínicos', 'Tratamentos', 'Condições', 'Exames', 'Medicações'];

const SIGN_LABELS: Record<keyof ClinicalSigns, string> = {
  diarrhea: 'Diarreia',
  ocular: 'Ocular',
  respiratory: 'Respiratório',
  vomiting: 'Vômito',
};

function EmptyState({ text }: { text: string }) {
  return <Typography color="text.secondary">{text}</Typography>;
}

interface ClinicalHistoryTabProps {
  kittyId: string;
}

export function ClinicalHistoryTab({ kittyId }: ClinicalHistoryTabProps) {
  const [subTab, setSubTab] = useState(0);
  const [history, setHistory] = useState<ClinicalHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setHistory(await getClinicalHistory(kittyId));
      } catch (error) {
        notify.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [kittyId]);

  const handleSignChange = async (sign: keyof ClinicalSigns, value: boolean) => {
    if (!history) return;
    const previous = history.clinicalSigns;
    const next = { ...previous, [sign]: value };
    setHistory({ ...history, clinicalSigns: next });
    try {
      await setClinicalSigns(kittyId, next);
      notify.success('Sinal alterado.');
    } catch (error) {
      setHistory((current) => current && { ...current, clinicalSigns: previous });
      notify.error(getErrorMessage(error));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!history) {
    return <EmptyState text="Não foi possível carregar o histórico clínico." />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Tabs value={subTab} onChange={(_, value) => setSubTab(value)} variant="scrollable" scrollButtons="auto">
        {SUB_TABS.map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>

      {subTab === 0 && (
        <FormGroup>
          {(Object.keys(SIGN_LABELS) as (keyof ClinicalSigns)[]).map((sign) => (
            <FormControlLabel
              key={sign}
              label={SIGN_LABELS[sign]}
              control={
                <Switch
                  checked={history.clinicalSigns[sign]}
                  onChange={(_, checked) => handleSignChange(sign, checked)}
                />
              }
            />
          ))}
        </FormGroup>
      )}

      {subTab === 1 && (
        <TreatmentsPanel
          historyId={history.id}
          treatments={history.medicalTreatments}
          onChange={(medicalTreatments) => setHistory({ ...history, medicalTreatments })}
        />
      )}

      {subTab === 2 && (
        <ConditionsPanel
          historyId={history.id}
          conditions={history.medicalConditions}
          onChange={(medicalConditions) => setHistory({ ...history, medicalConditions })}
        />
      )}

      {subTab === 3 && (
        <TestsPanel
          historyId={history.id}
          tests={history.medicalTests}
          onChange={(medicalTests) => setHistory({ ...history, medicalTests })}
        />
      )}

      {subTab === 4 && (
        <PrescriptionsPanel
          historyId={history.id}
          prescriptions={history.medicalPrescriptions}
          onChange={(medicalPrescriptions) => setHistory({ ...history, medicalPrescriptions })}
        />
      )}
    </Box>
  );
}