import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { getAllCourses } from '../api/courseApi';
import { getAttendanceByCourse, bulkMarkAttendance } from '../api/attendanceApi';
import { getAllStudents } from '../api/studentApi';

const STATUS_CONFIG = {
  PRESENT: { color: 'success', label: 'Present' },
  LATE: { color: 'warning', label: 'Late' },
  ABSENT: { color: 'error', label: 'Absent' },
  EXCUSED: { color: 'info', label: 'Excused' },
};

export default function Attendance() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().substring(0, 10));
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [remarksMap, setRemarksMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getAllCourses()
      .then((res) => {
        const list = res.data?.data || res.data || [];
        setCourses(list);
        if (list.length > 0) {
          setSelectedCourseId(list[0].id);
        }
      })
      .catch(() => setError('Failed to load courses'));

    getAllStudents(0, 100)
      .then((res) => {
        const studentList = res.data?.data?.content || res.data?.content || res.data || [];
        setStudents(studentList);
      })
      .catch(() => setError('Failed to load students'));
  }, []);

  const loadAttendance = () => {
    if (!selectedCourseId) return;
    setLoading(true);
    setMessage('');
    setError('');

    getAttendanceByCourse(selectedCourseId, selectedDate)
      .then((res) => {
        const records = res.data?.data || res.data || [];
        const newAttMap = {};
        const newRemMap = {};

        records.forEach((rec) => {
          newAttMap[rec.studentId] = rec.status;
          newRemMap[rec.studentId] = rec.remarks || '';
        });

        // For any student not marked, default to PRESENT
        students.forEach((s) => {
          if (!newAttMap[s.id]) {
            newAttMap[s.id] = 'PRESENT';
          }
        });

        setAttendanceMap(newAttMap);
        setRemarksMap(newRemMap);
      })
      .catch(() => setError('Could not load attendance records'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedCourseId && students.length > 0) {
      loadAttendance();
    }
  }, [selectedCourseId, selectedDate, students]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleRemarkChange = (studentId, remark) => {
    setRemarksMap((prev) => ({ ...prev, [studentId]: remark }));
  };

  const handleMarkAllPresent = () => {
    const updated = {};
    students.forEach((s) => {
      updated[s.id] = 'PRESENT';
    });
    setAttendanceMap(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const payload = students.map((s) => ({
        studentId: s.id,
        courseId: selectedCourseId,
        attendanceDate: selectedDate,
        status: attendanceMap[s.id] || 'PRESENT',
        remarks: remarksMap[s.id] || '',
      }));

      await bulkMarkAttendance(payload);
      setMessage('Attendance register successfully saved!');
    } catch {
      setError('Failed to save attendance register.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h4" fontWeight={700}>
            Attendance Register
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Daily roll call, lecture attendance tracking, and absence management
          </Typography>
        </div>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" onClick={handleMarkAllPresent}>
            Mark All Present
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={saving || students.length === 0}
            onClick={handleSave}
          >
            {saving ? 'Saving...' : 'Save Register'}
          </Button>
        </Box>
      </Box>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filter toolbar */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Course</InputLabel>
                <Select
                  value={selectedCourseId}
                  label="Course"
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                >
                  {courses.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.courseName} ({c.courseCode})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                size="small"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Roll / ID</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Student Name</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Attendance Status</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Remarks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No students available.
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => {
                const currentStatus = attendanceMap[student.id] || 'PRESENT';
                return (
                  <TableRow key={student.id} hover>
                    <TableCell>{student.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      <RadioGroup
                        row
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(student.id, e.target.value)}
                      >
                        {['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'].map((st) => (
                          <FormControlLabel
                            key={st}
                            value={st}
                            control={<Radio size="small" />}
                            label={
                              <Chip
                                label={STATUS_CONFIG[st].label}
                                size="small"
                                color={currentStatus === st ? STATUS_CONFIG[st].color : 'default'}
                                variant={currentStatus === st ? 'filled' : 'outlined'}
                              />
                            }
                          />
                        ))}
                      </RadioGroup>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        placeholder="Optional remarks..."
                        value={remarksMap[student.id] || ''}
                        onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                        sx={{ width: 200 }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
