import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Avatar,
  Tooltip,
  Chip,
  Button,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import GradeIcon from '@mui/icons-material/Grade';
import PaymentIcon from '@mui/icons-material/Payment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LogoutIcon from '@mui/icons-material/Logout';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useAuth } from '../context/AuthContext';
import { downloadStudentsExcel, downloadStudentsCsv } from '../api/analyticsApi';

const DRAWER_WIDTH = 250;

const navItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Students', path: '/students', icon: <PeopleIcon /> },
  { label: 'Courses', path: '/courses', icon: <MenuBookIcon /> },
  { label: 'Attendance', path: '/attendance', icon: <HowToRegIcon /> },
  { label: 'Grades & GPA', path: '/grades', icon: <GradeIcon /> },
  { label: 'Fees & Invoices', path: '/fees', icon: <PaymentIcon /> },
  { label: 'AI Advisor', path: '/advisor', icon: <WarningAmberIcon /> },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: '#0d47a1',
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
        }}
      >
        <Toolbar>
          <SchoolIcon sx={{ mr: 1.5, fontSize: 30 }} />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 0.5 }}>
            EduNexus SMS <span style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 400 }}>| Advanced Suite</span>
          </Typography>

          {/* Quick Export actions */}
          <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<FileDownloadIcon />}
              onClick={downloadStudentsExcel}
              sx={{ borderColor: 'rgba(255,255,255,0.4)', textTransform: 'none' }}
            >
              Excel
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<FileDownloadIcon />}
              onClick={downloadStudentsCsv}
              sx={{ borderColor: 'rgba(255,255,255,0.4)', textTransform: 'none' }}
            >
              CSV
            </Button>
          </Box>

          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" fontWeight={600} sx={{ color: '#fff' }}>
                  {user.fullName || user.username}
                </Typography>
                <Chip
                  label={user.role?.replace('ROLE_', '') || 'ADMIN'}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                  }}
                />
              </Box>
              <Tooltip title="Logout">
                <IconButton color="inherit" onClick={handleLogout}>
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            <Button color="inherit" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#1a237e',
            color: '#fff',
            borderRight: 'none',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 1.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <List sx={{ px: 1 }}>
            {navItems.map((item) => (
              <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  style={{ textDecoration: 'none', width: '100%', color: 'inherit' }}
                >
                  {({ isActive }) => (
                    <ListItemButton
                      sx={{
                        borderRadius: 2,
                        bgcolor: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                      }}
                    >
                      <ListItemIcon sx={{ color: isActive ? '#90caf9' : 'rgba(255,255,255,0.7)', minWidth: 42 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? '#fff' : 'rgba(255,255,255,0.85)',
                          fontSize: '0.9rem',
                        }}
                      />
                    </ListItemButton>
                  )}
                </NavLink>
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 'auto', p: 2, bgcolor: 'rgba(0,0,0,0.15)' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block' }}>
              💡 System Mode: Multi-Role Active
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>
              v2.0 • AI Academic Intelligence
            </Typography>
          </Box>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          minHeight: 'calc(100vh - 64px)',
          bgcolor: '#f4f6f9',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
