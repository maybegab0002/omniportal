import React, { useEffect, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import PageTransition from '../components/PageTransition';
import { UserCircleIcon, ArrowRightOnRectangleIcon, CreditCardIcon, TicketIcon, XMarkIcon, DocumentArrowUpIcon, KeyIcon } from '@heroicons/react/24/outline';
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
  Name: string;
  Block: string;
  Lot: string;
  TCP: number | null;
  Amount: number | null;
  'Months Paid': string | null;
  'Remaining Balance': number | null;
}

// Ticket Submission Modal Props
interface TicketSubmissionModalProps {
  clientName: string;
  isOpen: boolean;
  closeModal: () => void;
  refreshTickets: () => void;
}

// Function to fetch client tickets
const fetchClientTickets = async (clientName: string, supabaseClient: any) => {
  try {
    console.log('Fetching tickets for client:', clientName);
    
    // Fetch tickets from Tickets table
    const { data, error } = await supabaseClient
      .from('Tickets')
      .select('*')
      .eq('Name', clientName)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching tickets:', error);
      return [];
    } else if (data && data.length > 0) {
      console.log('Tickets found:', data);
      return data;
    } else {
      console.log('No tickets found for client:', clientName);
      return [];
    }
  } catch (err) {
    console.error('Error in tickets fetch:', err);
    return [];
  }
};

