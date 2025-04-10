import React, { useState, useEffect, Fragment, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition, Combobox } from '@headlessui/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import toast from 'react-hot-toast';
import { usePayment } from '../contexts/PaymentContext'; // Fixed: contexts instead of context

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

// View Receipt Modal Props
interface ViewReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptUrl: string | null;
  isLoading: boolean;
  payment: Payment | null;
}

// View Receipt Modal Component
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

// Edit Payment Modal Props
interface Balance {
  id: number;
  Name: string;
  Block: string;
  Lot: string;
  Project: string;
  "MONTHS PAID"?: number | null;
}

interface UploadPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: () => void;
}

// Upload Payment Modal Component
const UploadPaymentModal: React.FC<UploadPaymentModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedName, setSelectedName] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedBlockLot, setSelectedBlockLot] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [penalty, setPenalty] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<Date | null>(null);
  const [paymentMonth, setPaymentMonth] = useState<Date | null>(null);
  const [balanceRecords, setBalanceRecords] = useState<Balance[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Group balance records by name and project
  const [nameQuery, setNameQuery] = useState('');

  const clientProjects = useMemo(() => {
    const grouped = balanceRecords.reduce((acc, record) => {
      if (!acc[record.Name]) {
        acc[record.Name] = {};
      }
      if (!acc[record.Name][record.Project]) {
        acc[record.Name][record.Project] = [];
      }
      acc[record.Name][record.Project].push(record);
      return acc;
    }, {} as { [key: string]: { [key: string]: Balance[] } });
    return grouped;
  }, [balanceRecords]);

  const sortedClientNames = useMemo(() => {
    return Object.keys(clientProjects).sort((a, b) => a.localeCompare(b));
  }, [clientProjects]);

  const filteredClientNames = useMemo(() => {
    return sortedClientNames.filter(name =>
      name.toLowerCase().includes(nameQuery.toLowerCase())
    );
  }, [sortedClientNames, nameQuery]);

  // Fetch balance records
  useEffect(() => {
    const fetchBalances = async () => {
      const { data, error } = await supabase
        .from('Balance')
        .select('*');

      if (error) {
        console.error('Error fetching balances:', error);
        return;
      }

      setBalanceRecords(data || []);
    };

    if (isOpen) {
      fetchBalances();
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setSelectedName('');
      setSelectedProject('');
      setSelectedBlockLot('');
      setAmount('');
      setPenalty('');
      setReferenceNumber('');
      setPaymentDate(null);
      setPaymentMonth(null);
      setPreviewUrl(null);
      setError(null);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const formatToLocalDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
  };

  const formatToMonthStart = (date: Date | null) => {
    if (!date) return null;
    return new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0);
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setError(null);

    try {
      if (!file || !selectedName || !selectedProject || !selectedBlockLot || !amount || !paymentDate || !paymentMonth || !referenceNumber) {
        throw new Error('Please fill in all required fields');
      }

      // Create folder path for client's receipts
      const fileExt = file.name.split('.').pop();
      const paymentDateFormatted = paymentDate ? new Date(paymentDate).toISOString().split('T')[0] : '';
      const blockLotFormatted = selectedBlockLot?.replace(/\s+/g, '').replace('Block', '').replace('Lot', '-') || '';
      const timestamp = new Date().getTime();
      const fileName = `${paymentDateFormatted}_${blockLotFormatted}_${timestamp}.${fileExt}`;
      const filePath = `${selectedName.trim()}/${fileName}`;
      
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
          "Date of Payment": formatToLocalDate(paymentDate)?.toISOString(),
          "Month of Payment": formatToMonthStart(paymentMonth)?.toISOString(),
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
      setError(err.message);
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
                  {/* Client Name */}
                  <div className="col-span-2">
                    <Combobox
                      as="div"
                      value={selectedName}
                      onChange={(value: string) => {
                        setSelectedName(value || '');
                        setSelectedProject('');
                        setSelectedBlockLot('');
                      }}
                    >
                      <Combobox.Label className="block text-sm font-medium text-gray-700 mb-2">
                        Client Name *
                      </Combobox.Label>
                      <div className="relative">
                        <Combobox.Input
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          onChange={(event) => setNameQuery(event.target.value)}
                          displayValue={(name: string) => name}
                          placeholder="Search client name..."
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center px-2">
                          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </Combobox.Button>

                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                          afterLeave={() => setNameQuery('')}
                        >
                          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {filteredClientNames.length === 0 && nameQuery !== '' ? (
                              <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                Nothing found.
                              </div>
                            ) : (
                              filteredClientNames.map((name) => (
                                <Combobox.Option
                                  key={name}
                                  value={name}
                                  className={({ active }) =>
                                    `relative cursor-default select-none py-2 pl-4 pr-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-900'}`
                                  }
                                >
                                  {name}
                                </Combobox.Option>
                              ))
                            )}
                          </Combobox.Options>
                        </Transition>
                      </div>
                    </Combobox>
                  </div>

                  {/* Project */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project *
                    </label>
                    <select
                      value={selectedProject}
                      onChange={(e) => {
                        setSelectedProject(e.target.value);
                        setSelectedBlockLot('');
                      }}
                      disabled={!selectedName}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Project</option>
                      {selectedName && Object.keys(clientProjects[selectedName] || {}).map((project) => (
                        <option key={project} value={project}>{project}</option>
                      ))}
                    </select>
                  </div>

                  {/* Block & Lot */}
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
                      {selectedName && selectedProject &&
                        clientProjects[selectedName][selectedProject].map((record) => (
                          <option key={`${record.Block}-${record.Lot}`} value={`Block ${record.Block} Lot ${record.Lot}`}>
                            Block {record.Block} Lot {record.Lot}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Reference Number */}
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

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount *
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Enter amount"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Penalty */}
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

                  {/* Date of Payment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Payment *
                    </label>
                    <DatePicker
                      selected={paymentDate}
                      onChange={(date) => setPaymentDate(date)}
                      dateFormat="MMMM d, yyyy"
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholderText="Select date"
                      maxDate={new Date()}
                    />
                  </div>

                  {/* Month of Payment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Month of Payment *
                    </label>
                    <DatePicker
                      selected={paymentMonth}
                      onChange={(date) => setPaymentMonth(date)}
                      dateFormat="MMMM yyyy"
                      showMonthYearPicker
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholderText="Select month"
                    />
                  </div>

                  {/* Receipt Upload */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Receipt Image *
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        {previewUrl ? (
                          <div className="relative">
                            <img src={previewUrl} alt="Receipt preview" className="mx-auto h-32 object-contain" />
                            <button
                              onClick={() => {
                                setFile(null);
                                setPreviewUrl(null);
                              }}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <>
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                              <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                <span>Upload a file</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileChange}
                                  className="sr-only"
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                    {error}
                  </div>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      'Upload'
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

interface EditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

// Edit Payment Modal Component
const EditPaymentModal: React.FC<EditPaymentModalProps> = ({ isOpen, onClose, payment }) => {
  const [formData, setFormData] = useState({
    Name: '',
    "Block & Lot": '',
    "Payment Amount": 0,
    "Penalty Amount": null as number | null,
    "Date of Payment": '',
    "Payment Type": '',
    "MONTHS PAID": null as number | null,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (payment) {
      setFormData({
        Name: payment.Name,
        "Block & Lot": payment["Block & Lot"],
        "Payment Amount": payment["Payment Amount"],
        "Penalty Amount": payment["Penalty Amount"] || null,
        "Date of Payment": payment["Date of Payment"] || '',
        "Payment Type": payment["Payment Type"] || '',
        "MONTHS PAID": payment["MONTHS PAID"] || null,
      });
    }
  }, [payment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment) return;
    
    setIsLoading(true);
    try {
      // Split the Block & Lot to match with Balance table
      const [blockNumber, lotNumber] = payment["Block & Lot"].split(' Lot ');
      const block = blockNumber.replace('Block ', '');
      const lot = lotNumber;

      // Format the current date as YYYY-MM-DD
      const currentDate = new Date().toISOString().split('T')[0];

      // Create a new Payment Record
      const { error: createPaymentRecordError } = await supabase
        .from('Payment Record')
        .insert({
          "Project": payment.Project,
          "Block": block,
          "Lot": lot,
          "Name": payment.Name,
          "Amount": formData["Payment Amount"],
          "Penalty": formData["Penalty Amount"],
          "Payment Type": formData["Payment Type"],
          "Date": currentDate
        });

      if (createPaymentRecordError) throw createPaymentRecordError;

      // Update the Payment table
      const { error: updatePaymentError } = await supabase
        .from('Payment')
        .update({
          "Project": payment.Project,
          "Payment Type": formData["Payment Type"],
          "Payment Amount": formData["Payment Amount"],
          "Penalty Amount": formData["Penalty Amount"],
          "Date of Payment": currentDate,
          "MONTHS PAID": formData["MONTHS PAID"]
        })
        .eq('id', payment.id);

      if (updatePaymentError) throw updatePaymentError;

      toast.success('Payment confirmed and recorded successfully!');
      onClose();
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to confirm payment: ' + error.message);
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
                <form onSubmit={handleSubmit}>
                  <div className="border-b border-gray-200/80 bg-white/50 backdrop-blur-sm">
                    <div className="px-6 py-4 flex items-center justify-between">
                      <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900 flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                        </svg>
                        <span>Confirm Payment</span>
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

                  <div className="px-6 py-4 space-y-6">
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
                        <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                          Payment Type
                        </label>
                        <div className="mt-1 relative rounded-lg shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h5a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <select
                            id="paymentType"
                            value={formData["Payment Type"]}
                            onChange={(e) => setFormData(prev => ({ ...prev, "Payment Type": e.target.value }))}
                            className="block w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-all duration-200 bg-white"
                          >
                            <option value="">Select Payment Type</option>
                            <option value="CASH">CASH</option>
                            <option value="SB-HRM">SB-HRM</option>
                            <option value="SB-LWS">SB-LWS</option>
                            <option value="SB-HHE">SB-HHE</option>
                            <option value="CBS-LWS">CBS-LWS</option>
                            <option value="CBS-HHE">CBS-HHE</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-span-1 group">
                        <label htmlFor="monthsPaid" className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                          MONTHS PAID
                        </label>
                        <div className="mt-1 relative rounded-lg shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h5a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <input
                            type="number"
                            id="monthsPaid"
                            value={formData["MONTHS PAID"] ?? ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, "MONTHS PAID": e.target.value ? Number(e.target.value) : null }))}
                            className="block w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min="0"
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
                            className="block w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                            value={formData["Penalty Amount"] ?? ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, "Penalty Amount": e.target.value ? Number(e.target.value) : null }))}
                            className="block w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                            type="text"
                            id="dateOfPayment"
                            value={formData["Date of Payment"]}
                            onChange={(e) => setFormData(prev => ({ ...prev, "Date of Payment": e.target.value }))}
                            placeholder="e.g. November 2023 - December 2024"
                            className="block w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-500 border border-transparent rounded-lg hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Confirming...
                          </span>
                        ) : 'Confirm'}
                      </button>
                    </div>
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
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null);
  const [isEditPaymentModalOpen, setIsEditPaymentModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const projects = [
    'all',
    'Living Water Subdivision',
    'Havahills Estate'
  ];
  const { refreshPendingCount } = usePayment(); // Use the refreshPendingCount from context

  const handleUploadReceipt = async (payment: Payment, file: File, isAR: boolean = false) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${payment.Name.replace(/\s+/g, '_')}_${isAR ? 'AR_' : ''}${Date.now()}.${fileExt}`;
      const filePath = `${payment.Project}/${payment.Name}/${fileName}`;

      // Upload the file to the appropriate bucket
      const { error: uploadError } = await supabase.storage
        .from(isAR ? 'ar-receipt' : 'Payment Receipt')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Update the payment record with the receipt path
      const { error: updateError } = await supabase
        .from('Payment')
        .update({ 
          [isAR ? 'ar_receipt_path' : 'receipt_path']: filePath 
        })
        .eq('id', payment.id);

      if (updateError) throw updateError;

      toast.success(`${isAR ? 'AR' : ''} Receipt uploaded successfully`);
      await fetchAllPayments(); // Refresh the payments list
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
      // Get receipt using the path that includes client folder
      const receiptPath = isAR ? payment.ar_receipt_path : payment.receipt_path;
      if (!receiptPath) {
        toast.error('Receipt not found');
        return;
      }

      console.log('Fetching receipt:', receiptPath);
      
      const { data, error } = await supabase.storage
        .from(isAR ? 'ar-receipt' : 'Payment Receipt')
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

  useEffect(() => {
    fetchAllPayments();
    setupRealtimeSubscription();
  }, []);

  // Filter payments based on search, status, and project
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch = payment.Name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !selectedStatus || payment.Status === selectedStatus;
      const matchesProject = selectedProject === 'all' || payment.Project === selectedProject;
      return matchesSearch && matchesStatus && matchesProject;
    });
  }, [payments, searchTerm, selectedStatus, selectedProject]);

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
            {/* Status Filter */}
            <div className="w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-48 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">All Status</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
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

        {/* Edit Payment Modal */}
        <EditPaymentModal
          isOpen={isEditPaymentModalOpen}
          onClose={() => {
            setIsEditPaymentModalOpen(false);
            setEditingPayment(null);
          }}
          payment={editingPayment}
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
