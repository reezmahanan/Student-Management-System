import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Typography,
  Divider,
} from '@mui/material';

const DISTRICTS_REGIONS = [
  'Central District', 'North District', 'South District', 'East District', 'West District',
  'Metropolitan Area', 'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Gampaha', 'Kurunegala'
];

const PROVINCES_STATES = [
  'Western Province', 'Central Province', 'Southern Province', 'Northern Province',
  'Eastern Province', 'North Western Province', 'North Central Province', 'Uva Province', 'Sabaragamuwa Province'
];

const ACADEMIC_STREAMS = [
  'Computer Science & Information Technology',
  'Physical Science & Engineering',
  'Biological & Health Sciences',
  'Business Administration & Finance',
  'Arts, Humanities & Social Sciences',
  'Secondary School Education',
  'General Academic Studies'
];

const EMPTY_FORM = {
  admissionNo: '',
  firstName: '',
  lastName: '',
  fullNameWithInitials: '',
  nicNo: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  district: 'Colombo',
  province: 'Western Province',
  academicStream: 'G.C.E. A/L Physical Science (Combined Maths)',
  guardianName: '',
  guardianPhone: '',
  enrollmentDate: '',
};

export default function StudentForm({ open, student, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (student) {
      setForm({
        admissionNo: student.admissionNo || '',
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        fullNameWithInitials: student.fullNameWithInitials || '',
        nicNo: student.nicNo || '',
        email: student.email || '',
        phone: student.phone || '',
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.substring(0, 10) : '',
        gender: student.gender || '',
        address: student.address || '',
        district: student.district || 'Colombo',
        province: student.province || 'Western Province',
        academicStream: student.academicStream || 'G.C.E. A/L Physical Science (Combined Maths)',
        guardianName: student.guardianName || '',
        guardianPhone: student.guardianPhone || '',
        enrollmentDate: student.enrollmentDate ? student.enrollmentDate.substring(0, 10) : '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [student, open]);

  const validate = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!form.gender) newErrors.gender = 'Gender is required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          {student ? 'Edit Student Record' : 'Register New Student'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          EduNexus Student Directory & Profile Management
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ mb: 1.5 }}>
          1. Student Identification & Academic Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Admission / Index No"
              name="admissionNo"
              placeholder="e.g. ST/2026/001"
              value={form.admissionNo}
              onChange={handleChange}
              helperText="Auto-generated if left blank"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              error={!!errors.firstName}
              helperText={errors.firstName}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              error={!!errors.lastName}
              helperText={errors.lastName}
              required
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Full Name with Initials"
              name="fullNameWithInitials"
              placeholder="e.g. K.M. Kasun Bandara"
              value={form.fullNameWithInitials}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="National ID (NIC)"
              name="nicNo"
              placeholder="e.g. 200318501244 or 991234567V"
              value={form.nicNo}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Academic Stream / Grade</InputLabel>
              <Select
                name="academicStream"
                value={form.academicStream}
                onChange={handleChange}
                label="Academic Stream / Grade"
              >
                {ACADEMIC_STREAMS.map((st) => (
                  <MenuItem key={st} value={st}>
                    {st}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Enrollment Date"
              name="enrollmentDate"
              type="date"
              value={form.enrollmentDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2.5 }} />

        <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ mb: 1.5 }}>
          2. Personal & Geographic Demographics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Contact Phone"
              name="phone"
              placeholder="+94 77 123 4567"
              value={form.phone}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth error={!!errors.gender} required>
              <InputLabel>Gender</InputLabel>
              <Select name="gender" value={form.gender} onChange={handleChange} label="Gender">
                <MenuItem value="MALE">Male</MenuItem>
                <MenuItem value="FEMALE">Female</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>District / Region</InputLabel>
              <Select name="district" value={form.district} onChange={handleChange} label="District / Region">
                {DISTRICTS_REGIONS.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Province / State</InputLabel>
              <Select name="province" value={form.province} onChange={handleChange} label="Province / State">
                {PROVINCES_STATES.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Residential Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2.5 }} />

        <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ mb: 1.5 }}>
          3. Parent / Guardian Contact Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Parent / Guardian Name"
              name="guardianName"
              value={form.guardianName}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Guardian Contact Phone"
              name="guardianPhone"
              placeholder="+94 71 888 1234"
              value={form.guardianPhone}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {saving ? 'Saving...' : student ? 'Update Student Record' : 'Complete Registration'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
