import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabaseClient';

interface EditBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EditBalanceData) => Promise<void>;
  onDelete: () => void;
  data: EditBalanceData | null;
}

export interface EditBalanceData {
  id: number;
  "Project": string;
  "Block": string;
  "Lot": string;
  "Name": string;
  "Remaining Balance": number | null;
  "Amount": number | null;
  "TCP": number | null;
  "Months Paid": string;
  "MONTHS PAID": string;
  "Terms": string;
  "Penalty"?: number | null;
  "Payment Type"?: string;
}

const EditBalanceModal: React.FC<EditBalanceModalProps> = ({ isOpen, onClose, onSave, data }) => {
  const [formData, setFormData] = React.useState<EditBalanceData | null>(data);
  const [loading, setLoading] = React.useState(false);
  const [currentRemainingBalance, setCurrentRemainingBalance] = React.useState<number | null>(data?.["Remaining Balance"] || 0);
  const [totalAmount, setTotalAmount] = React.useState<number | null>(data?.Amount || 0);
  const [penalty, setPenalty] = React.useState<number | null>(null);
  const [paymentType, setPaymentType] = React.useState<string>('cash');

  const paymentTypes = [
    'cash',
    'SB-HRM',
    'SB-LWS',
    'SB-HHE',
    'CBS-LWS',
    'CBS-HHE'
  ];

  React.useEffect(() => {
    if (data) {
      setFormData({
        ...data,
        "Amount": null,
        "Penalty": null,
        "Payment Type": 'cash'
      });
      setCurrentRemainingBalance(data["Remaining Balance"]);
      setTotalAmount(data.Amount);
      setPenalty(null);
      setPaymentType('cash');
    }
  }, [data]);

  if (!formData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      setLoading(true);
      // Add the new payment to the existing Amount
      const currentAmount = data?.Amount || 0;
      const newPaymentAmount = formData['Amount'] ? parseFloat(formData['Amount'].toString()) : 0;
      const totalAmount = currentAmount + newPaymentAmount;

      // Update the Balance table with all the data
      const updatedData = {
        ...formData,
        'Remaining Balance': currentRemainingBalance,
        'Amount': totalAmount,
        'Months Paid': formData['Months Paid'] || data?.['Months Paid'] || '',
        'MONTHS PAID': formData['MONTHS PAID'] || data?.['MONTHS PAID'] || ''
      };

      // First update the Balance table
      await onSave(updatedData);

      // Then save basic payment info to Payment Record table
      const paymentRecord: any = {
        Name: formData.Name,
        Amount: newPaymentAmount,
        Project: formData.Project,
        Block: formData.Block,
        Lot: formData.Lot,
        "Payment Type": paymentType
      };

      // Only add penalty if it has a value
      if (penalty !== null && penalty > 0) {
        paymentRecord.Penalty = penalty;
      }

      const { error: paymentError } = await supabase
        .from('Payment Record')
        .insert([paymentRecord]);

      if (paymentError) {
        throw paymentError;
      }

      onClose();
    } catch (error) {
      console.error('Error saving balance:', error);
      alert('Error saving payment: ' + (error as any)?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'Amount') {
      if (value === '') return;
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) return;
      
      setFormData(prev => prev ? {
        ...prev,
        [field]: numValue
      } : null);

      // Calculate new remaining balance
      if (formData?.TCP) {
        const newBalance = formData.TCP - (totalAmount || 0) - numValue;
        setCurrentRemainingBalance(newBalance);
      }
    } else if (field === 'Penalty') {
      if (value === '') {
        setPenalty(null);
        return;
      }
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) return;
      setPenalty(numValue);
    } else {
      setFormData(prev => prev ? {
        ...prev,
        [field]: value
      } : null);
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-8 shadow-[0_0_50px_-12px_rgb(0,0,0,0.25)] transition-all">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <Dialog.Title className="text-2xl font-semibold text-gray-900">
                      Add Payment
                    </Dialog.Title>
                    <p className="mt-1 text-sm text-gray-500">Record a new payment for this client</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Project:</span>
                        <span className="ml-2 font-medium text-gray-900">{formData.Project}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Block:</span>
                        <span className="ml-2 font-medium text-gray-900">{formData.Block}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Lot:</span>
                        <span className="ml-2 font-medium text-gray-900">{formData.Lot}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <span className="ml-2 font-medium text-gray-900">{formData.Name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Remaining Balance:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {new Intl.NumberFormat('en-PH', {
                            style: 'currency',
                            currency: 'PHP',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }).format(currentRemainingBalance || 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {new Intl.NumberFormat('en-PH', {
                            style: 'currency',
                            currency: 'PHP',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }).format(totalAmount || 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">TCP:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {new Intl.NumberFormat('en-PH', {
                            style: 'currency',
                            currency: 'PHP',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }).format(formData['TCP'] || 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Months Paid:</span>
                        <span className="ml-2 font-medium text-gray-900">{formData['Months Paid']}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">MONTHS PAID:</span>
                        <span className="ml-2 font-medium text-gray-900">{formData['MONTHS PAID'] || ''}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Terms:</span>
                        <span className="ml-2 font-medium text-gray-900">{formData['Terms']}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-gray-500">₱</span>
                        <input
                          type="number"
                          value={formData['Amount'] ?? ''}
                          onChange={(e) => handleInputChange('Amount', e.target.value)}
                          className="w-full pl-8 pr-4 py-3 bg-white border-0 rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 transition-shadow"
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                      <select
                        value={paymentType}
                        onChange={(e) => setPaymentType(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-0 rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 transition-shadow"
                      >
                        {paymentTypes.map((type) => (
                          <option key={type} value={type}>
                            {type.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Penalty (Optional)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-gray-500">₱</span>
                        <input
                          type="number"
                          value={penalty ?? ''}
                          onChange={(e) => handleInputChange('Penalty', e.target.value)}
                          className="w-full pl-8 pr-4 py-3 bg-white border-0 rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 transition-shadow"
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">MONTHS PAID</label>
                      <input
                        type="text"
                        value={formData['MONTHS PAID'] || ''}
                        onChange={(e) => handleInputChange('MONTHS PAID', e.target.value)}
                        className="w-full px-4 py-3 bg-white border-0 rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 transition-shadow"
                        placeholder="e.g., 37"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Months Covered by Payment</label>
                      <input
                        type="text"
                        value={formData['Months Paid']}
                        onChange={(e) => handleInputChange('Months Paid', e.target.value)}
                        className="w-full px-4 py-3 bg-white border-0 rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 transition-shadow"
                        placeholder="e.g. March 22 - February 25"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">Format: Month YY - Month YY</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-8 mt-8 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg ring-1 ring-gray-200 hover:ring-gray-300 transition-all"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </div>
                      ) : (
                        'Record Payment'
                      )}
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

export default EditBalanceModal;
