import type { FC } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import PageTransition from '../components/PageTransition';
import EditBalanceModal, { EditBalanceData } from '../components/EditBalanceModal';

interface BalanceData {
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

type SortType = 'name-asc' | 'name-desc' | 'block-lot-asc' | 'block-lot-desc';

const PROJECTS = ['Living Water Subdivision', 'Havahills Estate'];

const BalancePage: FC = () => {
  const [balances, setBalances] = useState<BalanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<BalanceData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [sortType, setSortType] = useState<SortType>('name-asc');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Balance')
        .select('id, "Name", "Remaining Balance", "Amount", "Months Paid", "TCP", "Project", "Block", "Lot"')
        .order('"Name"', { ascending: true });

      if (error) throw error;

      const processedData = (data || []).map(item => ({
        ...item,
        "Months Paid": item["Months Paid"]?.toString() || ''
      }));

      setBalances(processedData);
    } catch (err: any) {
      console.error('Error fetching balances:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (balance: BalanceData) => {
    setSelectedBalance(balance);
    setIsEditModalOpen(true);
  };

  const handleSave = async (updatedData: EditBalanceData) => {
    try {
      const { error } = await supabase
        .from('Balance')
        .update({
          "Name": updatedData["Name"],
          "Remaining Balance": updatedData["Remaining Balance"],
          "Amount": updatedData["Amount"],
          "Months Paid": updatedData["Months Paid"],
          "TCP": updatedData["TCP"],
          "Project": updatedData["Project"],
          "Block": updatedData["Block"],
          "Lot": updatedData["Lot"]
        })
        .eq('id', updatedData.id);

      if (error) throw error;

      await fetchBalances();
    } catch (err: any) {
      console.error('Error updating balance:', err.message);
    }
  };

  const handleDelete = async (balance: BalanceData) => {
    try {
      const { error } = await supabase
        .from('Balance')
        .delete()
        .eq('id', balance.id);

      if (error) throw error;

      await fetchBalances();
      setShowDeleteConfirm(false);
      setSelectedBalance(null);
    } catch (err: any) {
      console.error('Error deleting balance record:', err.message);
    }
  };

  const handleDeleteConfirm = (balance: BalanceData) => {
    setSelectedBalance(balance);
    setShowDeleteConfirm(true);
  };

  const compareBlockLot = (a: BalanceData, b: BalanceData): number => {
    // Handle null/undefined cases
    const blockA = (a.Block || '').toString();
    const blockB = (b.Block || '').toString();
    const lotA = (a.Lot || '').toString();
    const lotB = (b.Lot || '').toString();

    // Extract numeric parts from Block
    const blockNumA = parseInt(blockA.replace(/\D/g, '') || '0');
    const blockNumB = parseInt(blockB.replace(/\D/g, '') || '0');

    if (blockNumA !== blockNumB) {
      return blockNumA - blockNumB;
    }

    // If blocks are the same, compare lots
    const lotNumA = parseInt(lotA.replace(/\D/g, '') || '0');
    const lotNumB = parseInt(lotB.replace(/\D/g, '') || '0');
    return lotNumA - lotNumB;
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '₱0.00';
    return `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Filter and sort balances
  const filteredBalances = useMemo(() => {
    let filtered = [...balances];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(balance => 
        balance.Name.toLowerCase().includes(searchLower) ||
        `${balance.Block}/${balance.Lot}`.toLowerCase().includes(searchLower)
      );
    }

    // Apply project filter
    if (selectedProject) {
      filtered = filtered.filter(balance => balance.Project === selectedProject);
    }

    return filtered;
  }, [balances, searchTerm, selectedProject]);

  // Sort the filtered balances
  const sortedBalances = useMemo(() => {
    return [...filteredBalances].sort((a, b) => {
      const nameA = a.Name || '';
      const nameB = b.Name || '';

      if (sortType === 'name-asc') return nameA.localeCompare(nameB);
      if (sortType === 'name-desc') return nameB.localeCompare(nameA);
      if (sortType === 'block-lot-asc') {
        return compareBlockLot(a, b);
      }
      return compareBlockLot(b, a); // Reverse for descending order
    });
  }, [filteredBalances, sortType]);

  if (loading) {
    return (
      <PageTransition>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Balance Records</h1>
            <p className="text-gray-600">Manage and view client balances</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg flex flex-col h-[calc(100vh-16rem)]">
            <div className="flex justify-center items-center h-full bg-gray-50">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent shadow-sm"></div>
                <p className="mt-4 text-sm font-medium text-gray-500">Loading balance records...</p>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Balance Records</h1>
            <p className="text-gray-600">Manage and view client balances</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border border-red-200">
            <div className="flex items-center text-red-600">
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Error loading balance data: {error}</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">Please try refreshing the page or contact support if the problem persists.</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Balance Records</h1>
          <div className="mt-1 flex items-center gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium">{filteredBalances.length}</span>
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
            {/* Project Filter */}
            <div className="w-48">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full h-10 pl-3 pr-8 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="">All Projects</option>
                {PROJECTS.map((project, index) => (
                  <option key={index} value={project}>{project}</option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="w-48">
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value as SortType)}
                className="w-full h-10 pl-3 pr-8 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="name-asc">Sort by Name (A-Z)</option>
                <option value="name-desc">Sort by Name (Z-A)</option>
                <option value="block-lot-asc">Sort by Block/Lot ↑</option>
                <option value="block-lot-desc">Sort by Block/Lot ↓</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg flex flex-col h-[calc(100vh-16rem)] border border-gray-200">
          <div className="p-4 border-b flex justify-between items-center bg-white">
            <span className="text-sm font-medium text-gray-600">
              Showing <span className="font-semibold text-gray-900">{sortedBalances.length}</span> records
            </span>
          </div>
          <div className="overflow-auto flex-1">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="sticky left-0 bg-gray-50 px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[150px] border-b border-gray-200">Project</th>
                  <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[100px] border-b border-gray-200">Block</th>
                  <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[100px] border-b border-gray-200">Lot</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[150px] border-b border-gray-200">Name</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[150px] border-b border-gray-200">Remaining Balance</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[120px] border-b border-gray-200">Amount</th>
                  <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[200px] border-b border-gray-200">Months Paid</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[120px] border-b border-gray-200">TCP</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[100px] border-b border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedBalances.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No balance records found</h3>
                        <p className="mt-1 text-sm text-gray-500">{searchTerm ? 'Try adjusting your search or filter criteria' : 'No records available at the moment'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedBalances.map((balance) => (
                    <tr key={balance.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="sticky left-0 bg-white hover:bg-gray-50 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {balance['Project']}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                        {balance['Block']}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                        {balance['Lot']}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {balance['Name']}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatCurrency(balance['Remaining Balance'])}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatCurrency(balance['Amount'])}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                        {balance['Months Paid'] || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatCurrency(balance['TCP'])}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(balance)}
                          className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors duration-200 group"
                          title="Edit Balance"
                        >
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" 
                                className="h-4 w-4 transform transition-transform group-hover:rotate-12" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="ml-1 transform transition-transform origin-left group-hover:translate-x-1">Edit</span>
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(balance)}
                          className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors duration-200 group"
                          title="Delete Balance"
                        >
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" 
                                className="h-4 w-4 transform transition-transform group-hover:-rotate-12" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="ml-1 transform transition-transform origin-left group-hover:translate-x-1">Delete</span>
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isEditModalOpen && selectedBalance && (
          <EditBalanceModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedBalance(null);
              setShowDeleteConfirm(false);
            }}
            onSave={handleSave}
            onDelete={() => setShowDeleteConfirm(true)}
            data={selectedBalance}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && selectedBalance && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg px-4 pt-5 pb-4 overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Balance Record</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete the balance record for <span className="font-medium text-gray-900">{selectedBalance.Name}</span>?
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handleDelete(selectedBalance)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedBalance(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}


      </div>
    </PageTransition>
  );
};

export default BalancePage;
