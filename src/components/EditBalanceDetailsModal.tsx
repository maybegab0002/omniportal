import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface EditBalanceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EditBalanceDetailsData) => void;
  data: EditBalanceDetailsData | null;
}

export interface EditBalanceDetailsData {
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

const EditBalanceDetailsModal: React.FC<EditBalanceDetailsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  data
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    try {
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Error saving balance:', error);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={onClose}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                Edit Balance Details
              </Dialog.Title>

              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

              <form onSubmit={handleSubmit} className="mt-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={data?.Name || ''}
                      onChange={(e) => {
                        if (data) {
                          onSave({ ...data, Name: e.target.value });
                        }
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="block" className="block text-sm font-medium text-gray-700">
                        Block
                      </label>
                      <input
                        type="text"
                        id="block"
                        value={data?.Block || ''}
                        onChange={(e) => {
                          if (data) {
                            onSave({ ...data, Block: e.target.value });
                          }
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="lot" className="block text-sm font-medium text-gray-700">
                        Lot
                      </label>
                      <input
                        type="text"
                        id="lot"
                        value={data?.Lot || ''}
                        onChange={(e) => {
                          if (data) {
                            onSave({ ...data, Lot: e.target.value });
                          }
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="project" className="block text-sm font-medium text-gray-700">
                      Project
                    </label>
                    <input
                      type="text"
                      id="project"
                      value={data?.Project || ''}
                      onChange={(e) => {
                        if (data) {
                          onSave({ ...data, Project: e.target.value });
                        }
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="terms" className="block text-sm font-medium text-gray-700">
                      Terms
                    </label>
                    <input
                      type="text"
                      id="terms"
                      value={data?.Terms || ''}
                      onChange={(e) => {
                        if (data) {
                          onSave({ ...data, Terms: e.target.value });
                        }
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="tcp" className="block text-sm font-medium text-gray-700">
                        TCP
                      </label>
                      <input
                        type="number"
                        id="tcp"
                        value={data?.TCP || ''}
                        onChange={(e) => {
                          if (data) {
                            onSave({ ...data, TCP: parseFloat(e.target.value) || null });
                          }
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                        Amount
                      </label>
                      <input
                        type="number"
                        id="amount"
                        value={data?.Amount || ''}
                        onChange={(e) => {
                          if (data) {
                            onSave({ ...data, Amount: parseFloat(e.target.value) || null });
                          }
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="remaining-balance" className="block text-sm font-medium text-gray-700">
                      Remaining Balance
                    </label>
                    <input
                      type="number"
                      id="remaining-balance"
                      value={data?.["Remaining Balance"] || ''}
                      onChange={(e) => {
                        if (data) {
                          onSave({ ...data, "Remaining Balance": parseFloat(e.target.value) || null });
                        }
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EditBalanceDetailsModal;
