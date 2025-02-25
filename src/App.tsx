import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import DashboardContent from './pages/DashboardContent';
import ClientsPage from './pages/ClientsPage';
import InventoryPage from './pages/InventoryPage';
import DocumentsPage from './pages/DocumentsPage';
import PaymentPage from './pages/PaymentPage';
import CloseDealPage from './pages/CloseDealPage';
import TicketPage from './pages/TicketPage';
import TeamChatPage from './pages/TeamChatPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminDashboardPage />}>
        <Route index element={<DashboardContent />} />
        <Route path="dashboard" element={<DashboardContent />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="payment" element={<PaymentPage />} />
        <Route path="close-deal" element={<CloseDealPage />} />
        <Route path="ticket" element={<TicketPage />} />
        <Route path="team-chat" element={<TeamChatPage />} />
      </Route>
    </Routes>
  );
}

export default App;
