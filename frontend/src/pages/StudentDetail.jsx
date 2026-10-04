import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tooltip,
  Avatar,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { getStudentById, enrollInCourse, unenrollFromCourse } from '../api/studentApi';
import { getAllCourses } from '../api/courseApi';
import { downloadStudentTranscriptPdf } from '../api/analyticsApi';

const INFO_FIELD = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </Typography>
    <Typography variant="body1" fontWeight={500}>
      {value || '—'}
    </Typography>
  </Box>
);

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Enroll dialog
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  const fetchStudent = () => {
    setLoading(true);
    getStudentById(id)
      .then((res) => setStudent(res.data?.data || res.data))
      .catch(() => setError('Failed to load student details.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const handleOpenEnroll = () => {
    getAllCourses()
      .then((res) => {
        const list = res.data?.data || res.data || [];
        const enrolled = student?.courses?.map((c) => c.id) || [];
        const available = Array.isArray(list)
          ? list.filter((c) => !enrolled.includes(c.id))
          : [];
        setAllCourses(available);
        setSelectedCourseId('');
        setEnrollOpen(true);
      })
      .catch(() => alert('Failed to load courses.'));
  };

  const handleEnroll = async () => {
    if (!selectedCourseId) return;
    setEnrolling(true);
    try {
      await enrollInCourse(id, selectedCourseId);
      setEnrollOpen(false);
      fetchStudent();
    } catch {
      alert('Failed to enroll in course.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async (courseId) => {
    try {
      await unenrollFromCourse(id, courseId);
      fetchStudent();
    } catch {
      alert('Failed to unenroll from course.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !student) {
    return (
      <Box>
        <Alert severity="error">{error || 'Student not found.'}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/students')} sx={{ mt: 2 }}>
          Back to Students
        </Button>
      </Box>
    );
  }

  const enrolledCourses = student.courses || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/students')}
          variant="outlined"
        >
          Back to Student Directory
        </Button>

        <Button
          variant="contained"
          color="error"
          startIcon={<PictureAsPdfIcon />}
          onClick={() => downloadStudentTranscriptPdf(student.id)}
          sx={{ bgcolor: '#d32f2f' }}
        >
          Download Official Transcript (PDF)
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Sri Lankan Profile Card */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 84, height: 84, bgcolor: '#0d47a1', fontSize: 32, mb: 1.5 }}>
                  {student.firstName?.[0]}{student.lastName?.[0]}
                </Avatar>
                <Typography variant="h5" fontWeight={700}>
                  {student.fullNameWithInitials || `${student.firstName} ${student.lastName}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Admission: {student.admissionNo || `ST/2026/${student.id}`}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip
                    label={student.academicStream || 'A/L Physical Science'}
                    color="primary"
                    size="small"
                  />
                  <Chip
                    label={student.gender || 'N/A'}
                    variant="outlined"
                    size="small"
                  />
                </Stack>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <INFO_FIELD label="National ID (NIC)" value={student.nicNo} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <INFO_FIELD label="District" value={student.district} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <INFO_FIELD label="Province" value={student.province} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <INFO_FIELD label="Contact Phone" value={student.phone} />
                </Grid>
                <Grid item xs={12}>
                  <INFO_FIELD label="Email Address" value={student.email} />
                </Grid>
                <Grid item xs={12}>
                  <INFO_FIELD label="Permanent Address" value={student.address} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <INFO_FIELD label="Parent / Guardian" value={student.guardianName} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <INFO_FIELD label="Guardian Contact" value={student.guardianPhone} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <INFO_FIELD
                    label="Date of Birth"
                    value={student.dateOfBirth ? student.dateOfBirth.substring(0, 10) : null}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <INFO_FIELD
                    label="Enrollment Date"
                    value={student.enrollmentDate ? student.enrollmentDate.substring(0, 10) : null}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Enrolled Courses Card */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SchoolIcon color="primary" />
                  <Typography variant="h6" fontWeight={700}>Enrolled Subjects & Curriculum</Typography>
                  <Chip label={enrolledCourses.length} size="small" color="primary" />
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={handleOpenEnroll}
                >
                  Enroll Subject
                </Button>
              </Box>
              <Divider sx={{ mb: 1 }} />
              {enrolledCourses.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                  <SchoolIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Not enrolled in any subjects yet.
                  </Typography>
                </Box>
              ) : (
                <List dense>
                  {enrolledCourses.map((course) => (
                    <ListItem
                      key={course.id}
                      sx={{
                        bgcolor: '#fafafa',
                        borderRadius: 1.5,
                        mb: 1,
                        border: '1px solid',
                        borderColor: '#e0e0e0',
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight={600}>
                            {course.courseName}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            <Chip label={course.courseCode} size="small" variant="outlined" color="primary" />
                            {course.credits && (
                              <Chip label={`${course.credits} Credits`} size="small" color="success" variant="outlined" />
                            )}
                            {course.duration && (
                              <Chip label={course.duration} size="small" variant="outlined" />
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Unenroll">
                          <IconButton
                            edge="end"
                            color="error"
                            size="small"
                            onClick={() => handleUnenroll(course.id)}
                          >
                            <RemoveCircleOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Enroll Dialog */}
      <Dialog open={enrollOpen} onClose={() => setEnrollOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Enroll in Subject</DialogTitle>
        <DialogContent>
          {allCourses.length === 0 ? (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              No available subjects to enroll in.
            </Typography>
          ) : (
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>Select Subject</InputLabel>
              <Select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                label="Select Subject"
              >
                {allCourses.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.courseName} ({c.courseCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEnrollOpen(false)} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleEnroll}
            variant="contained"
            disabled={!selectedCourseId || enrolling}
            startIcon={enrolling ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {enrolling ? 'Enrolling…' : 'Enroll'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
