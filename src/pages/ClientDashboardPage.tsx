import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import PageTransition from '../components/PageTransition';
import { DocumentTextIcon, UserCircleIcon, ArrowDownTrayIcon, BellIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

// Define types
interface Client {
  id: number;
  Name: string;
  Email: string;
  auth_id: string;
}

interface Document {
  id: number;
  Name: string;
  'TIN ID': string;
  Email: string;
  'Contact No': string;
  'Marital Status': string;
  created_at: string;
  file_url?: string;
}

const ClientDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<{id: number, message: string, date: string}[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          navigate('/login');
          return;
        }
        
        // Get client info using auth_id
        const { data: clientData, error: clientError } = await supabase
          .from('Clients')
          .select('*')
          .eq('auth_id', data.session.user.id)
          .single();
        
        if (clientError || !clientData) {
          throw new Error('Client not found');
        }
        
        setClient(clientData);
        
        // Get client documents
        const { data: docsData, error: docsError } = await supabase
          .from('Documents')
          .select('*')
          .eq('Name', clientData.Name);
        
        if (docsError) throw docsError;
        
        setDocuments(docsData || []);
        
        // Mock notifications for demo
        setNotifications([
          { id: 1, message: 'Your document has been approved', date: '2025-02-25' },
          { id: 2, message: 'Please upload your latest utility bill', date: '2025-02-24' },
          { id: 3, message: 'Welcome to Omni Portal!', date: '2025-02-23' }
        ]);
      } catch (err: any) {
        console.error('Error loading client dashboard:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };
  
  const handleDownloadDocument = async (document: Document) => {
    // In a real app, you would download the document from storage
    alert(`Downloading document: ${document.Name}`);
  };
  
  // Loading state UI
  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading your dashboard</h2>
            <p className="text-gray-500 text-center">Please wait while we retrieve your information...</p>
          </div>
        </div>
      </PageTransition>
    );
  }
  
  // Error state UI  
  if (error) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full">
            <div className="bg-red-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3 text-center">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-5 text-center">{error}</p>
            <div className="flex justify-center">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }
  
  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        {/* Modern header with gradient */}
        <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-md p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-blue-600 mr-3">
                <UserCircleIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">{client?.Name}</h1>
                <p className="text-sm text-blue-100">{client?.Email}</p>
              </div>
            </div>
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button 
                className="md:hidden p-2 rounded-full text-white hover:bg-white/10 transition mr-2"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"} />
                </svg>
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-full hover:bg-white/10 transition relative"
                >
                  <BellIcon className="h-6 w-6 text-white" />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                      {notifications.length}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl overflow-hidden z-20">
                    <div className="py-2 px-3 bg-gray-50 border-b">
                      <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map(notification => (
                        <div key={notification.id} className="px-4 py-3 border-b hover:bg-gray-50 transition">
                          <p className="text-sm text-gray-800">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                onClick={handleLogout}
                className="ml-2 p-2 rounded-full hover:bg-white/10 transition"
                aria-label="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        </header>
        
        {/* Main content with improved container */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* Welcome card with gradient accent */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <UserCircleIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back, {client?.Name.split(' ')[0]}!</h2>
                <p className="text-gray-600">Here's an overview of your documents and status.</p>
              </div>
            </div>
            
            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Documents</p>
                <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.floor(documents.length * 0.7)}
                </p>
              </div>
              <div className="hidden md:block bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium">Notifications</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
            </div>
          </div>
          
          {/* Documents section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <DocumentTextIcon className="h-6 w-6 mr-2 text-blue-500" />
              Your Documents
            </h2>
            
            {documents.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 mb-4">No documents found.</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  Upload Your First Document
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {documents.map(doc => (
                  <div key={doc.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between">
                      <div className="w-full">
                        <div className="flex items-start mb-3">
                          <div className="bg-blue-100 rounded-lg p-2 mr-3">
                            <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{doc.Name}</h3>
                            <div className="flex flex-wrap gap-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                TIN: {doc['TIN ID'].substring(0, 8)}...
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {doc['Marital Status']}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-500 mt-2 space-y-1">
                          <p>Email: {doc.Email}</p>
                          <p>Contact: {doc['Contact No']}</p>
                          <p className="text-xs text-gray-400">
                            Created: {new Date(doc.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <button 
                            onClick={() => handleDownloadDocument(doc)}
                            className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Quick actions with improved design */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 p-6 gap-4">
              <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition text-blue-700">
                <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                  <DocumentTextIcon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">Upload Document</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition text-green-700">
                <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                  <UserCircleIcon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">Update Profile</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition text-purple-700">
                <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                  <BellIcon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">Notifications</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 transition text-amber-700">
                <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Help & Support</span>
              </button>
            </div>
          </div>
          
          {/* Updated footer */}
          <footer className="mt-auto pt-6">
            <div className="border-t border-gray-200 pt-6 pb-8">
              <div className="flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
                <div className="mb-4 md:mb-0">
                  <p>&copy; 2025 Omni Portal. All rights reserved.</p>
                </div>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-500 hover:text-gray-700 transition">Privacy Policy</a>
                  <a href="#" className="text-gray-500 hover:text-gray-700 transition">Terms of Service</a>
                  <a href="#" className="text-gray-500 hover:text-gray-700 transition">Contact Us</a>
                </div>
              </div>
            </div>
          </footer>
        </main>
        
        {/* Mobile navigation */}
        {menuOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-40 md:hidden">
            <div className="h-full w-64 bg-white p-4 shadow-lg flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Menu</h3>
                <button onClick={() => setMenuOpen(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <nav className="space-y-4">
                <a href="#" className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100">
                  <DocumentTextIcon className="h-5 w-5 mr-3 text-blue-600" />
                  Documents
                </a>
                <a href="#" className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100">
                  <UserCircleIcon className="h-5 w-5 mr-3 text-green-600" />
                  Profile
                </a>
                <a href="#" className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100">
                  <BellIcon className="h-5 w-5 mr-3 text-purple-600" />
                  Notifications
                </a>
                <a href="#" className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 mr-3 text-amber-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                  </svg>
                  Help & Support
                </a>
              </nav>
              
              <div className="mt-auto">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center p-2 text-red-600 rounded-lg hover:bg-red-50"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default ClientDashboardPage;
