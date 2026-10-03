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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import GradeIcon from '@mui/icons-material/Grade';
import { getAllStudents } from '../api/studentApi';
import { getAllCourses } from '../api/courseApi';
import { getGradesByStudent, recordGrade, deleteGrade, getStudentGPA } from '../api/gradeApi';

const GRADE_COLOR_MAP = {
  'A+': 'success',
  A: 'success',
  'B+': 'primary',
  B: 'primary',
  'C+': 'info',
  C: 'info',
  D: 'warning',
  F: 'error',
};

export default function Grades() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [grades, setGrades] = useState([]);
  const [studentGpa, setStudentGpa] = useState(0.0);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New Grade Form
  const [courseId, setCourseId] = useState('');
  const [examType, setExamType] = useState('FINAL');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState(100);
  const [semester, setSemester] = useState('Fall 2026');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    getAllStudents(0, 100).then((res) => {
      const list = res.data?.data?.content || res.data?.content || res.data || [];
      setStudents(list);
      if (list.length > 0) {
        setSelectedStudentId(list[0].id);
      }
    });

    getAllCourses().then((res) => {
      setCourses(res.data?.data || res.data || []);
    });
  }, []);

  const loadStudentGrades = (studentId) => {
    if (!studentId) return;
    setLoading(true);
    setError('');

    Promise.all([getGradesByStudent(studentId), getStudentGPA(studentId)])
      .then(([gradesRes, gpaRes]) => {
        setGrades(gradesRes.data?.data || gradesRes.data || []);
        setStudentGpa(gpaRes.data?.data ?? gpaRes.data ?? 0.0);
      })
      .catch(() => setError('Failed to load student grade records.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedStudentId) {
      loadStudentGrades(selectedStudentId);
    }
  }, [selectedStudentId]);

  const handleAddGrade = async () => {
    if (!courseId || !score || !maxScore) {
      setError('Please fill in all required grade fields.');
      return;
    }

    try {
      await recordGrade({
        studentId: selectedStudentId,
        courseId,
        examType,
        score: parseFloat(score),
        maxScore: parseFloat(maxScore),
        semester,
        feedback,
      });

      setSuccess('Grade recorded successfully!');
      setDialogOpen(false);
      // Reset form
      setScore('');
      setFeedback('');
      loadStudentGrades(selectedStudentId);
    } catch {
      setError('Failed to record grade.');
    }
  };

  const handleDeleteGrade = async (gradeId) => {
    try {
      await deleteGrade(gradeId);
      loadStudentGrades(selectedStudentId);
    } catch {
      setError('Could not delete grade.');
    }
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h4" fontWeight={700}>
            Grades & GPA Transcript
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Continuous assessment, examination scores, and dynamic CGPA calculation
          </Typography>
        </div>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            if (courses.length > 0) setCourseId(courses[0].id);
            setDialogOpen(true);
          }}
          disabled={!selectedStudentId}
        >
          Record Grade
        </Button>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Student Selector Card */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={5}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Student</InputLabel>
                <Select
                  value={selectedStudentId}
                  label="Select Student"
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                  {students.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {selectedStudent && (
              <Grid item xs={12} sm={6} md={7}>
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      CUMULATIVE GPA
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="primary.main">
                      {studentGpa ? studentGpa.toFixed(2) : '0.00'} / 4.0
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      TOTAL EXAMS
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {grades.length}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Grades Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Course</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Assessment</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Score</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Percentage</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Grade</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>GPA Point</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Semester</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {grades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No grades recorded for this student yet. Click "Record Grade" to add one!
                </TableCell>
              </TableRow>
            ) : (
              grades.map((g) => {
                const pct = Math.round((g.score / g.maxScore) * 100);
                return (
                  <TableRow key={g.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{g.courseName}</TableCell>
                    <TableCell>
                      <Chip label={g.examType} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {g.score} / {g.maxScore}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{pct}%</TableCell>
                    <TableCell>
                      <Chip
                        label={g.letterGrade || '—'}
                        size="small"
                        color={GRADE_COLOR_MAP[g.letterGrade] || 'default'}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{g.gpaPoint ? g.gpaPoint.toFixed(1) : '—'}</TableCell>
                    <TableCell>{g.semester || '—'}</TableCell>
                    <TableCell>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDeleteGrade(g.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Record Grade Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Academic Assessment Grade</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Course</InputLabel>
                <Select value={courseId} label="Course" onChange={(e) => setCourseId(e.target.value)}>
                  {courses.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.courseName} ({c.courseCode})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Assessment Type</InputLabel>
                <Select value={examType} label="Assessment Type" onChange={(e) => setExamType(e.target.value)}>
                  <MenuItem value="MIDTERM">Midterm Exam</MenuItem>
                  <MenuItem value="FINAL">Final Exam</MenuItem>
                  <MenuItem value="ASSIGNMENT">Assignment</MenuItem>
                  <MenuItem value="QUIZ">Quiz</MenuItem>
                  <MenuItem value="PROJECT">Project</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Semester"
                fullWidth
                size="small"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Score Obtained"
                type="number"
                fullWidth
                size="small"
                value={score}
                onChange={(e) => setScore(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Maximum Score"
                type="number"
                fullWidth
                size="small"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Feedback / Instructor Notes"
                fullWidth
                multiline
                rows={2}
                size="small"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddGrade}>
            Save Grade
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
