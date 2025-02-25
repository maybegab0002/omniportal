import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import DashboardContent from './pages/DashboardContent';
import ClientsPage from './pages/ClientsPage';
import DocumentsPage from './pages/DocumentsPage';
import InventoryPage from './pages/InventoryPage';
import PaymentPage from './pages/PaymentPage';
import CloseDealPage from './pages/CloseDealPage';
import TeamChatPage from './pages/TeamChatPage';
import TicketPage from './pages/TicketPage';

function App() {
  return (
    <Router basename="/omniportal">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminDashboardPage />}>
          <Route path="dashboard" element={<DashboardContent />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="payment" element={<PaymentPage />} />
          <Route path="close-deal" element={<CloseDealPage />} />
          <Route path="team-chat" element={<TeamChatPage />} />
          <Route path="ticket" element={<TicketPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
