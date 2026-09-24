import { Box, Typography } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';

interface TraitScaleProps {
  icon: SvgIconComponent;
  label: string;
  value: number; // 1 a 5
}

export function TraitScale({ icon: Icon, label, value }: TraitScaleProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Icon color="action" fontSize="small" />
      <Typography sx={{ flexGrow: 1 }}>{label}</Typography>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {Array.from({ length: 5 }, (_, i) => (
          <Box
            key={i}
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              border: '2px solid',
              borderColor: 'primary.main',
              bgcolor: i < value ? 'primary.main' : 'transparent',
            }}
          />
        ))}
      </Box>
    </Box>
  );
}