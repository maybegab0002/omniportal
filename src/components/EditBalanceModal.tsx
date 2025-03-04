import React from 'react';
import { Dialog } from '@headlessui/react';

interface EditBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EditBalanceData) => Promise<void>;
  data: EditBalanceData | null;
}

export interface EditBalanceData {
  id: number;
  "Name": string;
  "Remaining Balance": number | null;
  "Amount": number | null;
  "Months Paid": string;
  "TCP": number | null;
  "Project": string;
  "Block": string;
  "Lot": string;
}

const EditBalanceModal: React.FC<EditBalanceModalProps> = ({ isOpen, onClose, onSave, data }) => {
  const [formData, setFormData] = React.useState<EditBalanceData | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setFormData(data);
  }, [data]);

  if (!formData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      setLoading(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EditBalanceData, value: string) => {
    if (!formData) return;

    let processedValue: string | number | null = value;
    
    // Handle numeric fields
    if (['Remaining Balance', 'Amount', 'TCP'].includes(field)) {
      processedValue = value === '' ? null : Number(value);
    }

    setFormData({
      ...formData,
      [field]: processedValue
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl shadow-lg p-6">
          <Dialog.Title className="text-xl font-semibold text-gray-900 mb-4">
            Edit Balance Record
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Name (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData['Name']}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>

              {/* Remaining Balance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remaining Balance
                </label>
                <input
                  type="number"
                  value={formData['Remaining Balance'] ?? ''}
                  onChange={(e) => handleInputChange('Remaining Balance', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.01"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={formData['Amount'] ?? ''}
                  onChange={(e) => handleInputChange('Amount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.01"
                />
              </div>

              {/* Months Paid */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Months Paid
                </label>
                <input
                  type="text"
                  value={formData['Months Paid']}
                  onChange={(e) => handleInputChange('Months Paid', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g. November 2023 - August 2024"
                />
              </div>

              {/* TCP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TCP
                </label>
                <input
                  type="number"
                  value={formData['TCP'] ?? ''}
                  onChange={(e) => handleInputChange('TCP', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.01"
                />
              </div>

              {/* Project */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project
                </label>
                <input
                  type="text"
                  value={formData['Project']}
                  onChange={(e) => handleInputChange('Project', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Block */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Block
                </label>
                <input
                  type="text"
                  value={formData['Block']}
                  onChange={(e) => handleInputChange('Block', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Lot */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lot
                </label>
                <input
                  type="text"
                  value={formData['Lot']}
                  onChange={(e) => handleInputChange('Lot', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md 
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default EditBalanceModal;
