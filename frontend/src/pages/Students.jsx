import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Pagination,
  Stack,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useNavigate } from 'react-router-dom';
import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../api/studentApi';
import { downloadStudentsExcel, downloadStudentsCsv } from '../api/analyticsApi';
import StudentForm from '../components/StudentForm';
import ConfirmDialog from '../components/ConfirmDialog';

const GENDER_COLORS = {
  MALE: 'primary',
  FEMALE: 'secondary',
  OTHER: 'default',
};

export default function Students() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchStudents = useCallback(() => {
    setLoading(true);
    setError('');
    getAllStudents(page - 1, 10, search)
      .then((res) => {
        const data = res.data?.data || res.data;
        if (data && Array.isArray(data.content)) {
          setStudents(data.content);
          setTotalPages(data.totalPages || 1);
        } else if (Array.isArray(data)) {
          setStudents(data);
          setTotalPages(1);
        } else {
          setStudents([]);
        }
      })
      .catch(() => setError('Failed to load students.'))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleAddClick = () => {
    setEditingStudent(null);
    setFormOpen(true);
  };

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setFormOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const handleFormSave = async (data) => {
    if (editingStudent) {
      await updateStudent(editingStudent.id, data);
    } else {
      await createStudent(data);
    }
    setFormOpen(false);
    fetchStudents();
  };

  const handleDeleteConfirm = async () => {
    await deleteStudent(deletingId);
    setConfirmOpen(false);
    setDeletingId(null);
    fetchStudents();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <div>
          <Typography variant="h4" fontWeight={700}>
            Students Directory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage student registrations, profile details, and course enrollments
          </Typography>
        </div>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={downloadStudentsExcel}
          >
            Export Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Add Student
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Search Bar */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          placeholder="Search by name or email…"
          size="small"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: 340 }}
        />
        <Button variant="outlined" onClick={handleSearch}>Search</Button>
        {search && (
          <Button variant="text" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}>
            Clear
          </Button>
        )}
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              {['ID', 'Name', 'Email', 'Phone', 'Gender', 'Enrollment Date', 'Courses', 'Actions'].map((h) => (
                <TableCell key={h} sx={{ color: '#fff', fontWeight: 700 }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No students found.
                </TableCell>
              </TableRow>
            ) : (
              students.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>{s.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {s.firstName} {s.lastName}
                  </TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.phone || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={s.gender || '—'}
                      color={GENDER_COLORS[s.gender] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {s.enrollmentDate ? s.enrollmentDate.substring(0, 10) : '—'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${s.courses?.length || 0} enrolled`}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Profile">
                      <IconButton size="small" color="info" onClick={() => navigate(`/students/${s.id}`)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary" onClick={() => handleEditClick(s)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(s.id)}>
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

      {totalPages > 1 && (
        <Stack alignItems="center" sx={{ mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
            color="primary"
          />
        </Stack>
      )}

      <StudentForm
        open={formOpen}
        student={editingStudent}
        onSave={handleFormSave}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Student"
        message="Are you sure you want to delete this student? All linked records will be affected."
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }}
      />
    </Box>
  );
}
