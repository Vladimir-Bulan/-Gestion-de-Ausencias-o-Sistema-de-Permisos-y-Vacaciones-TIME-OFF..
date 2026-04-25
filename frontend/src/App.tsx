import { useState } from 'react';
import { ApolloProvider } from '@apollo/client';
import { client } from './apollo/client';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import EmployeesPage from './pages/Employees';
import RequestsPage from './pages/Requests';
import MyRequestsPage from './pages/MyRequests';

type Page = 'dashboard' | 'employees' | 'requests' | 'my-requests';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':   return <Dashboard />;
      case 'employees':   return <EmployeesPage />;
      case 'requests':    return <RequestsPage />;
      case 'my-requests': return <MyRequestsPage />;
    }
  };

  return (
    <ToastProvider>
      <div className="app-layout">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="main-content">
          {renderPage()}
        </main>
      </div>
    </ToastProvider>
  );
}

export default function App() {
  return (
    <ApolloProvider client={client}>
      <AppContent />
    </ApolloProvider>
  );
}
