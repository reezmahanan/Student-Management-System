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
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAllFees, createInvoice, markFeeAsPaid, deleteFee } from '../api/feeApi';
import { getAllStudents } from '../api/studentApi';

const STATUS_COLOR_MAP = {
  PAID: 'success',
  PENDING: 'warning',
  OVERDUE: 'error',
  CANCELLED: 'default',
};

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [studentId, setStudentId] = useState('');
  const [title, setTitle] = useState('Tuition Fee - Semester 1');
  const [amount, setAmount] = useState('1200.00');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10));
  const [notes, setNotes] = useState('');

  const loadData = () => {
    setLoading(true);
    getAllFees()
      .then((res) => setFees(res.data?.data || res.data || []))
      .catch(() => setError('Failed to load fees'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    getAllStudents(0, 100).then((res) => {
      const list = res.data?.data?.content || res.data?.content || res.data || [];
      setStudents(list);
      if (list.length > 0) setStudentId(list[0].id);
    });
  }, []);

  const handleCreateInvoice = async () => {
    if (!studentId || !title || !amount || !dueDate) {
      setError('Please provide all required invoice details.');
      return;
    }

    try {
      await createInvoice({
        studentId,
        title,
        amount: parseFloat(amount),
        dueDate,
        notes,
      });

      setSuccess('Invoice created successfully!');
      setDialogOpen(false);
      loadData();
    } catch {
      setError('Failed to create invoice.');
    }
  };

  const handlePay = async (feeId) => {
    try {
      await markFeeAsPaid(feeId, 'ONLINE_CARD');
      setSuccess('Payment recorded successfully!');
      loadData();
    } catch {
      setError('Failed to record payment.');
    }
  };

  const handleDelete = async (feeId) => {
    try {
      await deleteFee(feeId);
      loadData();
    } catch {
      setError('Failed to delete fee record.');
    }
  };

  const totalCollected = fees
    .filter((f) => f.status === 'PAID')
    .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  const totalPending = fees
    .filter((f) => f.status === 'PENDING' || f.status === 'OVERDUE')
    .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h4" fontWeight={700}>
            Fee & Tuition Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Invoicing, online payment collection, and institutional dues tracking
          </Typography>
        </div>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          disabled={students.length === 0}
        >
          Create Invoice
        </Button>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Typography variant="caption" color="success.dark" fontWeight={600}>
                TOTAL COLLECTED
              </Typography>
              <Typography variant="h4" fontWeight={700} color="success.dark">
                ${totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography variant="caption" color="warning.dark" fontWeight={600}>
                TOTAL PENDING / OVERDUE
              </Typography>
              <Typography variant="h4" fontWeight={700} color="warning.dark">
                ${totalPending.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Typography variant="caption" color="primary.dark" fontWeight={600}>
                TOTAL INVOICES ISSUED
              </Typography>
              <Typography variant="h4" fontWeight={700} color="primary.dark">
                {fees.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Fees Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Invoice #</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Student</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Description</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Amount</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Due Date</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No fee invoices issued yet. Click "Create Invoice" to start!
                </TableCell>
              </TableRow>
            ) : (
              fees.map((f) => (
                <TableRow key={f.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{f.invoiceNumber}</TableCell>
                  <TableCell>{f.studentName}</TableCell>
                  <TableCell>{f.title}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>${parseFloat(f.amount).toFixed(2)}</TableCell>
                  <TableCell>{f.dueDate}</TableCell>
                  <TableCell>
                    <Chip
                      label={f.status}
                      size="small"
                      color={STATUS_COLOR_MAP[f.status] || 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    {f.status !== 'PAID' && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handlePay(f.id)}
                        sx={{ mr: 1 }}
                      >
                        Mark Paid
                      </Button>
                    )}
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(f.id)}>
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

      {/* Create Invoice Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Issue New Student Invoice</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Student</InputLabel>
                <Select value={studentId} label="Select Student" onChange={(e) => setStudentId(e.target.value)}>
                  {students.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={8}>
              <TextField
                label="Invoice Title / Description"
                fullWidth
                size="small"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Amount ($)"
                type="number"
                fullWidth
                size="small"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Due Date"
                type="date"
                fullWidth
                size="small"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Payment Notes"
                fullWidth
                size="small"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateInvoice}>
            Issue Invoice
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
