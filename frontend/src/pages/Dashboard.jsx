import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import GradeIcon from '@mui/icons-material/Grade';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SchoolIcon from '@mui/icons-material/School';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getDashboardStats } from '../api/dashboardApi';
import { downloadStudentsPdf } from '../api/analyticsApi';

function StatCard({ title, value, subtitle, icon, color, loading }) {
  return (
    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
              {title}
            </Typography>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Typography variant="h4" fontWeight={700} color={color}>
                {value ?? '—'}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: `${color}15`,
              borderRadius: '50%',
              width: 52,
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.cloneElement(icon, { sx: { color, fontSize: 28 } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data?.data || res.data))
      .catch(() => setError('Could not load dashboard stats. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  const barData = [
    { name: 'Enrolled', count: stats?.totalStudents || 3 },
    { name: 'Subjects', count: stats?.totalCourses || 3 },
    { name: 'Allocations', count: stats?.totalEnrollments || 6 },
    { name: 'Needs Attention', count: stats?.atRiskStudentsCount || 0 },
  ];

  return (
    <Box>
      {/* Hero Welcome Banner with Unique Campus Background */}
      <Card
        sx={{
          mb: 3.5,
          borderRadius: 3,
          overflow: 'hidden',
          backgroundImage: `linear-gradient(90deg, rgba(8, 28, 64, 0.92) 0%, rgba(13, 71, 161, 0.8) 55%, rgba(13, 71, 161, 0.45) 100%), url('/edunexus-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#fff',
          boxShadow: '0 12px 36px rgba(13, 71, 161, 0.25)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 3.5 } }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} md={8}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'rgba(255, 179, 0, 0.2)',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1.5,
                  mb: 1.5,
                  border: '1px solid rgba(255, 179, 0, 0.4)',
                }}
              >
                <SchoolIcon sx={{ color: '#ffb300', fontSize: 18 }} />
                <Typography variant="caption" sx={{ color: '#ffb300', fontWeight: 700, letterSpacing: 0.8 }}>
                  EDUNEXUS ACADEMIC SYSTEM • LIVE REPOSITORY
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={800} sx={{ mb: 1, color: '#fff' }}>
                Academic Intelligence Dashboard
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)', maxWidth: 620, lineHeight: 1.6 }}>
                Real-time MySQL 8.0 synchronization, G.C.E. Advanced Level Z-Score analysis, automated attendance tracking, and early warning analytics.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1.5 }}>
              <Button
                variant="contained"
                startIcon={<PictureAsPdfIcon />}
                onClick={downloadStudentsPdf}
                sx={{
                  bgcolor: '#d32f2f',
                  fontWeight: 700,
                  px: 2.5,
                  py: 1.2,
                  boxShadow: '0 4px 14px rgba(211, 47, 47, 0.4)',
                  '&:hover': { bgcolor: '#b71c1c' },
                }}
              >
                Export Registry PDF
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error} (Backend server status: check port 8080)
        </Alert>
      )}

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Registered Students"
            value={stats?.totalStudents}
            subtitle="Active Student Directory"
            icon={<PeopleIcon />}
            color="#0d47a1"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Curriculum Subjects"
            value={stats?.totalCourses}
            subtitle={`${stats?.totalEnrollments || 0} active subject allocations`}
            icon={<MenuBookIcon />}
            color="#0288d1"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Term Attendance Rate"
            value={stats ? `${stats.overallAttendanceRate}%` : null}
            subtitle="Target threshold: ≥ 80%"
            icon={<HowToRegIcon />}
            color="#2e7d32"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Institutional A/L Z-Score"
            value={
              stats?.overallAverageZScore !== undefined && stats?.overallAverageZScore !== null
                ? (stats.overallAverageZScore >= 0 ? `+${stats.overallAverageZScore.toFixed(4)}` : stats.overallAverageZScore.toFixed(4))
                : '0.0000'
            }
            subtitle="Cohort Normalized Performance"
            icon={<GradeIcon />}
            color="#7b1fa2"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* AI Early Warning Banner if at-risk students exist */}
      {stats?.atRiskStudents && stats.atRiskStudents.length > 0 && (
        <Alert
          severity="warning"
          icon={<WarningAmberIcon fontSize="inherit" />}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/advisor')}>
              Review Advisor Insights
            </Button>
          }
          sx={{ mb: 3, borderRadius: 2 }}
        >
          <strong>Student Welfare Alert:</strong> {stats.atRiskStudents.length} student(s) identified with attendance under 75% or test marks requiring remedial intervention.
        </Alert>
      )}

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Academic Stream & Capacity Overview
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Institutional student distribution across core educational parameters
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0d47a1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Tuition & Fees Overview
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Academic Tuition & Facility Dues
              </Typography>
              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                  <Typography variant="caption" color="success.dark" fontWeight={600}>
                    TOTAL COLLECTED FEES
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="success.dark">
                    Rs. {stats?.totalFeesCollected?.toLocaleString() || '0.00'}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
                  <Typography variant="caption" color="warning.dark" fontWeight={600}>
                    PENDING DUES
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="warning.dark">
                    Rs. {stats?.pendingFees?.toLocaleString() || '0.00'}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/fees')}
                  sx={{ mt: 1 }}
                >
                  Manage Student Invoices
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Students Table */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Recently Enrolled Students
            </Typography>
            <Button size="small" onClick={() => navigate('/students')}>
              View Full Registry
            </Button>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Admission No</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Student Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>District</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Stream / Grade</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Enrollment Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats?.recentStudents?.length > 0 ? (
                  stats.recentStudents.map((s) => (
                    <TableRow key={s.id} hover>
                      <TableCell sx={{ fontWeight: 700, color: 'primary.dark' }}>
                        {s.admissionNo || `ST/2026/${s.id}`}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {s.fullNameWithInitials || `${s.firstName} ${s.lastName}`}
                      </TableCell>
                      <TableCell>{s.district || 'Colombo'}</TableCell>
                      <TableCell>
                        <Chip label={s.academicStream || 'A/L Physical Science'} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{s.enrollmentDate || '—'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      No recent students found in the registry.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
