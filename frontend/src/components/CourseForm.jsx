import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  CircularProgress,
  Typography,
} from '@mui/material';

const EMPTY_FORM = {
  courseName: '',
  courseCode: '',
  description: '',
  credits: '',
  duration: '',
};

export default function CourseForm({ open, course, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (course) {
      setForm({
        courseName: course.courseName || '',
        courseCode: course.courseCode || '',
        description: course.description || '',
        credits: course.credits !== undefined ? String(course.credits) : '',
        duration: course.duration || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [course, open]);

  const validate = () => {
    const newErrors = {};
    if (!form.courseName.trim()) newErrors.courseName = 'Course name is required';
    if (!form.courseCode.trim()) newErrors.courseCode = 'Course code is required';
    if (!form.credits) {
      newErrors.credits = 'Credits is required';
    } else if (isNaN(Number(form.credits)) || Number(form.credits) <= 0) {
      newErrors.credits = 'Credits must be a positive number';
    }
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
      await onSave({ ...form, credits: Number(form.credits) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          {course ? 'Edit Course' : 'Add New Course'}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Course Name"
              name="courseName"
              value={form.courseName}
              onChange={handleChange}
              error={!!errors.courseName}
              helperText={errors.courseName}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Course Code"
              name="courseCode"
              value={form.courseCode}
              onChange={handleChange}
              error={!!errors.courseCode}
              helperText={errors.courseCode}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Credits"
              name="credits"
              type="number"
              value={form.credits}
              onChange={handleChange}
              error={!!errors.credits}
              helperText={errors.credits}
              required
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Duration (e.g. 3 months)"
              name="duration"
              value={form.duration}
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
          {saving ? 'Saving...' : course ? 'Update Course' : 'Add Course'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
