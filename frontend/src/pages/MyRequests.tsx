import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_EMPLOYEES, GET_TIME_OFF_REQUESTS, CREATE_TIME_OFF_REQUEST, CANCEL_TIME_OFF_REQUEST, GET_LEAVE_BALANCE } from '../graphql/queries';
import { Employee, TimeOffRequest, LeaveType, LeaveBalance } from '../types';
import { useToast } from '../context/ToastContext';

interface NewRequestModalProps {
  employees: Employee[];
  onClose: () => void;
}

function NewRequestModal({ employees, onClose }: NewRequestModalProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    employeeId: '',
    type: 'VACATION' as LeaveType,
    startDate: '',
    endDate: '',
    reason: '',
  });

  const { data: balanceData } = useQuery<{ leaveBalance: LeaveBalance }>(GET_LEAVE_BALANCE, {
    variables: { employeeId: form.employeeId },
    skip: !form.employeeId,
  });

  const balance = balanceData?.leaveBalance;

  const [createRequest, { loading }] = useMutation(CREATE_TIME_OFF_REQUEST, {
    refetchQueries: [{ query: GET_TIME_OFF_REQUESTS }],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRequest({ variables: { input: { ...form, reason: form.reason || undefined } } });
      showToast('Time off request submitted!');
      onClose();
    } catch (err: any) {
      showToast(err.message ?? 'Failed to submit', 'error');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const balanceForType = () => {
    if (!balance) return null;
    const map: Record<string, number> = {
      VACATION: balance.vacationDays,
      SICK: balance.sickDays,
      PERSONAL: balance.personalDays,
      UNPAID: Infinity,
    };
    return map[form.type];
  };

  const bal = balanceForType();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>New Time Off Request</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Employee *</label>
              <select className="form-select" value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} required>
                <option value="">— Select employee —</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Leave Type *</label>
              <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as LeaveType }))}>
                <option value="VACATION">Vacation</option>
                <option value="SICK">Sick Leave</option>
                <option value="PERSONAL">Personal</option>
                <option value="UNPAID">Unpaid</option>
              </select>
            </div>

            {form.employeeId && balance && form.type !== 'UNPAID' && (
              <div style={{ border: '1px solid var(--gray-200)', padding: '12px 16px', marginBottom: '20px', background: 'var(--gray-100)' }}>
                <div style={{ fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gray-600)', marginBottom: '6px' }}>Available Balance</div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div><span style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>{balance.vacationDays}</span> <span style={{ fontSize: '0.65rem', color: 'var(--gray-600)' }}>vacation</span></div>
                  <div><span style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>{balance.sickDays}</span> <span style={{ fontSize: '0.65rem', color: 'var(--gray-600)' }}>sick</span></div>
                  <div><span style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>{balance.personalDays}</span> <span style={{ fontSize: '0.65rem', color: 'var(--gray-600)' }}>personal</span></div>
                </div>
                {bal !== null && bal !== Infinity && bal === 0 && (
                  <div style={{ marginTop: '8px', fontSize: '0.72rem', color: 'var(--black)', fontWeight: 700 }}>⚠ No {form.type.toLowerCase()} days remaining</div>
                )}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date *</label>
                <input className="form-input" type="date" min={today} value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">End Date *</label>
                <input className="form-input" type="date" min={form.startDate || today} value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reason (optional)</label>
              <textarea className="form-textarea" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Briefly explain the reason..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MyRequestsPage() {
  const { showToast } = useToast();
  const [showNew, setShowNew] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');

  const { data: empData } = useQuery<{ employees: Employee[] }>(GET_EMPLOYEES);
  const { data, loading, error } = useQuery<{ timeOffRequests: TimeOffRequest[] }>(GET_TIME_OFF_REQUESTS, {
    variables: selectedEmployee ? { filters: { employeeId: selectedEmployee } } : {},
  });

  const [cancelRequest] = useMutation(CANCEL_TIME_OFF_REQUEST, {
    refetchQueries: [{ query: GET_TIME_OFF_REQUESTS }],
  });

  const employees = empData?.employees ?? [];
  const requests = data?.timeOffRequests ?? [];

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleCancel = async (req: TimeOffRequest) => {
    if (!confirm('Cancel this request?')) return;
    try {
      await cancelRequest({ variables: { requestId: req.id, employeeId: req.employeeId } });
      showToast('Request cancelled');
    } catch (err: any) {
      showToast(err.message ?? 'Failed to cancel', 'error');
    }
  };

  if (error) return <div className="error-box">✕ {error.message}</div>;

  return (
    <div>
      <div className="page-header">
        <h2>My Requests</h2>
        <p>Submit and track your time off requests</p>
      </div>

      <div className="action-bar">
        <div className="action-bar-left">
          <select
            className="form-select"
            style={{ width: '220px' }}
            value={selectedEmployee}
            onChange={e => setSelectedEmployee(e.target.value)}
          >
            <option value="">All employees</option>
            {employees.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          + New Request
        </button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /> Loading...</div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">◆</div>
          <h3>No requests yet</h3>
          <p>Submit your first time off request using the button above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', border: 'var(--border)' }}>
          {requests.map((req, i) => (
            <div key={req.id} style={{ padding: '20px 24px', borderBottom: i < requests.length - 1 ? '1px solid var(--gray-100)' : 'none', display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span className="leave-type-tag">{req.type}</span>
                  <span className={`badge badge-${req.status.toLowerCase()}`}>{req.status}</span>
                  {req.employee && <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>{req.employee.name}</span>}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>
                  {formatDate(req.startDate)} → {formatDate(req.endDate)}
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: '0.78rem', marginLeft: '10px', color: 'var(--gray-600)' }}>{req.totalDays} working days</span>
                </div>
                {req.reason && <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>"{req.reason}"</div>}
                {req.reviewNote && (
                  <div style={{ marginTop: '6px', fontSize: '0.72rem', padding: '6px 10px', background: 'var(--gray-100)', borderLeft: '3px solid var(--black)' }}>
                    Manager note: {req.reviewNote}
                  </div>
                )}
              </div>
              <div>
                {(req.status === 'PENDING' || req.status === 'APPROVED') && (
                  <button className="btn btn-ghost btn-sm" onClick={() => handleCancel(req)}>Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showNew && <NewRequestModal employees={employees} onClose={() => setShowNew(false)} />}
    </div>
  );
}
