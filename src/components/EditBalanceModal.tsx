import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

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
}

const EditBalanceModal: React.FC<EditBalanceModalProps> = ({ isOpen, onClose, onSave, data }) => {
  const [formData, setFormData] = React.useState<EditBalanceData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [currentRemainingBalance, setCurrentRemainingBalance] = React.useState<number | null>(null);
  const [totalAmount, setTotalAmount] = React.useState<number | null>(null);
  const [displayMonthsPaid, setDisplayMonthsPaid] = React.useState<string>('');

  React.useEffect(() => {
    if (data) {
      setFormData({
        ...data,
        "Amount": null
      });
      setCurrentRemainingBalance(data["Remaining Balance"]);
      setTotalAmount(data.Amount);
      setDisplayMonthsPaid(data["MONTHS PAID"] || '0');
    }
  }, [data]);

  if (!formData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      setLoading(true);
      // Calculate new months paid count
      const currentMonthsPaid = parseInt(data?.["MONTHS PAID"] || "0");
      const newMonthsPaidCount = currentMonthsPaid + 1;

      // Add the new payment to the existing Amount
      const currentAmount = data?.Amount || 0;
      const newPaymentAmount = formData['Amount'] || 0;
      const totalAmount = currentAmount + newPaymentAmount;

      // Update the data with new values
      const updatedData = {
        ...formData,
        'Remaining Balance': currentRemainingBalance,
        'Amount': totalAmount, // Use the sum of current and new amount
        'Months Paid': formData['Months Paid'], // The date range string
        'MONTHS PAID': newMonthsPaidCount.toString() // The incremented count
      };

      await onSave(updatedData);
      setDisplayMonthsPaid(newMonthsPaidCount.toString());
      onClose();
    } catch (error) {
      console.error('Error saving balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EditBalanceData, value: any) => {
    if (field === 'Amount') {
      // Convert empty string to null, otherwise parse as float
      const numValue = value === '' ? null : parseFloat(value);
      // Calculate new remaining balance based on just the new payment
      const newRemainingBalance = (data?.["Remaining Balance"] || 0) - (numValue || 0);
      setCurrentRemainingBalance(newRemainingBalance);
      
      // Calculate total amount (current + new payment)
      const currentAmount = data?.Amount || 0;
      const newTotal = currentAmount + (numValue || 0);
      setTotalAmount(newTotal);
      
      // Update form data with the numeric value
      setFormData(prev => prev ? {
        ...prev,
        [field]: numValue, // Store as number, not string
        "Remaining Balance": newRemainingBalance
      } : null);
      return;
    }

    // For other fields
    setFormData(prev => prev ? {
      ...prev,
      [field]: value
    } : null);
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

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Client Information */}
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
                        <span className="ml-2 font-medium text-gray-900">{displayMonthsPaid}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Terms:</span>
                        <span className="ml-2 font-medium text-gray-900">{formData['Terms']}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
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
                          min="0"
                          required
                        />
                      </div>
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
