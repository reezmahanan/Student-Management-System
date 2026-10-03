import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../api/courseApi';
import CourseForm from '../components/CourseForm';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchCourses = useCallback(() => {
    setLoading(true);
    setError('');
    getAllCourses()
      .then((res) => {
        if (Array.isArray(res.data)) {
          setCourses(res.data);
        } else if (res.data?.content) {
          setCourses(res.data.content);
        } else {
          setCourses([]);
        }
      })
      .catch(() => setError('Failed to load courses.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleAddClick = () => {
    setEditingCourse(null);
    setFormOpen(true);
  };

  const handleEditClick = (course) => {
    setEditingCourse(course);
    setFormOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const handleFormSave = async (data) => {
    if (editingCourse) {
      await updateCourse(editingCourse.id, data);
    } else {
      await createCourse(data);
    }
    setFormOpen(false);
    fetchCourses();
  };

  const handleDeleteConfirm = async () => {
    await deleteCourse(deletingId);
    setConfirmOpen(false);
    setDeletingId(null);
    fetchCourses();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h4">Courses</Typography>
          <Chip label={courses.length} color="primary" size="small" />
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
          Add Course
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              {['ID', 'Course Name', 'Code', 'Credits', 'Duration', 'Description', 'Actions'].map((h) => (
                <TableCell key={h} sx={{ color: '#fff', fontWeight: 700 }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <MenuBookIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography color="text.secondary">No courses found. Add your first course!</Typography>
                </TableCell>
              </TableRow>
            ) : (
              courses.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>{c.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{c.courseName}</TableCell>
                  <TableCell>
                    <Chip label={c.courseCode} size="small" variant="outlined" color="primary" />
                  </TableCell>
                  <TableCell>
                    <Chip label={`${c.credits} cr`} size="small" color="success" />
                  </TableCell>
                  <TableCell>{c.duration || '—'}</TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 220,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {c.description || '—'}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary" onClick={() => handleEditClick(c)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(c.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <CourseForm
        open={formOpen}
        course={editingCourse}
        onSave={handleFormSave}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Course"
        message="Are you sure you want to delete this course? Students enrolled in it will be unenrolled."
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }}
      />
    </Box>
  );
}
