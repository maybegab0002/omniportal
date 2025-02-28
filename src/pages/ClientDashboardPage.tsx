import React, { useEffect, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import PageTransition from '../components/PageTransition';
import { UserCircleIcon, BellIcon, ArrowRightOnRectangleIcon, CreditCardIcon, TicketIcon, XMarkIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';

// Define types
interface Client {
  id: number;
  Name: string;
  Email: string;
  Phone: string;
  Address: string;
  'Date Joined': string;
}

interface Balance {
  id: number;
  Amount: number;
  'Months Paid': string;
  Balance: number;
}

// Ticket Submission Modal Props
interface TicketSubmissionModalProps {
  isOpen: boolean;
  closeModal: () => void;
  clientName: string;
}

// Ticket Submission Modal Component
const TicketSubmissionModal: React.FC<TicketSubmissionModalProps> = ({ 
  isOpen, 
  closeModal, 
  clientName
}) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create new ticket in Supabase
      const { error: ticketError } = await supabase
        .from('Tickets')
        .insert([
          {
            Name: clientName,
            Subject: subject,
            Description: description,
            Priority: 'medium', // Default priority
            Status: 'new',
            Assigned: null // Not assigned initially
          }
        ])
        .select();

      if (ticketError) throw ticketError;

      setSuccess(true);
      // Reset form after successful submission
      setTimeout(() => {
        closeModal();
        setSuccess(false);
        setSubject('');
        setDescription('');
      }, 3000);
    } catch (err: any) {
      console.error("Ticket submission error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all modal-scrollbar">
                <div className="absolute top-0 right-0 pt-6 pr-6">
                  <button
                    onClick={closeModal}
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <Dialog.Title
                  as="h3"
                  className="text-xl font-semibold leading-6 text-gray-900"
                >
                  Submit Support Ticket
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Need help? Submit a ticket and our team will get back to you as soon as possible.
                  </p>
                </div>

                {success ? (
                  <div className="mt-6">
                    <div className="rounded-lg bg-green-50 p-6 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <p className="mt-4 text-lg font-semibold text-green-800">Ticket submitted successfully!</p>
                      <p className="mt-2 text-sm text-green-700">Our team will review your request shortly.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    <div className="space-y-6 bg-white">
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium leading-6 text-gray-900">
                          Subject
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                            placeholder="Brief description of your issue"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                          Description
                        </label>
                        <div className="mt-2">
                          <textarea
                            id="description"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                            placeholder="Please provide details about your issue"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                          </>
                        ) : (
                          'Submit Ticket'
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// Payment Receipt Modal Props
interface PaymentReceiptModalProps {
  isOpen: boolean;
  closeModal: () => void;
  clientName: string;
}

// Payment Receipt Modal Component
const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({ 
  isOpen, 
  closeModal, 
  clientName
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Clear form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setDescription('');
      setError(null);
      setSuccess(false);
      setPreviewUrl(null);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file type
      if (!selectedFile.type.includes('image/') && !selectedFile.type.includes('application/pdf')) {
        setError('Please upload an image or PDF file');
        setFile(null);
        return;
      }
      
      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      
      // Create preview for images
      if (selectedFile.type.includes('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        // For PDFs, just show an icon or text
        setPreviewUrl(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!file) {
        throw new Error('Please select a receipt file to upload');
      }

      // 1. Upload file to storage bucket
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${timestamp}.${fileExt}`;
      const filePath = `${clientName}/${fileName}`;
      
      console.log('Uploading payment receipt to path:', filePath);
      
      const { error: uploadError } = await supabase.storage
        .from('Payment Receipt')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      
      console.log('Payment receipt uploaded successfully to:', filePath);

      // 2. Save payment metadata to Payments table
      const { error: dbError } = await supabase
        .from('Payments')
        .insert([
          {
            client_name: clientName,
            description: description || null,
            receipt_path: filePath,
            status: 'pending', // Initial status, admin will verify
            created_at: new Date().toISOString()
          }
        ]);

      if (dbError) throw dbError;

      setSuccess(true);
      // Reset form after successful submission
      setTimeout(() => {
        closeModal();
        setSuccess(false);
        setFile(null);
        setDescription('');
        setPreviewUrl(null);
      }, 3000);
    } catch (err: any) {
      console.error("Payment submission error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all modal-scrollbar">
                <div className="absolute top-0 right-0 pt-6 pr-6">
                  <button
                    onClick={closeModal}
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <Dialog.Title
                  as="h3"
                  className="text-xl font-semibold leading-6 text-gray-900"
                >
                  Upload Payment Receipt
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Please upload your payment receipt and provide the payment details.
                  </p>
                </div>

                {success ? (
                  <div className="mt-6">
                    <div className="rounded-lg bg-green-50 p-6 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <p className="mt-4 text-lg font-semibold text-green-800">Payment receipt submitted successfully!</p>
                      <p className="mt-2 text-sm text-green-700">Our team will verify your payment shortly.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    <div className="space-y-6 bg-white">
                      {/* File Upload Area */}
                      <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                          Payment Receipt
                        </label>
                        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10">
                          <div className="text-center">
                            {previewUrl ? (
                              <div className="mb-4">
                                <img src={previewUrl} alt="Receipt preview" className="mx-auto h-32 w-auto object-contain" />
                              </div>
                            ) : (
                              <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-300" />
                            )}
                            
                            <div className="mt-4 flex text-sm leading-6 text-gray-600">
                              <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                              >
                                <span>Upload a file</span>
                                <input 
                                  id="file-upload" 
                                  name="file-upload" 
                                  type="file" 
                                  className="sr-only"
                                  onChange={handleFileChange}
                                  accept="image/*,application/pdf"
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF or PDF up to 5MB</p>
                            {file && (
                              <p className="mt-2 text-xs text-gray-500">
                                Selected: {file.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                          Description (Optional)
                        </label>
                        <div className="mt-2">
                          <textarea
                            id="description"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                            placeholder="e.g., Monthly payment for February 2025"
                          />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                          </>
                        ) : (
                          'Send Payment'
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const ClientDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [balanceData, setBalanceData] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<{id: number, message: string, date: string}[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // New state for ticket modal
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  // New state for payment receipt modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

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
        
        // Get client balance data
        console.log('Fetching balance data for client:', clientData.Name);
        
        try {
          // Get all records from the Balance table
          const { data: balanceRecords, error: balanceError } = await supabase
            .from('Balance')
            .select('*');
            
          console.log('All balance records:', balanceRecords);
          
          if (balanceError) {
            console.error('Error fetching balance data:', balanceError);
          } else if (balanceRecords && balanceRecords.length > 0) {
            // Find the record that matches the client's name
            // First try exact match (case insensitive)
            let matchedRecord = balanceRecords.find(record => 
              record.Name && record.Name.toLowerCase() === clientData.Name.toLowerCase()
            );
            
            console.log('Exact match found:', matchedRecord);
            
            // If no exact match, try partial match
            if (!matchedRecord) {
              console.log('No exact match found, trying partial match');
              matchedRecord = balanceRecords.find(record => 
                record.Name && 
                (record.Name.toLowerCase().includes(clientData.Name.toLowerCase()) || 
                 clientData.Name.toLowerCase().includes(record.Name.toLowerCase()))
              );
              
              console.log('Partial match found:', matchedRecord);
            }
            
            if (matchedRecord) {
              setBalanceData(matchedRecord);
              console.log('Successfully set balance data:', matchedRecord);
            } else {
              console.log('No matching balance record found for client:', clientData.Name);
            }
          } else {
            console.log('No records found in Balance table');
          }
        } catch (err) {
          console.error('Error in balance data fetch:', err);
        }

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
  
  const handleSignOut = handleLogout;
  
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
                        <div key={notification.id} className="px-4 py-3 border-b hover:bg-gray-50 transition-colors">
                          <p className="text-sm text-gray-800 mb-1 md:text-base">{notification.message}</p>
                          <p className="text-xs text-gray-500">{notification.date}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                onClick={handleSignOut}
                className="ml-2 p-2 rounded-full hover:bg-white/10 transition"
                aria-label="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="pb-8">
            {/* Hero section with gradient background */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg mb-6 overflow-hidden">
              <div className="px-5 py-8 text-white md:px-8 md:py-10">
                <h1 className="text-2xl font-bold mb-2 md:text-3xl">Welcome, {client?.Name}</h1>
                <p className="text-blue-100 mb-5 text-sm md:text-base">Here's your current payment information</p>
                
                {/* Payment details cards - now with a modern design */}
                {balanceData === null ? (
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 text-center">
                    <CreditCardIcon className="h-10 w-10 mx-auto text-white/70 mb-3" />
                    <p className="text-white mb-4 text-sm">No payment details found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-5 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                      <div className="flex items-center mb-3">
                        <div className="bg-white/30 rounded-full p-2 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-base text-white font-medium md:text-lg">Current Balance</p>
                      </div>
                      <p className="text-2xl font-bold text-white md:text-3xl">
                        ₱{balanceData['Balance'] 
                          ? Number(balanceData['Balance']).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          : '0.00'}
                      </p>
                    </div>
                    
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-5 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                      <div className="flex items-center mb-3">
                        <div className="bg-white/30 rounded-full p-2 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <p className="text-base text-white font-medium md:text-lg">Amount Paid</p>
                      </div>
                      <p className="text-2xl font-bold text-white md:text-3xl">
                        ₱{balanceData['Amount']
                          ? Number(balanceData['Amount']).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          : '0.00'}
                      </p>
                    </div>
                    
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-5 transform transition-all duration-300 hover:scale-105 hover:shadow-xl sm:col-span-2 lg:col-span-1">
                      <div className="flex items-center mb-3">
                        <div className="bg-white/30 rounded-full p-2 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-base text-white font-medium md:text-lg">Months Paid</p>
                      </div>
                      <p className="text-2xl font-bold text-white md:text-3xl">{balanceData['Months Paid'] || 'None'}</p>
                    </div>
                  </div>
                )}
                
              </div>
            </div>
            
            {/* Account information - mobile-first design */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 transition-all duration-300 hover:shadow-lg">
              <div className="border-b border-gray-100 px-5 py-3 bg-gray-50 md:px-6 md:py-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center md:text-xl">
                  <UserCircleIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Account Information
                </h2>
              </div>
              <div className="p-4 md:p-6">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                    <dt className="text-xs font-medium text-gray-500 mb-1 md:text-sm">Full name</dt>
                    <dd className="text-base font-semibold text-gray-900 md:text-lg">{client?.Name || 'N/A'}</dd>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                    <dt className="text-xs font-medium text-gray-500 mb-1 md:text-sm">Email address</dt>
                    <dd className="text-base font-semibold text-gray-900 break-all md:text-lg">{client?.Email || 'N/A'}</dd>
                  </div>
                </dl>
              </div>
            </div>
            
            {/* Payment Actions Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 transition-all duration-300 hover:shadow-lg">
              <div className="border-b border-gray-100 px-5 py-3 bg-gray-50 md:px-6 md:py-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center md:text-xl">
                  <CreditCardIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Payment Actions
                </h2>
              </div>
              <div className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-base font-medium text-gray-900 mb-1">Submit Payment Receipt</h3>
                    <p className="text-sm text-gray-500">Upload your payment receipt for verification</p>
                  </div>
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                  >
                    <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
                    Upload Receipt
                  </button>
                </div>
              </div>
            </div>
            
            {/* New Ticket Submission Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 transition-all duration-300 hover:shadow-lg">
              <div className="border-b border-gray-100 px-5 py-3 bg-gray-50 md:px-6 md:py-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center md:text-xl">
                  <TicketIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Support Tickets
                </h2>
              </div>
              <div className="p-4 md:p-6">
                <p className="text-gray-600 mb-4">Need assistance? Submit a support ticket and our team will help you as soon as possible.</p>
                <button
                  onClick={() => setIsTicketModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Ticket
                </button>
              </div>
            </div>

          {/* Footer - simplified */}
          <div className="border-t border-gray-200 pt-4 pb-6 mt-auto text-center">
            <p className="text-xs text-gray-500 md:text-sm">&copy; 2025 Omni Portal</p>
          </div>
          </div>
        </main>
        
        {/* Mobile navigation - simplified for cleaner design */}
        {menuOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-40 md:hidden">
            <div className="h-full w-64 bg-white p-4 shadow-lg flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Menu</h3>
                <button 
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <nav className="space-y-4">
                <a href="#" className="flex items-center p-3 text-gray-700 rounded-xl hover:bg-blue-50 transition-colors">
                  <UserCircleIcon className="h-5 w-5 mr-3 text-blue-600" />
                  Profile
                </a>
                <a href="#" className="flex items-center p-3 text-gray-700 rounded-xl hover:bg-blue-50 transition-colors">
                  <BellIcon className="h-5 w-5 mr-3 text-blue-600" />
                  Notifications
                </a>
                <a href="#" className="flex items-center p-3 text-gray-700 rounded-xl hover:bg-blue-50 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 mr-3 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Help & Support
                </a>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center p-3 text-red-600 rounded-xl hover:bg-red-50 transition-colors mt-8"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                  Sign out
                </button>
              </nav>
            </div>
          </div>
        )}
        
        {/* Ticket Submission Modal */}
        {client && (
          <TicketSubmissionModal
            isOpen={isTicketModalOpen}
            closeModal={() => setIsTicketModalOpen(false)}
            clientName={client.Name}
          />
        )}
        
        {/* Payment Receipt Modal */}
        {client && (
          <PaymentReceiptModal
            isOpen={isPaymentModalOpen}
            closeModal={() => setIsPaymentModalOpen(false)}
            clientName={client.Name}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default ClientDashboardPage;
