import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `linear-gradient(135deg, rgba(8, 28, 64, 0.78) 0%, rgba(13, 71, 161, 0.72) 100%), url('/edunexus-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        p: { xs: 2, sm: 4 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          maxWidth: 960,
          width: '100%',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Left Branding Showcase (Hidden on Mobile) */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'space-between',
            flex: 1,
            p: 5,
            background: 'linear-gradient(145deg, rgba(13, 71, 161, 0.85) 0%, rgba(1, 28, 77, 0.92) 100%)',
            backdropFilter: 'blur(12px)',
            color: '#fff',
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box
                sx={{
                  bgcolor: '#ffb300',
                  color: '#0d47a1',
                  p: 1.2,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: '0 4px 14px rgba(255, 179, 0, 0.4)',
                }}
              >
                <SchoolIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={800} letterSpacing={1.2}>
                  EDUNEXUS
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', letterSpacing: 0.8 }}>
                  ACADEMIC INTELLIGENCE PLATFORM
                </Typography>
              </Box>
            </Box>

            <Typography variant="h4" fontWeight={700} sx={{ lineHeight: 1.25, mb: 2 }}>
              Empowering Education with Real-Time Precision
            </Typography>

            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', mb: 4, lineHeight: 1.6 }}>
              Comprehensive student management, G.C.E. Advanced Level Z-Score normalization, attendance analytics, and certified transcript generation.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  <strong>Real-Time MySQL 8.0:</strong> Instant transactional synchronization
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ffb300' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  <strong>A/L Z-Score Engine:</strong> Cohort standard deviation normalization
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#29b6f6' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  <strong>Enterprise Ready:</strong> Containerized multi-role architecture
                </Typography>
              </Box>
            </Box>
          </Box>

          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', pt: 4 }}>
            © 2026 EduNexus Academic System. All rights reserved.
          </Typography>
        </Box>

        {/* Right Login Form */}
        <Card
          sx={{
            flex: { xs: 1, md: 0.9 },
            borderRadius: 0,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <CardContent sx={{ p: { xs: 3.5, sm: 5 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" fontWeight={800} color="#0d47a1">
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to your EduNexus academic portal
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <form onSubmit={handleLogin}>
              <TextField
                label="Username or Email"
                fullWidth
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Password"
                type="password"
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  py: 1.3,
                  fontWeight: 700,
                  bgcolor: '#0d47a1',
                  '&:hover': { bgcolor: '#082a63' },
                  boxShadow: '0 4px 14px rgba(13, 71, 161, 0.35)',
                }}
              >
                {loading ? 'Signing In...' : 'Sign In to Portal'}
              </Button>
            </form>

            {/* Quick Demo Credentials */}
            <Box sx={{ mt: 3, p: 2, bgcolor: '#f0f4f8', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 1 }}>
                Quick Test Credentials (Click to fill):
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => { setUsername('admin'); setPassword('admin123'); }}
                  sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.3 }}
                >
                  Admin
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => { setUsername('teacher'); setPassword('teacher123'); }}
                  sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.3 }}
                >
                  Teacher
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => { setUsername('student'); setPassword('student123'); }}
                  sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.3 }}
                >
                  Student
                </Button>
              </Box>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Button
                  variant="text"
                  size="small"
                  onClick={() => navigate('/register')}
                  sx={{ fontWeight: 700, p: 0, minWidth: 'auto', textTransform: 'none', color: '#0d47a1' }}
                >
                  Register here
                </Button>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
