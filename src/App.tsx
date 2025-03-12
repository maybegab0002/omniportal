import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
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
import BalancePage from './pages/BalancePage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import './styles/scrollbar.css';
import './styles/pageTransitions.css';

function App() {
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/client-dashboard" element={<ClientDashboardPage />} />
          <Route path="/admin" element={<AdminDashboardPage />}>
            <Route index element={<DashboardContent />} />
            <Route path="dashboard" element={<DashboardContent />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="payment" element={<PaymentPage />} />
            <Route path="close-deal" element={<CloseDealPage />} />
            <Route path="balance" element={<BalancePage />} />
            <Route path="team-chat" element={<TeamChatPage />} />
            <Route path="ticket" element={<TicketPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;
