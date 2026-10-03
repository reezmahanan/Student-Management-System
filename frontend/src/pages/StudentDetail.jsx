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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutlined';
import { getStudentById, enrollInCourse, unenrollFromCourse } from '../api/studentApi';
import { getAllCourses } from '../api/courseApi';

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
      .then((res) => setStudent(res.data))
      .catch(() => setError('Failed to load student details.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const handleOpenEnroll = () => {
    getAllCourses()
      .then((res) => {
        const enrolled = student?.courses?.map((c) => c.id) || [];
        const available = Array.isArray(res.data)
          ? res.data.filter((c) => !enrolled.includes(c.id))
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
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/students')}
        sx={{ mb: 2 }}
        variant="outlined"
      >
        Back to Students
      </Button>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32, mb: 1.5 }}>
                  {student.firstName?.[0]}{student.lastName?.[0]}
                </Avatar>
                <Typography variant="h5" fontWeight={700}>
                  {student.firstName} {student.lastName}
                </Typography>
                <Chip
                  label={student.gender || 'N/A'}
                  color="primary"
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <INFO_FIELD label="Email" value={student.email} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <INFO_FIELD label="Phone" value={student.phone} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <INFO_FIELD
                    label="Date of Birth"
                    value={student.dateOfBirth ? student.dateOfBirth.substring(0, 10) : null}
                  />
                </Grid>
                <Grid item xs={12}>
                  <INFO_FIELD label="Address" value={student.address} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <INFO_FIELD label="Student ID" value={student.id} />
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
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SchoolIcon color="primary" />
                  <Typography variant="h6">Enrolled Courses</Typography>
                  <Chip label={enrolledCourses.length} size="small" color="primary" />
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={handleOpenEnroll}
                >
                  Enroll
                </Button>
              </Box>
              <Divider sx={{ mb: 1 }} />
              {enrolledCourses.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                  <SchoolIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Not enrolled in any courses yet.
                  </Typography>
                </Box>
              ) : (
                <List dense>
                  {enrolledCourses.map((course) => (
                    <ListItem
                      key={course.id}
                      sx={{
                        bgcolor: 'grey.50',
                        borderRadius: 1,
                        mb: 1,
                        border: '1px solid',
                        borderColor: 'grey.200',
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
                            <Chip label={course.courseCode} size="small" variant="outlined" />
                            {course.credits && (
                              <Chip label={`${course.credits} credits`} size="small" color="success" variant="outlined" />
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
        <DialogTitle>Enroll in a Course</DialogTitle>
        <DialogContent>
          {allCourses.length === 0 ? (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              No available courses to enroll in.
            </Typography>
          ) : (
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>Select Course</InputLabel>
              <Select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                label="Select Course"
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
