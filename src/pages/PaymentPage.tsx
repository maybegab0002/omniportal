import React, { useState, useEffect, Fragment, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';
import { usePayment } from '../contexts/PaymentContext'; // Fixed: contexts instead of context

interface Payment {
  id: number;
  Name: string;
  "Block & Lot": string;
  "Payment Amount": number;
  "Penalty Amount"?: number;
  "Date of Payment": string;
  Status: string;
  receipt_path: string;
  notified?: boolean;
  Project: string;
}

// View Receipt Modal Props
interface ViewReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptUrl: string | null;
  isLoading: boolean;
}

// View Receipt Modal Component
const ViewReceiptModal: React.FC<ViewReceiptModalProps> = ({ isOpen, onClose, receiptUrl, isLoading }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4 flex justify-between items-center">
                  Payment Receipt
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : receiptUrl ? (
                  <div className="relative" style={{ height: '70vh' }}>
                    <iframe
                      src={receiptUrl}
                      className="w-full h-full rounded-lg border border-gray-200"
                      title="Payment Receipt"
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No receipt available
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// Edit Payment Modal Props
interface EditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  onSave: (id: number, updatedPayment: Partial<Payment>) => Promise<void>;
}

// Edit Payment Modal Component
const EditPaymentModal: React.FC<EditPaymentModalProps> = ({ isOpen, onClose, payment, onSave }) => {
  const [formData, setFormData] = useState({
    Name: '',
    "Block & Lot": '',
    "Payment Amount": 0,
    "Penalty Amount": 0,
    "Date of Payment": '',
    Status: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (payment) {
      setFormData({
        Name: payment.Name,
        "Block & Lot": payment["Block & Lot"],
        "Payment Amount": payment["Payment Amount"],
        "Penalty Amount": payment["Penalty Amount"] || 0,
        "Date of Payment": payment["Date of Payment"],
        Status: payment.Status
      });
    }
  }, [payment]);

  const formatDateForInput = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment) return;
    
    setIsLoading(true);
    try {
      await onSave(payment.id, formData);
      onClose();
    } catch (error) {
      console.error('Error saving payment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 text-left align-middle shadow-2xl transition-all border border-gray-100">
                <div className="border-b border-gray-200/80 bg-white/50 backdrop-blur-sm">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900 flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                      <span>Edit Payment Details</span>
                    </Dialog.Title>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 hover:bg-gray-100/50 p-1 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-1 group">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                        Client Name
                      </label>
                      <div className="mt-1 relative rounded-lg shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="name"
                          value={formData.Name}
                          readOnly
                          className="block w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-lg focus:ring-0 focus:border-gray-200 cursor-not-allowed shadow-inner group-hover:bg-gray-50 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="col-span-1 group">
                      <label htmlFor="blockLot" className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                        Block & Lot
                      </label>
                      <div className="mt-1 relative rounded-lg shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="blockLot"
                          value={formData["Block & Lot"]}
                          readOnly
                          className="block w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-lg focus:ring-0 focus:border-gray-200 cursor-not-allowed shadow-inner group-hover:bg-gray-50 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-1 group">
                      <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                        Payment Amount (₱)
                      </label>
                      <div className="mt-1 relative rounded-lg shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-blue-500 font-medium">₱</span>
                        </div>
                        <input
                          type="number"
                          id="paymentAmount"
                          value={formData["Payment Amount"]}
                          onChange={(e) => setFormData(prev => ({ ...prev, "Payment Amount": Number(e.target.value) }))}
                          className="block w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-all duration-200"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="col-span-1 group">
                      <label htmlFor="penaltyAmount" className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                        Penalty Amount (₱)
                      </label>
                      <div className="mt-1 relative rounded-lg shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-red-500 font-medium">₱</span>
                        </div>
                        <input
                          type="number"
                          id="penaltyAmount"
                          value={formData["Penalty Amount"]}
                          onChange={(e) => setFormData(prev => ({ ...prev, "Penalty Amount": Number(e.target.value) }))}
                          className="block w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-all duration-200"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-1 group">
                      <label htmlFor="dateOfPayment" className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                        Date of Payment
                      </label>
                      <div className="mt-1 relative rounded-lg shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <input
                          type="date"
                          id="dateOfPayment"
                          value={formatDateForInput(formData["Date of Payment"])}
                          onChange={(e) => setFormData(prev => ({ ...prev, "Date of Payment": e.target.value }))}
                          className="block w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="col-span-1 group">
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                        Status
                      </label>
                      <div className="mt-1 relative rounded-lg shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <select
                          id="status"
                          value={formData.Status}
                          onChange={(e) => setFormData(prev => ({ ...prev, Status: e.target.value }))}
                          className="block w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-all duration-200 bg-white"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 border border-transparent rounded-lg hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const PaymentPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState<number | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [isEditPaymentModalOpen, setIsEditPaymentModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const { refreshPendingCount } = usePayment(); // Use the refreshPendingCount from context

  useEffect(() => {
    fetchAllPayments();
    setupRealtimeSubscription();
  }, []);

  // Filter payments based on search and status
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch = payment.Name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !selectedStatus || payment.Status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchTerm, selectedStatus]);

  const statuses = ['Pending', 'Approved', 'Rejected'];

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('payment-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Payment'
        },
        () => {
          fetchAllPayments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const fetchAllPayments = async () => {
    setIsLoadingPayments(true);
    try {
      const { data, error } = await supabase
        .from('Payment')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Just set the data directly since Project is already in the Payment table
      setPayments(data || []);
      await refreshPendingCount();
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const handleConfirmPayment = async (payment: Payment) => {
    if (confirmingPayment) return; // Prevent multiple confirmations at once
    
    setConfirmingPayment(payment.id);
    try {
      const { error } = await supabase
        .from('Payment')
        .update({ Status: 'Approved' })
        .eq('id', payment.id);

      if (error) throw error;

      // Update the local state
      setPayments(payments.map(p => 
        p.id === payment.id ? { ...p, Status: 'Approved' } : p
      ));
      
      await refreshPendingCount(); // Refresh the pending count after updating payment status
      toast.success('Payment confirmed successfully');
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to confirm payment');
    } finally {
      setConfirmingPayment(null);
    }
  };

  const handleViewReceipt = async (payment: Payment) => {
    if (!payment?.Name) {
      toast.error('Payment information not found');
      return;
    }

    setIsLoadingReceipt(true);
    setIsReceiptModalOpen(true);
    setReceiptUrl(null);

    try {
      // Get receipt using the path that includes client folder
      const receiptPath = payment.receipt_path;
      console.log('Fetching receipt:', receiptPath);
      
      const { data, error } = await supabase.storage
        .from('Payment Receipt')
        .download(receiptPath);

      if (error) {
        console.error('Error fetching receipt:', error);
        toast.error('Failed to load receipt');
        return;
      }

      if (!data) {
        console.error('Receipt not found');
        toast.error('Receipt not found');
        return;
      }

      // Create a URL for the downloaded file
      const url = URL.createObjectURL(data);
      console.log('Created object URL for receipt:', url);
      setReceiptUrl(url);
      
      // Clean up the URL when the modal is closed
      const cleanup = () => {
        URL.revokeObjectURL(url);
        setReceiptUrl(null);
      };

      return cleanup;
    } catch (err) {
      console.error('Error viewing receipt:', err);
      toast.error('Failed to view receipt. Please try again later.');
    } finally {
      setIsLoadingReceipt(false);
    }
  };

  const handleSavePayment = async (id: number, updatedPayment: Partial<Payment>) => {
    try {
      const { error } = await supabase
        .from('Payment')
        .update(updatedPayment)
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setPayments(payments.map(p => 
        p.id === id ? { ...p, ...updatedPayment } : p
      ));
      
      await refreshPendingCount(); // Refresh the pending count after updating payment status
      toast.success('Payment details updated successfully');
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Failed to update payment details');
      throw error;
    }
  };

  return (
    <div className="min-h-full">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Payment Records</h1>
          <div className="mt-1 flex items-center gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium">{filteredPayments.length}</span>
              <span className="ml-1">records found</span>
            </div>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="mb-6 flex flex-wrap justify-between items-center">
          {/* Search Bar */}
          <div className="w-72">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="w-full h-10 pl-3 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            </div>
          </div>

          {/* Filters Group */}
          <div className="flex items-center gap-4">
            {/* Status Filter */}
            <div className="w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full h-10 pl-3 pr-8 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="">All Status</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="w-full overflow-x-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {isLoadingPayments ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full table-auto divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">Project</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">Block & Lot</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">Penalty Amount</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">Receipt</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[13%]">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments.map((payment, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(payment["Date of Payment"]).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.Project}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment["Block & Lot"]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₱{payment["Payment Amount"].toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment["Penalty Amount"] ? `₱${payment["Penalty Amount"].toLocaleString()}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {payment.receipt_path ? (
                            <button
                              onClick={() => handleViewReceipt(payment)}
                              disabled={isLoadingReceipt}
                              className={`text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors duration-200 flex items-center space-x-2 ${
                                isLoadingReceipt ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {isLoadingReceipt ? (
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                              <span>{isLoadingReceipt ? 'Loading...' : 'View Receipt'}</span>
                            </button>
                          ) : (
                            <span className="text-gray-400">No receipt</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => {
                              setEditingPayment(payment);
                              setIsEditPaymentModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors duration-200"
                          >
                            <span className="flex items-center space-x-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span>Edit</span>
                            </span>
                          </button>
                          {payment.Status === "Pending" && (
                            <button
                              onClick={() => handleConfirmPayment(payment)}
                              disabled={confirmingPayment === payment.id}
                              className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span className="flex items-center space-x-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Confirm</span>
                              </span>
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${payment.Status === "Approved" ? "bg-green-100 text-green-800" : 
                                payment.Status === "Rejected" ? "bg-red-100 text-red-800" : 
                                "bg-yellow-100 text-yellow-800"}`}>
                              {payment.Status}
                            </span>
                            {payment.Status === 'Pending' && !payment.notified && (
                              <span className="ml-2 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No payments found
              </div>
            )}
          </div>
        </div>

        {/* Receipt Viewing Modal */}
        <ViewReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => {
            setIsReceiptModalOpen(false);
            setReceiptUrl(null);
          }}
          receiptUrl={receiptUrl}
          isLoading={isLoadingReceipt}
        />

        {/* Edit Payment Modal */}
        <EditPaymentModal
          isOpen={isEditPaymentModalOpen}
          onClose={() => {
            setIsEditPaymentModalOpen(false);
            setEditingPayment(null);
          }}
          payment={editingPayment}
          onSave={handleSavePayment}
        />
      </div>
    </div>
  );
};

export default PaymentPage;