// Ticket Submission Modal Component
const TicketSubmissionModal: React.FC<TicketSubmissionModalProps> = ({ 
  clientName, 
  isOpen, 
  closeModal, 
  refreshTickets
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
      refreshTickets();
      // Close modal after successful submission
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
  selectedBlock?: string | null;
  selectedLot?: string | null;
  balanceRecords: Balance[];
}

// Payment Receipt Modal Component
const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({ 
  isOpen, 
  closeModal, 
  clientName,
  selectedBlock,
  selectedLot,
  balanceRecords
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>('');
  const [selectedBlockLot, setSelectedBlockLot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Set initial selected block and lot
  useEffect(() => {
    if (selectedBlock && selectedLot) {
      setSelectedBlockLot(`Block ${selectedBlock} Lot ${selectedLot}`);
    } else if (balanceRecords.length > 0) {
      const firstRecord = balanceRecords[0];
      setSelectedBlockLot(`Block ${firstRecord.Block} Lot ${firstRecord.Lot}`);
    }
  }, [selectedBlock, selectedLot, balanceRecords]);

  // Clear form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setDescription('');
      setSelectedBlockLot(null);
      setError(null);
      setSuccess(false);
      setPreviewUrl(null);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
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

      // 2. Save payment metadata to Payment table
      const { error: dbError } = await supabase
        .from('Payment')
        .insert([
          {
            Name: clientName,
            Description: description || null,
            receipt_path: filePath,
            Status: 'pending', // Initial status, admin will verify
            Block: selectedBlockLot ? selectedBlockLot.split(' ')[1] : null,
            Lot: selectedBlockLot ? selectedBlockLot.split(' ')[3] : null,
            created_at: new Date().toISOString()
          }
        ]);

      if (dbError) {
        console.error('Error saving payment metadata:', dbError);
        setError(`Error saving payment information: ${dbError.message}`);
        setLoading(false);
        return;
      }

      setSuccess(true);
      
      // Close modal after successful submission
      setTimeout(() => {
        closeModal();
        setSuccess(false);
        setFile(null);
        setDescription('');
        setSelectedBlockLot(null);
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
                    Please upload your payment receipt.
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
                      {/* Block and Lot Selection */}
                      <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                          Select Block and Lot
                        </label>
                        <div className="relative">
                          <select
                            id="block-lot-selector"
                            value={selectedBlockLot || ''}
                            onChange={(e) => setSelectedBlockLot(e.target.value)}
                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                          >
                            {balanceRecords.map((record, index) => (
                              <option 
                                key={index} 
                                value={`Block ${record.Block} Lot ${record.Lot}`}
                              >
                                Block {record.Block} Lot {record.Lot}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* File Upload Area */}
                      <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                          Payment Receipt
                        </label>
                        <div 
                          className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                              processFile(e.dataTransfer.files[0]);
                            }
                          }}
                        >
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
                        <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                          Description
                        </label>
                        <div className="mt-2">
                          <textarea
                            id="description"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                            placeholder="Please provide a brief description of your payment"
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

// Change Password Modal Props
interface ChangePasswordModalProps {
  isOpen: boolean;
  closeModal: () => void;
  userId: string;
  onSuccess: () => void;
}

// Change Password Modal Component
const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ 
  isOpen, 
  closeModal, 
  userId,
  onSuccess
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Update password in Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      // Update the first_login flag in the Clients table
      const updateData: Record<string, boolean> = {
        'first_login': false
      };
      
      console.log('Updating client with data:', updateData);
      
      const { error: clientUpdateError } = await supabase
        .from('Clients')
        .update(updateData)
        .eq('auth_id', userId);

      if (clientUpdateError) {
        console.error('Error updating client first login status:', clientUpdateError);
        throw clientUpdateError;
      }

      setSuccess(true);
      
      // Close modal after successful password change
      setTimeout(() => {
        closeModal();
        setSuccess(false);
        setNewPassword('');
        setConfirmPassword('');
        onSuccess();
      }, 3000);
    } catch (err: any) {
      console.error("Password change error:", err);
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
                <Dialog.Title
                  as="h3"
                  className="text-xl font-semibold leading-6 text-gray-900"
                >
                  Change Your Password
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    For security reasons, please change your temporary password to a new password that only you know.
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
                      <p className="mt-4 text-lg font-semibold text-green-800">Password changed successfully!</p>
                      <p className="mt-2 text-sm text-green-700">You can now use your new password for future logins.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    <div className="space-y-6 bg-white">
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium leading-6 text-gray-900">
                          New Password
                        </label>
                        <div className="mt-2">
                          <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                            placeholder="Enter your new password"
                            required
                          />
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Password must be at least 6 characters
                        </p>
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900">
                          Confirm Password
                        </label>
                        <div className="mt-2">
                          <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                            placeholder="Confirm your new password"
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

                    <div className="mt-6 flex justify-between">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                      >
                        Change Later
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Changing Password...
                          </>
                        ) : (
                          'Change Password'
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
  const [balanceRecords, setBalanceRecords] = useState<Balance[]>([]);
  const [selectedLot, setSelectedLot] = useState<string | null>(null);
  const [selectedBalanceData, setSelectedBalanceData] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  // New state for ticket modal
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  // New state for payment receipt modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  // State for client document information
  const [clientDocument, setClientDocument] = useState<any>(null);
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  // State for change password modal
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [userId, setUserId] = useState<string>('');
  // State for client tickets
  const [clientTickets, setClientTickets] = useState<any[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  // Helper function to check if a value is empty (null, undefined, empty string, or zero)
  const isEmpty = (value: any): boolean => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (typeof value === 'number' && value === 0) return true;
    return false;
  };

  // Helper function to safely parse a numeric value from various formats
  const safelyParseNumber = (value: any): number | null => {
    if (isEmpty(value)) return null;
    
    try {
      // If it's already a number, return it
      if (typeof value === 'number') return value;
      
      // If it's a string, try to parse it
      if (typeof value === 'string') {
        // Remove any non-numeric characters except decimal point and minus sign
        const cleanedValue = value.replace(/[^\d.-]/g, '');
        const parsedValue = parseFloat(cleanedValue);
        return isNaN(parsedValue) ? null : parsedValue;
      }
      
      // For other types, try to convert to number
      const numValue = Number(value);
      return isNaN(numValue) ? null : numValue;
    } catch (e) {
      console.error('Error parsing number:', e);
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          navigate('/login');
          return;
        }
        
        // Set the user ID
        setUserId(data.session.user.id);
        
        // Get client info using auth_id
        const { data: clientData, error: clientError } = await supabase
          .from('Clients')
          .select('*')
          .eq('auth_id', data.session.user.id)
          .single();
        
        if (clientError || !clientData) {
          console.error('Client not found error:', clientError);
          throw new Error('Client not found');
        }
        
        console.log('Client data retrieved:', clientData);
        console.log('Client data keys:', Object.keys(clientData));
        setClient(clientData);
        
        // Check if this is the client's first login
        let firstLoginValue = null;
        
        // Check for both field names and handle different data types
        if ('first_login' in clientData) {
          firstLoginValue = clientData.first_login;
          console.log('Found first_login field:', firstLoginValue);
        } 
        // Check for first-login (hyphen version)
        else if ('first-login' in clientData) {
          firstLoginValue = clientData['first-login'];
          console.log('Found first-login field:', firstLoginValue);
        }
        
        // Determine if this is the first login
        // If the field doesn't exist or is null/undefined, assume it's the first login
        // If it's a boolean false, it's not the first login
        // If it's a string "false", it's not the first login
        const isFirstTimeLogin = 
          firstLoginValue === null || 
          firstLoginValue === undefined || 
          (firstLoginValue !== false && firstLoginValue !== "false");
        
        console.log('Is first time login?', isFirstTimeLogin);
        
        // If it's the first login, show the change password modal
        if (isFirstTimeLogin) {
          setIsChangePasswordModalOpen(true);
        }
        
        // Get client balance data
        console.log('Fetching balance data for client:', clientData.Name);
        
        try {
          // Get all records from the Balance table
          const { data: allBalanceRecords, error: balanceError } = await supabase
            .from('Balance')
            .select('*');
            
          console.log('All balance records:', allBalanceRecords);
          
          if (balanceError) {
            console.error('Error fetching balance data:', balanceError);
          } else if (allBalanceRecords && allBalanceRecords.length > 0) {
            console.log('Raw balance records:', allBalanceRecords);
            
            // Find all records that match the client's name
            // First try exact match (case insensitive)
            let matchedRecords = allBalanceRecords.filter(record => 
              record.Name && record.Name.toLowerCase() === clientData.Name.toLowerCase()
            );
            
            console.log('Exact matches found:', matchedRecords);
            console.log('Client name to match:', clientData.Name);
            
            // If no exact matches, try partial matches
            if (matchedRecords.length === 0) {
              console.log('No exact matches found, trying partial matches');
              matchedRecords = allBalanceRecords.filter(record => 
                record.Name && 
                (record.Name.toLowerCase().includes(clientData.Name.toLowerCase()) || 
                 clientData.Name.toLowerCase().includes(record.Name.toLowerCase()))
              );
              
              console.log('Partial matches found:', matchedRecords);
            }
            
            if (matchedRecords.length > 0) {
              // Log each record before processing
              matchedRecords.forEach((record, index) => {
                console.log(`Record ${index} before processing:`, record);
                console.log(`Record ${index} TCP type:`, typeof record.TCP, 'Value:', record.TCP);
                console.log(`Record ${index} Amount type:`, typeof record.Amount, 'Value:', record.Amount);
                console.log(`Record ${index} Remaining Balance type:`, typeof record['Remaining Balance'], 'Value:', record['Remaining Balance']);
              });
              
              // Ensure all numeric fields are properly converted
              const processedRecords = matchedRecords.map(record => {
                const processed = {
                  ...record,
                  Block: String(record.Block),
                  Lot: String(record.Lot),
                  TCP: safelyParseNumber(record.TCP),
                  Amount: safelyParseNumber(record.Amount),
                  'Remaining Balance': safelyParseNumber(record['Remaining Balance'])
                };
                console.log('Record after processing:', processed);
                return processed;
              });
              
              console.log('Processed records:', processedRecords);
              setBalanceRecords(processedRecords);
              
              // Set the first record as the default selected
              const firstLot = `Block ${processedRecords[0].Block} Lot ${processedRecords[0].Lot}`;
              console.log('Setting default selected lot to:', firstLot);
              setSelectedLot(firstLot);
              setSelectedBalanceData(processedRecords[0]);
              
              console.log('Successfully set balance data:', processedRecords);
            } else {
              console.log('No matching balance records found for client:', clientData.Name);
            }
          } else {
            console.log('No records found in Balance table');
          }
        } catch (err) {
          console.error('Error in balance data fetch:', err);
        }

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
  
  // Function to fetch client document information
  const fetchClientDocument = async () => {
    if (!client) return;
    
    setIsLoadingDocument(true);
    try {
      console.log("Fetching document for client:", client.Name);
      
      // Fetch document information from Documents table
      const { data, error } = await supabase
        .from('Documents')
        .select('*')
        .eq('Name', client.Name);
      
      console.log("Document query result:", { data, error });
      
      if (error) {
        console.error('Error fetching document:', error);
        setClientDocument(null);
      } else if (data && data.length > 0) {
        console.log('Document data found:', data[0]);
        setClientDocument(data[0]);
      } else {
        console.log('No document found for client:', client.Name);
        setClientDocument(null);
      }
    } catch (err) {
      console.error('Error in document fetch:', err);
      setClientDocument(null);
    } finally {
      setIsLoadingDocument(false);
    }
  };

  // Function to get document URL from storage
  const getDocumentUrl = async (clientName: string) => {
    try {
      console.log("Getting document URL for client:", clientName);
      
      // Sanitize the client name to match the upload format
      const sanitizedClientName = clientName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
        .replace(/[^a-zA-Z0-9]/g, '_');   // Replace non-alphanumeric with underscore
      
      console.log("Sanitized client name:", sanitizedClientName);
      
      // List all files in the bucket
      const { data: files, error } = await supabase.storage
        .from('Clients Document')
        .list();
        
      if (error) {
        console.error("Error listing files:", error);
        throw error;
      }
      
      console.log('All files in bucket:', files);
      
      // Find files that match this client's sanitized name pattern
      const clientFiles = files.filter(file => 
        file.name.startsWith(sanitizedClientName + '_')
      );
      
      console.log('Files found for client:', clientFiles);
      
      if (clientFiles && clientFiles.length > 0) {
        // Use the first file that matches
        const filePath = clientFiles[0].name;
        console.log('Using file:', filePath);
        
        const { data } = await supabase.storage
          .from('Clients Document')
          .getPublicUrl(filePath);

        console.log("Public URL:", data.publicUrl);
        return data.publicUrl;
      } else {
        console.error('No files found for this client.');
        return null;
      }
    } catch (error) {
      console.error('Error getting document URL:', error);
      return null;
    }
  };

  // Function to handle document download
  const handleViewDocument = async () => {
    if (!clientDocument) return;
    
    try {
      console.log("Attempting to view document for client:", clientDocument.Name);
      const url = await getDocumentUrl(clientDocument.Name);
      
      if (url) {
        console.log("Opening document URL:", url);
        window.open(url, '_blank');
      } else {
        console.error("Document URL not found");
        alert('Document not found. Please contact support.');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('Error accessing document. Please try again later.');
    }
  };

  // Call fetchClientDocument when client data is available
  useEffect(() => {
    if (client) {
      fetchClientDocument();
    }
  }, [client]);
  
  // Handle lot selection change
  const handleLotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setSelectedLot(selectedValue);
    
    console.log('Selected value:', selectedValue);
    console.log('All balance records:', balanceRecords);
    
    // Find the balance record that matches the selected lot
    const selectedOption = selectedValue.match(/Block (\d+) Lot (\d+)/);
    
    if (selectedOption) {
      const [_, block, lot] = selectedOption;
      console.log(`Looking for Block: ${block}, Lot: ${lot}`);
      
      // Find the exact matching record by comparing as strings to ensure exact matches
      const matchedRecord = balanceRecords.find(record => 
        String(record.Block) === String(block) && String(record.Lot) === String(lot)
      );
      
      console.log('Matched record:', matchedRecord);
      
      if (matchedRecord) {
        // Log the data types to debug NaN issues
        console.log('TCP type:', typeof matchedRecord.TCP, 'Value:', matchedRecord.TCP);
        console.log('Amount type:', typeof matchedRecord.Amount, 'Value:', matchedRecord.Amount);
        console.log('Remaining Balance type:', typeof matchedRecord['Remaining Balance'], 'Value:', matchedRecord['Remaining Balance']);
        
        // Create a processed copy with properly handled numeric values
        const processedRecord = {
          ...matchedRecord,
          // Keep the original values but ensure they're properly processed when displayed
        };
        
        console.log('Setting selected balance data to:', processedRecord);
        setSelectedBalanceData(processedRecord);
      }
    }
  };
  
  // Function to fetch client tickets
  const fetchClientTicketsForComponent = async () => {
    if (!client) return;
    
    setIsLoadingTickets(true);
    try {
      const tickets = await fetchClientTickets(client.Name, supabase);
      setClientTickets(tickets);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setClientTickets([]);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  // Call fetchClientTickets when client data is available
  useEffect(() => {
    if (client) {
      fetchClientDocument();
      fetchClientTicketsForComponent();
    }
  }, [client]);
  
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
            <div className="bg-red-100 rounded-full p-3 w-12 h-12 flex items-center justify-center text-red-600 mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3 text-center">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-5 text-center">{error}</p>
            <div className="flex justify-center">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 014 3.7M4.031 9.865a8.25 8.25 0 014 3.7l3.181-3.182m0-4.991v4.99" />
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
                
                {/* Lot selector dropdown - only show if there are multiple lots */}
                {balanceRecords.length > 1 && (
                  <div className="mb-6">
                    <label htmlFor="lot-selector" className="block mb-2 text-lg font-medium text-white items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                      </svg>
                      Select Block and Lot
                    </label>
                    <div className="relative">
                      <select
                        id="lot-selector"
                        value={selectedLot || ''}
                        onChange={handleLotChange}
                        className="w-full md:w-auto appearance-none px-4 py-3 bg-gradient-to-r from-blue-800 to-blue-700 text-white text-lg font-medium rounded-lg border-2 border-white/30 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 pr-10 transition-all duration-300 hover:shadow-xl hover:border-white/50"
                        style={{ color: 'white', backgroundColor: '#1e40af' }}
                      >
                        {balanceRecords.map((record, index) => (
                          <option 
                            key={index} 
                            value={`Block ${record.Block} Lot ${record.Lot}`}
                          >
                            Block {record.Block} Lot {record.Lot}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                        <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Payment details cards - now with a modern design */}
                {selectedBalanceData === null ? (
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 text-center">
                    <CreditCardIcon className="h-10 w-10 mx-auto text-white/70 mb-3" />
                    <p className="text-white mb-4 text-sm">No payment details found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Property Details Card */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-5 transform transition-all duration-300 hover:scale-105 hover:shadow-xl sm:col-span-2 lg:col-span-3 mb-4">
                      <div className="flex items-center mb-3">
                        <div className="bg-white/30 rounded-full p-2 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                        <p className="text-base text-white font-medium md:text-lg">Property Details</p>
                      </div>
                      <div className="flex flex-wrap justify-between">
                        <div className="mb-2 mr-4">
                          <p className="text-sm text-white/70">Block</p>
                          <p className="text-xl font-bold text-white">{selectedBalanceData.Block}</p>
                        </div>
                        <div className="mb-2 mr-4">
                          <p className="text-sm text-white/70">Lot</p>
                          <p className="text-xl font-bold text-white">{selectedBalanceData.Lot}</p>
                        </div>
                        <div className="mb-2">
                          <p className="text-sm text-white/70">Total Contract Price (TCP)</p>
                          <p className="text-xl font-bold text-white">
                            {(() => {
                              try {
                                // Check if the value exists
                                if (isEmpty(selectedBalanceData.TCP)) {
                                  return 'N/A';
                                }
                                
                                // Try to convert to number if it's a string
                                const num = safelyParseNumber(selectedBalanceData.TCP);
                                if (num === null) {
                                  return 'N/A';
                                }
                                return `₱${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
                              } catch (e) {
                                console.error('Error formatting TCP:', e);
                                return 'N/A';
                              }
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Current Balance Card */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-5 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                      <div className="flex items-center mb-3">
                        <div className="bg-white/30 rounded-full p-2 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-base text-white font-medium md:text-lg">Remaining Balance</p>
                      </div>
                      <p className="text-2xl font-bold text-white md:text-3xl">
                        {(() => {
                          try {
                            // Check if the value exists
                            if (isEmpty(selectedBalanceData['Remaining Balance'])) {
                              return 'N/A';
                            }
                            
                            // Try to convert to number if it's a string
                            const num = safelyParseNumber(selectedBalanceData['Remaining Balance']);
                            if (num === null) {
                              return 'N/A';
                            }
                            return `₱${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
                          } catch (e) {
                            console.error('Error formatting Remaining Balance:', e);
                            return 'N/A';
                          }
                        })()}
                      </p>
                    </div>
                    
                    {/* Amount Paid Card */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-5 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                      <div className="flex items-center mb-3">
                        <div className="bg-white/30 rounded-full p-2 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                          </svg>
                        </div>
                        <p className="text-base text-white font-medium md:text-lg">Amount Paid</p>
                      </div>
                      <p className="text-2xl font-bold text-white md:text-3xl">
                        {(() => {
                          try {
                            // Check if the value exists
                            if (isEmpty(selectedBalanceData['Amount'])) {
                              return 'N/A';
                            }
                            
                            // Try to convert to number if it's a string
                            const num = safelyParseNumber(selectedBalanceData['Amount']);
                            if (num === null) {
                              return 'N/A';
                            }
                            return `₱${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
                          } catch (e) {
                            console.error('Error formatting Amount:', e);
                            return 'N/A';
                          }
                        })()}
                      </p>
                    </div>
                    
                    {/* Months Paid Card */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-5 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                      <div className="flex items-center mb-3">
                        <div className="bg-white/30 rounded-full p-2 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-base text-white font-medium md:text-lg">Months Paid</p>
                      </div>
                      <p className="text-lg font-bold text-white md:text-xl">{selectedBalanceData['Months Paid'] || 'None'}</p>
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
            
            {/* Client Document Information Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 transition-all duration-300 hover:shadow-lg">
              <div className="border-b border-gray-100 px-5 py-3 bg-gray-50 md:px-6 md:py-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center md:text-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  My Document Information
                </h2>
              </div>
              <div className="p-4 md:p-6">
                {isLoadingDocument ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : clientDocument ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {Object.entries(clientDocument)
                        .filter(([key, value]) => 
                          key !== 'Name' && 
                          key !== 'id' && 
                          key !== 'created_at' &&
                          value !== null && 
                          value !== ''
                        )
                        .map(([key, value], index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-3">
                            <h3 className="text-sm font-medium text-gray-500">
                              {key === 'TIN ID' ? 'TIN ID' : 
                               key === 'Contact No' ? 'Contact Number' : 
                               key === 'Marital Status' ? 'Marital Status' : 
                               key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h3>
                            <p className="mt-1 text-base text-gray-900">{String(value)}</p>
                          </div>
                        ))}
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={handleViewDocument}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                        disabled={!clientDocument}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        View Document
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500 mb-2">No document information found</p>
                    <p className="text-sm text-gray-400">Your document information will appear here once uploaded by an administrator.</p>
                  </div>
                )}
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
                <p className="text-gray-600 mb-4">Upload your payment receipt for verification and processing.</p>
                <div className="flex flex-col items-start">
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-gray-400 text-white rounded-md text-sm font-medium cursor-not-allowed opacity-50 transition-colors shadow-sm"
                    disabled
                  >
                    <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
                    Upload Receipt
                  </button>
                  <span className="text-xs text-blue-600 font-medium mt-1">Coming Soon!</span>
                </div>
              </div>
            </div>
            
            {/* Support Tickets Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 transition-all duration-300 hover:shadow-lg">
              <div className="border-b border-gray-100 px-5 py-3 bg-gray-50 md:px-6 md:py-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center md:text-xl">
                  <TicketIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Support Tickets
                </h2>
              </div>
              <div className="p-4 md:p-6">
                <p className="text-gray-600 mb-4">Need assistance? Submit a support ticket and our team will help you as soon as possible.</p>
                <div className="flex flex-col items-start">
                  <button
                    onClick={() => setIsTicketModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create New Ticket
                  </button>
                </div>
                
                {/* Client Tickets List */}
                <div className="mt-4">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">Your Support Tickets</h3>
                  
                  {isLoadingTickets ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : clientTickets.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {clientTickets.map((ticket, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{ticket.Subject}</h4>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ticket.Description}</p>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${ticket.Status === 'new' ? 'bg-blue-100 text-blue-800' : 
                                  ticket.Status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 
                                  ticket.Status === 'resolved' ? 'bg-green-100 text-green-800' : 
                                  'bg-gray-100 text-gray-800'}`}
                              >
                                {ticket.Status === 'new' ? 'New' : 
                                 ticket.Status === 'in_progress' ? 'In Progress' : 
                                 ticket.Status === 'resolved' ? 'Resolved' : 
                                 ticket.Status === 'closed' ? 'Closed' : 
                                 ticket.Status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      <p className="text-gray-500 mb-2">No support tickets found</p>
                      <p className="text-sm text-gray-400">Your submitted tickets will appear here.</p>
                    </div>
                  )}
                </div>
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
                <button
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  className="flex w-full items-center p-3 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <KeyIcon className="h-5 w-5 mr-3" />
                  Change Password
                </button>
              </nav>
            </div>
          </div>
        )}
        
        {/* Ticket Submission Modal */}
        {client && (
          <TicketSubmissionModal
            clientName={client.Name}
            isOpen={isTicketModalOpen}
            closeModal={() => setIsTicketModalOpen(false)}
            refreshTickets={fetchClientTicketsForComponent}
          />
        )}
        
        {/* Payment Receipt Modal */}
        {client && (
          <PaymentReceiptModal
            isOpen={isPaymentModalOpen}
            closeModal={() => setIsPaymentModalOpen(false)}
            clientName={client.Name}
            selectedBlock={selectedBalanceData?.Block}
            selectedLot={selectedBalanceData?.Lot}
            balanceRecords={balanceRecords}
          />
        )}
        
        {/* Change Password Modal */}
        {client && (
          <ChangePasswordModal
            isOpen={isChangePasswordModalOpen}
            closeModal={() => setIsChangePasswordModalOpen(false)}
            userId={userId}
            onSuccess={() => setIsChangePasswordModalOpen(false)}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default ClientDashboardPage;
