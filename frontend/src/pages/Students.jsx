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
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useNavigate } from 'react-router-dom';
import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../api/studentApi';
import { downloadStudentsExcel, downloadStudentsPdf } from '../api/analyticsApi';
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
      .catch(() => setError('Failed to load student directory.'))
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
            Sri Lankan Student Directory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ministry of Education Registry • Student Profiles, NIC & Academic Streams
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
            color="error"
            startIcon={<PictureAsPdfIcon />}
            onClick={downloadStudentsPdf}
            sx={{ bgcolor: '#d32f2f' }}
          >
            Export PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Register Student
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Search Bar */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          placeholder="Search by name, admission no, or email…"
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
          sx={{ width: 360 }}
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
          <TableHead sx={{ bgcolor: '#0d47a1' }}>
            <TableRow>
              {['Admission No', 'Student Name', 'NIC No', 'Stream / Grade', 'District', 'Contact Phone', 'Enrolled Subjects', 'Actions'].map((h) => (
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
                  No students found in the registry. Click "Register Student" to add a new record.
                </TableCell>
              </TableRow>
            ) : (
              students.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.dark' }}>
                    {s.admissionNo || `ST/2026/${s.id}`}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {s.fullNameWithInitials || `${s.firstName} ${s.lastName}`}
                  </TableCell>
                  <TableCell>
                    <Chip label={s.nicNo || '—'} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.academicStream || 'General'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={s.district || 'Colombo'} size="small" color="info" variant="outlined" />
                  </TableCell>
                  <TableCell>{s.phone || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${s.courses?.length || 0} Subjects`}
                      size="small"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Profile & Transcript">
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
        title="Delete Student Record"
        message="Are you sure you want to delete this student from the national registry? This action cannot be reversed."
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }}
      />
    </Box>
  );
}
