import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { useNavigate } from 'react-router-dom';
import { getAtRiskStudents } from '../api/analyticsApi';

export default function Advisor() {
  const navigate = useNavigate();
  const [atRiskList, setAtRiskList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAtRiskStudents()
      .then((res) => {
        setAtRiskList(res.data?.data || res.data || []);
      })
      .catch(() => setError('Could not evaluate student risks. Please verify backend connection.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PsychologyIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight={700}>
              AI Academic Advisor & Early Warning System
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Automated intelligence model detecting at-risk students based on attendance drop-offs and academic trends
          </Typography>
        </div>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, height: '100%', bgcolor: '#fff8e1' }}>
            <CardContent>
              <Typography variant="caption" color="warning.dark" fontWeight={600}>
                STUDENTS FLAGGED FOR INTERVENTION
              </Typography>
              <Typography variant="h3" fontWeight={700} color="warning.dark" sx={{ my: 1 }}>
                {atRiskList.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Students below 75% attendance or scoring below 60% in assessments.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Advisor Detection Criteria
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                The automated system continuously scans student records to identify early signs of academic struggle:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 1.5, bgcolor: '#f4f6f8', borderRadius: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={600} color="error.main">
                      1. Attendance Threshold (&lt; 75%)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Flags chronic absenteeism or missed lecture hours.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 1.5, bgcolor: '#f4f6f8', borderRadius: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={600} color="warning.main">
                      2. Score Threshold (&lt; 60%)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Evaluates average exam, test, and assignment marks.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Students At Risk Table */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Flagged Students & Prescriptive Recommendations
          </Typography>

          <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 'none' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.100' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Student ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Attendance Rate</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Assessment Avg</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Identified Risk</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>AI Recommended Action</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : atRiskList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                      <Typography variant="h6" color="success.main" fontWeight={600}>
                        All Clear! Excellent Institutional Standing
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No students currently meet the at-risk criteria.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  atRiskList.map((item) => (
                    <TableRow key={item.studentId} hover>
                      <TableCell>{item.studentId}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{item.studentName}</TableCell>
                      <TableCell>
                        <Chip
                          label={`${item.attendancePercentage}%`}
                          size="small"
                          color={item.attendancePercentage < 75 ? 'error' : 'success'}
                        />
                      </TableCell>
                      <TableCell>
                        {item.averageScore !== null ? (
                          <Chip
                            label={`${item.averageScore}%`}
                            size="small"
                            color={item.averageScore < 60 ? 'warning' : 'default'}
                          />
                        ) : (
                          'No tests'
                        )}
                      </TableCell>
                      <TableCell sx={{ color: 'error.main', fontWeight: 500 }}>
                        {item.riskReason}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 280 }}>
                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'primary.dark' }}>
                          "{item.aiRecommendation}"
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/students/${item.studentId}`)}
                        >
                          View Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
