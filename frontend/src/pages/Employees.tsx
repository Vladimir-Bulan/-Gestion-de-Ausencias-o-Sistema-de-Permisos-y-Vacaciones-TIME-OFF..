import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_EMPLOYEES, CREATE_EMPLOYEE, REMOVE_EMPLOYEE } from '../graphql/queries';
import { Employee, Role } from '../types';
import { useToast } from '../context/ToastContext';

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

interface CreateEmployeeModalProps {
  employees: Employee[];
  onClose: () => void;
  onCreated: () => void;
}

function CreateEmployeeModal({ employees, onClose, onCreated }: CreateEmployeeModalProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', role: 'EMPLOYEE' as Role, managerId: '' });
  const [createEmployee, { loading }] = useMutation(CREATE_EMPLOYEE, {
    refetchQueries: [{ query: GET_EMPLOYEES }],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEmployee({
        variables: {
          input: {
            name: form.name,
            email: form.email,
            role: form.role,
            ...(form.managerId ? { managerId: form.managerId } : {}),
          },
        },
      });
      showToast(`${form.name} added successfully`);
      onCreated();
      onClose();
    } catch (err: any) {
      showToast(err.message ?? 'Failed to create employee', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>New Employee</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Alice Johnson" />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="alice@wizdaa.com" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select className="form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Manager</label>
                <select className="form-select" value={form.managerId} onChange={e => setForm(f => ({ ...f, managerId: e.target.value }))}>
                  <option value="">— None —</option>
                  {employees.filter(e => e.role === 'MANAGER' || e.role === 'ADMIN').map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  const { showToast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const { data, loading, error, refetch } = useQuery<{ employees: Employee[] }>(GET_EMPLOYEES);
  const [removeEmployee] = useMutation(REMOVE_EMPLOYEE, { refetchQueries: [{ query: GET_EMPLOYEES }] });

  const employees = data?.employees ?? [];
  const filtered = filterRole === 'ALL' ? employees : employees.filter(e => e.role === filterRole);

  const handleDelete = async (emp: Employee) => {
    if (!confirm(`Remove ${emp.name}? This cannot be undone.`)) return;
    try {
      await removeEmployee({ variables: { id: emp.id } });
      showToast(`${emp.name} removed`);
    } catch (err: any) {
      showToast(err.message ?? 'Failed to remove', 'error');
    }
  };

  if (error) return <div className="error-box">✕ {error.message}</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Employees</h2>
        <p>{employees.length} registered · manage your team</p>
      </div>

      <div className="action-bar">
        <div className="action-bar-left">
          <div className="filter-tabs">
            {['ALL', 'EMPLOYEE', 'MANAGER', 'ADMIN'].map(r => (
              <button key={r} className={`filter-tab ${filterRole === r ? 'active' : ''}`} onClick={() => setFilterRole(r)}>
                {r === 'ALL' ? 'All' : r.charAt(0) + r.slice(1).toLowerCase()}
                {r !== 'ALL' && ` (${employees.filter(e => e.role === r).length})`}
              </button>
            ))}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + New Employee
        </button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /> Loading employees...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">◈</div>
          <h3>No employees found</h3>
          <p>Add your first employee to get started.</p>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map(emp => (
            <div key={emp.id} className="employee-card">
              <div className="employee-initials">{getInitials(emp.name)}</div>
              <div className="employee-name">{emp.name}</div>
              <div className="employee-email">{emp.email}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className={`badge badge-${emp.role.toLowerCase()}`}>{emp.role}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(emp)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateEmployeeModal employees={employees} onClose={() => setShowCreate(false)} onCreated={refetch} />
      )}
    </div>
  );
}
