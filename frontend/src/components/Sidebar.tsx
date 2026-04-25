import { useState } from 'react';

type Page = 'dashboard' | 'employees' | 'requests' | 'my-requests';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard',   label: 'Dashboard',    icon: '▪' },
  { id: 'employees',   label: 'Employees',    icon: '◈' },
  { id: 'requests',    label: 'All Requests', icon: '◇' },
  { id: 'my-requests', label: 'My Requests',  icon: '◆' },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [open, setOpen] = useState(false);

  const handleNav = (page: Page) => {
    onNavigate(page);
    setOpen(false);
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <div className="mobile-logo">
          <span>Time Off</span>
          <span className="mobile-logo-sub">Management</span>
        </div>
        <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <span className={`hamburger-line ${open ? 'open-1' : ''}`} />
          <span className={`hamburger-line ${open ? 'open-2' : ''}`} />
          <span className={`hamburger-line ${open ? 'open-3' : ''}`} />
        </button>
      </div>

      {/* Mobile overlay */}
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <h1>Time Off</h1>
          <p>Management System</p>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => handleNav(item.id)}
            >
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
            Wizdaa · v1.0.0
          </div>
        </div>
      </aside>
    </>
  );
}
