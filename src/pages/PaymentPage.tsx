import React, { useState, useEffect, Fragment, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';

interface Payment {
  id: number;
  Name: string;
  "Block & Lot": string;
  "Payment Amount": number;
  "Penalty Amount"?: number | null;
  "Date of Payment": string;
  Status: string;
  receipt_path: string;
  ar_receipt_path?: string;
  notified?: boolean;
  Project: string;
  "Payment Type"?: string;
  "Month of Payment": string;
  "MONTHS PAID"?: number | null;
  "Reference Number"?: string;
}

interface ViewReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptUrl: string | null;
  isLoading: boolean;
  payment: Payment | null;
}

interface UploadPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: () => void;
}

const ViewReceiptModal: React.FC<ViewReceiptModalProps> = ({ isOpen, onClose, receiptUrl, isLoading, payment }) => {
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
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => {
                        if (receiptUrl && payment) {
                          const printWindow = window.open('', '_blank');
                          if (printWindow) {
                            printWindow.document.write(`
                              <!DOCTYPE html>
                              <html>
                                <head>
                                  <title>Payment Receipt</title>
                                  <style>
                                    @media print {
                                      @page { 
                                        margin: 0;
                                        size: A4 portrait;
                                      }
                                      body { 
                                        margin: 1cm;
                                        -webkit-print-color-adjust: exact;
                                        print-color-adjust: exact;
                                      }
                                    }
                                    @page {
                                      size: A4;
                                      margin: 0;
                                    }
                                    body {
                                      font-family: Arial, sans-serif;
                                      line-height: 1.4;
                                      color: #333;
                                      width: 210mm;
                                      min-height: 297mm;
                                      margin: 0 auto;
                                      padding: 15mm;
                                      box-sizing: border-box;
                                    }
                                    .receipt-header {
                                      text-align: center;
                                      padding: 10px 0;
                                      margin-bottom: 15px;
                                      border-bottom: 2px solid #2563eb;
                                    }
                                    .receipt-header h2 {
                                      margin: 0;
                                      color: #2563eb;
                                      font-size: 20px;
                                      font-weight: bold;
                                    }
                                    .client-details {
                                      width: 100%;
                                      margin-bottom: 15px;
                                      padding: 15px;
                                      background: #f8fafc;
                                      border: 1px solid #e2e8f0;
                                      border-radius: 4px;
                                    }
                                    .detail-row {
                                      display: flex;
                                      align-items: center;
                                      margin-bottom: 6px;
                                      font-size: 13px;
                                    }
                                    .detail-row:last-child {
                                      margin-bottom: 0;
                                      padding-top: 6px;
                                      border-top: 1px solid #e2e8f0;
                                    }
                                    .detail-label {
                                      color: #1e40af;
                                      font-weight: 600;
                                      width: 180px;
                                      flex-shrink: 0;
                                    }
                                    .detail-value {
                                      flex-grow: 1;
                                    }
                                    .receipt-image-container {
                                      width: 100%;
                                      text-align: center;
                                      max-height: calc(297mm - 140mm);
                                      overflow: hidden;
                                    }
                                    .receipt-image {
                                      width: 65%;
                                      height: auto;
                                      max-height: calc(297mm - 150mm);
                                      object-fit: contain;
                                      border: 1px solid #e2e8f0;
                                      border-radius: 4px;
                                      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                                    }
                                  </style>
                                </head>
                                <body onload="window.print();window.close()">
                                  <div class="container">
                                    <div class="receipt-header">
                                      <h2>Payment Receipt</h2>
                                    </div>
                                    <div class="client-details">
                                      <div class="detail-row">
                                        <div class="detail-label">Name:</div>
                                        <div class="detail-value">${payment.Name}</div>
                                      </div>
                                      <div class="detail-row">
                                        <div class="detail-label">Block & Lot:</div>
                                        <div class="detail-value">${payment['Block & Lot']}</div>
                                      </div>
                                      <div class="detail-row">
                                        <div class="detail-label">Project:</div>
                                        <div class="detail-value">${payment.Project}</div>
                                      </div>
                                      <div class="detail-row">
                                        <div class="detail-label">Date:</div>
                                        <div class="detail-value">${payment['Date of Payment']}</div>
                                      </div>
                                      <div class="detail-row">
                                        <div class="detail-label">Payment For The Month Of:</div>
                                        <div class="detail-value">${payment['Month of Payment'] || 'N/A'}</div>
                                      </div>
                                      <div class="detail-row">
                                        <div class="detail-label">Amount:</div>
                                        <div class="detail-value">₱${payment['Payment Amount'].toLocaleString()}</div>
                                      </div>
                                    </div>
                                    <div class="receipt-image-container">
                                      <img src="${receiptUrl}" class="receipt-image" alt="Receipt" />
                                    </div>
                                  </div>
                                </body>
                              </html>
                            `);
                            printWindow.document.close();
                          }
                        }
                      }}
                      className="text-blue-600 hover:text-blue-700 focus:outline-none p-1.5 rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!receiptUrl}
                      title="Print Receipt"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                    </button>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none p-1.5 hover:bg-gray-100 rounded-md"
                      title="Close"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </Dialog.Title>

                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : receiptUrl ? (
                  <div className="relative max-h-[80vh] overflow-hidden flex items-center justify-center">
                    <img
                      src={receiptUrl}
                      className="max-w-full max-h-[75vh] object-contain rounded-lg"
                      alt="Payment Receipt"
                      style={{ margin: 'auto' }} />
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

const UploadPaymentModal: React.FC<UploadPaymentModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedName, setSelectedName] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedBlockLot, setSelectedBlockLot] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [penalty, setPenalty] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [paymentMonth, setPaymentMonth] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedName || !selectedProject || !selectedBlockLot || !amount || !paymentDate || !paymentMonth || !referenceNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUploading(true);

    try {

      const fileExt = file.name.split('.').pop() || '';
      const timestamp = new Date().getTime();
      const fileName = `${selectedName.trim()}_${timestamp}.${fileExt}`;
      const filePath = `${selectedProject}/${selectedName.trim()}/${fileName}`;

      toast.loading('Uploading receipt...');
      const { error: uploadError, data } = await supabase.storage
        .from('Payment Receipt')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload receipt: ${uploadError.message}`);
      }

      if (!data?.path) {
        throw new Error('No file path returned from upload');
      }

      toast.loading('Saving payment details...');
      const { error: dbError } = await supabase
        .from('Payment')
        .insert([{
          "receipt_path": filePath,
          "Block & Lot": selectedBlockLot,
          "Payment Amount": parseFloat(amount),
          "Penalty Amount": penalty ? parseFloat(penalty) : null,
          "Date of Payment": paymentDate,
          "Month of Payment": paymentMonth,
          "Name": selectedName,
          "Project": selectedProject,
          "Status": "Pending",
          "Reference Number": referenceNumber,
          created_at: new Date().toISOString()
        }]);

      if (dbError) {
        throw new Error(`Error saving payment information: ${dbError.message}`);
      }

      toast.success('Payment uploaded successfully!');
      onUpload();
      onClose();
    } catch (err: any) {
      console.error('Error uploading payment:', err);
      toast.error(err.message);
    } finally {
      setIsUploading(false);
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Upload Payment
                </Dialog.Title>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={selectedName}
                      onChange={(e) => setSelectedName(e.target.value)}
                      placeholder="Enter client name..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project *
                    </label>
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      disabled={!selectedName}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Project</option>
                      <option value="Living Water Subdivision">Living Water Subdivision</option>
                      <option value="Havahills Estate">Havahills Estate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Block & Lot *
                    </label>
                    <select
                      value={selectedBlockLot}
                      onChange={(e) => setSelectedBlockLot(e.target.value)}
                      disabled={!selectedProject}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Block & Lot</option>
                      <option value="Block 1 Lot 1">Block 1 Lot 1</option>
                      <option value="Block 1 Lot 2">Block 1 Lot 2</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Amount *
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Enter payment amount"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reference Number *
                    </label>
                    <input
                      type="text"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Enter reference number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Penalty (if applicable)
                    </label>
                    <input
                      type="number"
                      value={penalty}
                      onChange={(e) => setPenalty(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Enter penalty amount"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Payment *
                    </label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Month of Payment *
                    </label>
                    <input
                      type="date"
                      value={paymentMonth}
                      onChange={(e) => setPaymentMonth(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Receipt Image *
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                              <span>Upload a file</span>
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 border-t border-gray-200">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    onClick={handleUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      'Upload Payment'
                    )}
                  </button>
                </div>
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
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const projects = [
    'all',
    'Living Water Subdivision',
    'Havahills Estate'
  ];

  const handleUploadReceipt = async (payment: Payment, file: File, isAR: boolean = false) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${payment.Name.replace(/\s+/g, '_')}_${isAR ? 'AR_' : ''}${Date.now()}.${fileExt}`;
      const filePath = `${payment.Project}/${payment.Name}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(isAR ? 'ar-receipt' : 'Payment Receipt')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('Payment')
        .update({ 
          [isAR ? 'ar_receipt_path' : 'receipt_path']: filePath 
        })
        .eq('id', payment.id);

      if (updateError) throw updateError;

      toast.success(`${isAR ? 'AR' : ''} Receipt uploaded successfully`);
      await fetchAllPayments();
    } catch (error) {
      console.error('Error uploading receipt:', error);
      toast.error('Failed to upload receipt');
    }
  };

  const handleViewReceipt = async (payment: Payment, isAR: boolean = false) => {
    if (!payment?.Name) {
      toast.error('Payment information not found');
      return;
    }

    setIsLoadingReceipt(true);
    setIsReceiptModalOpen(true);
    setReceiptUrl(null);
    setViewingPayment(payment);

    try {
      const receiptPath = isAR ? payment.ar_receipt_path : payment.receipt_path;
      if (!receiptPath) {
        toast.error('Receipt not found');
        setIsLoadingReceipt(false);
        return;
      }

      const { data, error } = await supabase.storage
        .from(isAR ? 'ar-receipt' : 'Payment Receipt')
        .download(receiptPath);

      if (error) {
        console.error('Error downloading receipt:', error);
        toast.error('Failed to download receipt');
        setIsLoadingReceipt(false);
        return;
      }

      if (data instanceof Blob) {
        const objectUrl = URL.createObjectURL(data);
        setReceiptUrl(objectUrl);

        const cleanup = () => {
          URL.revokeObjectURL(objectUrl);
          setReceiptUrl(null);
          setViewingPayment(null);
        };

        return cleanup;
      }
    } catch (err) {
      console.error('Error viewing receipt:', err);
      toast.error('Failed to view receipt. Please try again later.');
    } finally {
      setIsLoadingReceipt(false);
    }
  };

  useEffect(() => {
    fetchAllPayments();
    setupRealtimeSubscription();
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch = payment.Name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProject = selectedProject === 'all' || payment.Project === selectedProject;
      return matchesSearch && matchesProject;
    });
  }, [payments, searchTerm, selectedProject]);



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
      
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const handleConfirmPayment = async (payment: Payment) => {
    try {
      const { error } = await supabase
        .from('Payment')
        .update({ Status: 'Approved' })
        .eq('id', payment.id);

      if (error) throw error;
      
      toast.success('Payment confirmed successfully');
      await fetchAllPayments(); // Refresh the payments list
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to confirm payment');
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
            <div className="w-48">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-48 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                {projects.map((project) => (
                  <option key={project} value={project}>
                    {project === 'all' ? 'All Projects' : project}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload Payment
            </button>
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
                  <thead className="sticky top-0 bg-[#0A0D50] z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[10%]">Payment Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[15%]">Payment For The Month Of</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[10%]">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[10%]">Reference Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[10%]">Project</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[10%]">Block & Lot</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[10%]">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[10%]">Penalty Amount</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider w-[10%]">Client Receipt</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider w-[10%]">AR Receipt</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider w-[10%]">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[10%]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments.map((payment, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(payment["Date of Payment"]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment["Month of Payment"] ? new Date(payment["Month of Payment"]).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.Name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment["Reference Number"] || 'N/A'}
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
                              className={`text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors duration-200 flex items-center space-x-2 ${
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
                          ) : payment.Status === "Approved" ? (
                            <>
                              <input
                                type="file"
                                id={`receipt-upload-${payment.id}`}
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleUploadReceipt(payment, file, false);
                                  }
                                }}
                              />
                              <button
                                onClick={() => document.getElementById(`receipt-upload-${payment.id}`)?.click()}
                                className="text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-md transition-colors duration-200 flex items-center space-x-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <span>Upload Receipt</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-gray-400">No receipt</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {payment.ar_receipt_path ? (
                            <button
                              onClick={() => handleViewReceipt(payment, true)}
                              disabled={isLoadingReceipt}
                              className={`text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors duration-200 flex items-center space-x-2 ${
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
                              <span>{isLoadingReceipt ? 'Loading...' : 'View AR'}</span>
                            </button>
                          ) : payment.Status === "Approved" ? (
                            <>
                              <input
                                type="file"
                                id={`ar-receipt-upload-${payment.id}`}
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleUploadReceipt(payment, file, true);
                                  }
                                }}
                              />
                              <button
                                onClick={() => document.getElementById(`ar-receipt-upload-${payment.id}`)?.click()}
                                className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors duration-200 flex items-center space-x-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <span>Upload AR</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-gray-400">No AR receipt</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">

                          {payment.Status === "Pending" && (
                            <button
                              onClick={() => handleConfirmPayment(payment)}
                              className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors duration-200"
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
            setViewingPayment(null);
          }}
          receiptUrl={receiptUrl}
          isLoading={isLoadingReceipt}
          payment={viewingPayment}
        />



        {/* Upload Payment Modal */}
        <UploadPaymentModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={fetchAllPayments}
        />
      </div>
    </div>
  );
};

export default PaymentPage;
