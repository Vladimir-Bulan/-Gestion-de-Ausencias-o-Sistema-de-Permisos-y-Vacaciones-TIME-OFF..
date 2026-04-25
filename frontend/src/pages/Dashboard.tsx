import { useQuery } from '@apollo/client';
import { GET_EMPLOYEES, GET_TIME_OFF_REQUESTS } from '../graphql/queries';
import { Employee, TimeOffRequest } from '../types';

export default function Dashboard() {
  const { data: empData } = useQuery<{ employees: Employee[] }>(GET_EMPLOYEES);
  const { data: reqData } = useQuery<{ timeOffRequests: TimeOffRequest[] }>(GET_TIME_OFF_REQUESTS);

  const employees = empData?.employees ?? [];
  const requests = reqData?.timeOffRequests ?? [];

  const pending = requests.filter(r => r.status === 'PENDING').length;
  const approved = requests.filter(r => r.status === 'APPROVED').length;
  const managers = employees.filter(e => e.role === 'MANAGER' || e.role === 'ADMIN').length;

  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const statusBadge = (s: string) => (
    <span className={`badge badge-${s.toLowerCase()}`}>{s}</span>
  );

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your time off management system</p>
      </div>

      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-label">Total Employees</div>
          <div className="stat-value">{employees.length}</div>
          <div className="stat-sub">{managers} managers</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Total Requests</div>
          <div className="stat-value">{requests.length}</div>
          <div className="stat-sub">all time</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Pending Review</div>
          <div className="stat-value">{pending}</div>
          <div className="stat-sub">awaiting decision</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Approved</div>
          <div className="stat-value">{approved}</div>
          <div className="stat-sub">this cycle</div>
        </div>
      </div>

      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Recent Requests
        </div>
      </div>

      {recentRequests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">◇</div>
          <h3>No requests yet</h3>
          <p>Time off requests will appear here once submitted.</p>
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
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map(req => (
                <tr key={req.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{req.employee?.name ?? '—'}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--gray-600)' }}>{req.employee?.email}</div>
                  </td>
                  <td><span className="leave-type-tag">{req.type}</span></td>
                  <td>
                    <div className="date-range">
                      <strong>{formatDate(req.startDate)}</strong>
                      <span style={{ margin: '0 6px', color: 'var(--gray-400)' }}>→</span>
                      <strong>{formatDate(req.endDate)}</strong>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700 }}>{req.totalDays}d</td>
                  <td>{statusBadge(req.status)}</td>
                  <td style={{ color: 'var(--gray-600)', fontSize: '0.75rem' }}>{formatDate(req.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
