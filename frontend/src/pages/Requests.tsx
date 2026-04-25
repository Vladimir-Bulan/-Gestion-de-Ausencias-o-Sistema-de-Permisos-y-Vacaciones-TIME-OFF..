import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_TIME_OFF_REQUESTS, GET_EMPLOYEES, REVIEW_TIME_OFF_REQUEST, CANCEL_TIME_OFF_REQUEST } from '../graphql/queries';
import { TimeOffRequest, Employee, RequestStatus } from '../types';
import { useToast } from '../context/ToastContext';

interface ReviewModalProps {
  request: TimeOffRequest;
  managers: Employee[];
  onClose: () => void;
}

function ReviewModal({ request, managers, onClose }: ReviewModalProps) {
  const { showToast } = useToast();
  const [decision, setDecision] = useState<'APPROVE' | 'REJECT' | ''>('');
  const [reviewedById, setReviewedById] = useState('');
  const [reviewNote, setReviewNote] = useState('');

  const [reviewRequest, { loading }] = useMutation(REVIEW_TIME_OFF_REQUEST, {
    refetchQueries: [{ query: GET_TIME_OFF_REQUESTS }],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision || !reviewedById) return;
    try {
      await reviewRequest({
        variables: {
          input: { requestId: request.id, reviewedById, decision, reviewNote: reviewNote || undefined },
        },
      });
      showToast(`Request ${decision === 'APPROVE' ? 'approved' : 'rejected'} successfully`);
      onClose();
    } catch (err: any) {
      showToast(err.message ?? 'Review failed', 'error');
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Review Request</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="card" style={{ marginBottom: '20px', background: 'var(--gray-100)' }}>
              <div style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray-600)', marginBottom: '8px' }}>Request Details</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>{request.employee?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '12px' }}>{request.employee?.email}</div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <span className="leave-type-tag">{request.type}</span>
                <span style={{ fontSize: '0.78rem' }}>{formatDate(request.startDate)} → {formatDate(request.endDate)}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{request.totalDays} working days</span>
              </div>
              {request.reason && <div style={{ marginTop: '10px', fontSize: '0.78rem', color: 'var(--gray-600)', fontStyle: 'italic' }}>"{request.reason}"</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Decision *</label>
              <div className="decision-buttons">
                <button type="button" className={`decision-btn decision-btn-approve ${decision === 'APPROVE' ? 'selected' : ''}`} onClick={() => setDecision('APPROVE')}>
                  ✓ Approve
                </button>
                <button type="button" className={`decision-btn decision-btn-reject ${decision === 'REJECT' ? 'selected' : ''}`} onClick={() => setDecision('REJECT')}>
                  ✕ Reject
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reviewer (Manager) *</label>
              <select className="form-select" value={reviewedById} onChange={e => setReviewedById(e.target.value)} required>
                <option value="">— Select reviewer —</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Note (optional)</label>
              <textarea className="form-textarea" value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder="Add a note for the employee..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !decision || !reviewedById}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RequestsPage() {
  const { showToast } = useToast();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [reviewingRequest, setReviewingRequest] = useState<TimeOffRequest | null>(null);

  const { data, loading, error } = useQuery<{ timeOffRequests: TimeOffRequest[] }>(GET_TIME_OFF_REQUESTS);
  const { data: empData } = useQuery<{ employees: Employee[] }>(GET_EMPLOYEES);

  const [cancelRequest] = useMutation(CANCEL_TIME_OFF_REQUEST, {
    refetchQueries: [{ query: GET_TIME_OFF_REQUESTS }],
  });

  const requests = data?.timeOffRequests ?? [];
  const managers = (empData?.employees ?? []).filter(e => e.role === 'MANAGER' || e.role === 'ADMIN');

  const statuses: RequestStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
  const filtered = filterStatus === 'ALL' ? requests : requests.filter(r => r.status === filterStatus);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

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
        <h2>All Requests</h2>
        <p>{requests.length} total · {requests.filter(r => r.status === 'PENDING').length} pending review</p>
      </div>

      <div className="filter-tabs">
        <button className={`filter-tab ${filterStatus === 'ALL' ? 'active' : ''}`} onClick={() => setFilterStatus('ALL')}>
          All ({requests.length})
        </button>
        {statuses.map(s => (
          <button key={s} className={`filter-tab ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
            {s.charAt(0) + s.slice(1).toLowerCase()} ({requests.filter(r => r.status === s).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /> Loading requests...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">◇</div>
          <h3>No requests found</h3>
          <p>No {filterStatus !== 'ALL' ? filterStatus.toLowerCase() : ''} requests at the moment.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Period</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(req => (
                <tr key={req.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{req.employee?.name ?? req.employeeId.slice(0, 8)}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--gray-600)' }}>{req.employee?.email}</div>
                  </td>
                  <td><span className="leave-type-tag">{req.type}</span></td>
                  <td>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{formatDate(req.startDate)} → {formatDate(req.endDate)}</div>
                  </td>
                  <td style={{ fontWeight: 700 }}>{req.totalDays}d</td>
                  <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                    {req.reason ?? '—'}
                  </td>
                  <td><span className={`badge badge-${req.status.toLowerCase()}`}>{req.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {req.status === 'PENDING' && (
                        <button className="btn btn-primary btn-sm" onClick={() => setReviewingRequest(req)}>Review</button>
                      )}
                      {(req.status === 'PENDING' || req.status === 'APPROVED') && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleCancel(req)}>Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reviewingRequest && (
        <ReviewModal
          request={reviewingRequest}
          managers={managers}
          onClose={() => setReviewingRequest(null)}
        />
      )}
    </div>
  );
}
