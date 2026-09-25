import * as React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import type { CSSObject, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import type { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import logo from '../assets/logo.png';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import PetsIcon from '@mui/icons-material/Pets';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../auth/AuthContext';

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    variants: [
      {
        props: ({ open }) => open,
        style: {
          ...openedMixin(theme),
          '& .MuiDrawer-paper': openedMixin(theme),
        },
      },
      {
        props: ({ open }) => !open,
        style: {
          ...closedMixin(theme),
          '& .MuiDrawer-paper': closedMixin(theme),
        },
      },
    ],
  }),
);

const NAV_ITEMS = [
  { label: 'Início', path: '/', icon: <HomeIcon /> },
  { label: 'Gatinhos', path: '/kitties', icon: <PetsIcon /> },
];

const BOTTOM_ITEMS = [
  { label: 'Configurações', path: '/settings', icon: <SettingsIcon /> },
];

export function AppLayout() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  const { user, logout } = useAuth();

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const bottomItems = user?.role === 'ADMIN'
    ? [...BOTTOM_ITEMS, { label: 'Admin', path: '/admin', icon: <AdminPanelSettingsIcon /> }]
    : BOTTOM_ITEMS;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={[{ marginRight: 5 }, open && { display: 'none' }]}
          >
            <MenuIcon />
          </IconButton>
          
          <Box component="img" src={logo} alt="Gatuninhas" sx={{ height: 32, filter: 'brightness(0) invert(1)' }} />
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />

        <List sx={{ flexGrow: 1 }}>
          {NAV_ITEMS.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={[
                  { minHeight: 48, px: 2.5 },
                  open ? { justifyContent: 'initial' } : { justifyContent: 'center' },
                ]}
              >
                <ListItemIcon sx={[{ minWidth: 0, justifyContent: 'center' }, open ? { mr: 3 } : { mr: 'auto' }]}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} sx={[open ? { opacity: 1 } : { opacity: 0 }]} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider />
        <List>
          {bottomItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={[
                  { minHeight: 48, px: 2.5 },
                  open ? { justifyContent: 'initial' } : { justifyContent: 'center' },
                ]}
              >
                <ListItemIcon sx={[{ minWidth: 0, justifyContent: 'center' }, open ? { mr: 3 } : { mr: 'auto' }]}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} sx={[open ? { opacity: 1 } : { opacity: 0 }]} />
              </ListItemButton>
            </ListItem>
          ))}

          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={logout}
              sx={[
                { minHeight: 48, px: 2.5 },
                open ? { justifyContent: 'initial' } : { justifyContent: 'center' },
              ]}
            >
              <ListItemIcon sx={[{ minWidth: 0, justifyContent: 'center' }, open ? { mr: 3 } : { mr: 'auto' }]}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Sair" sx={[open ? { opacity: 1 } : { opacity: 0 }]} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        <Outlet />
      </Box>
    </Box>
  );
}