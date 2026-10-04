import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Link,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const SRI_LANKAN_ROLES = [
  { value: 'ROLE_STUDENT', label: 'Student (ශිෂ්‍ය)' },
  { value: 'ROLE_TEACHER', label: 'Teacher / Lecturer (ගුරුභවතුන්)' },
  { value: 'ROLE_ADMIN', label: 'School Administrator / Principal' },
];

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'ROLE_STUDENT',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Username or email may already be in use.');
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
        bgcolor: '#f0f2f5',
        py: 4,
        px: 2,
      }}
    >
      <Card sx={{ maxWidth: 520, width: '100%', borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box
              sx={{
                bgcolor: '#0d47a1',
                color: '#fff',
                p: 1.5,
                borderRadius: '50%',
                mb: 1.5,
              }}
            >
              <PersonAddAlt1Icon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} align="center">
              Create an Account
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Sri Lanka Student Information System (SIS) • User Self-Registration
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleRegister}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Full Name (with initials)"
                  name="fullName"
                  placeholder="e.g. K.M. Kasun Bandara"
                  fullWidth
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Username"
                  name="username"
                  placeholder="e.g. kasun2026"
                  fullWidth
                  required
                  value={formData.username}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="e.g. kasun@sms.edu.lk"
                  fullWidth
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Account Role</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    label="Account Role"
                  >
                    {SRI_LANKAN_ROLES.map((r) => (
                      <MenuItem key={r.value} value={r.value}>
                        {r.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  fullWidth
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  fullWidth
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 3, py: 1.3, fontWeight: 700, bgcolor: '#0d47a1' }}
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" fontWeight={700} underline="hover">
                Sign in here
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
