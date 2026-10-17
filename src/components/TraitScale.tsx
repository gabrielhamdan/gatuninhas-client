import { Box, Rating, Typography } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import type { SvgIconComponent } from '@mui/icons-material';

interface TraitScaleProps {
  icon: SvgIconComponent;
  label: string;
  value: number;
  onChange?: (value: number) => void;
}

export function TraitScale({ icon: Icon, label, value, onChange }: TraitScaleProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Icon color="action" fontSize="small" />
      <Typography sx={{ flexGrow: 1 }}>{label}</Typography>
      <Rating
        value={value}
        max={5}
        icon={<CircleIcon fontSize="inherit" sx={ {color: 'primary.main'} } />}
        emptyIcon={<CircleOutlinedIcon fontSize="inherit" />}
        onChange={(_, newValue) => {
          if (newValue) onChange?.(newValue);
        }}
      />
    </Box>
  );
}