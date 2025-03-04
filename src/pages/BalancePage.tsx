import type { FC } from 'react';
import { useState, useEffect } from 'react';
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

  const handleDelete = async () => {
    if (!selectedBalance) return;

    try {
      const { error } = await supabase
        .from('Balance')
        .delete()
        .eq('id', selectedBalance.id);

      if (error) throw error;

      await fetchBalances();
      setShowDeleteConfirm(false);
      setIsEditModalOpen(false);
      setSelectedBalance(null);
    } catch (err: any) {
      console.error('Error deleting balance:', err.message);
    }
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
    if (amount === null || amount === undefined) return '₱0.00';
    return `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const filteredBalances = balances.filter(balance => {
    const matchesSearch = (balance['Name']?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (balance['Block']?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (balance['Lot']?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesProject = !selectedProject || balance['Project'] === selectedProject;
    
    return matchesSearch && matchesProject;
  });

  const sortedBalances = [...filteredBalances].sort((a, b) => {
    const nameA = a.Name || '';
    const nameB = b.Name || '';

    switch (sortType) {
      case 'name-asc':
        return nameA.localeCompare(nameB);
      case 'name-desc':
        return nameB.localeCompare(nameA);
      case 'block-lot-asc':
        return compareBlockLot(a, b);
      case 'block-lot-desc':
        return compareBlockLot(b, a);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <PageTransition>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="flex justify-center items-center h-screen">
          <div className="text-red-600">Error loading balance data: {error}</div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Balance Records</h1>
          <p className="text-gray-600">Manage and view client balances</p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, block, or lot..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="sm:w-64">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Projects</option>
              {PROJECTS.map((project) => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:w-64">
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value as SortType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name-asc">Name (A to Z)</option>
              <option value="name-desc">Name (Z to A)</option>
              <option value="block-lot-asc">Block/Lot (Ascending)</option>
              <option value="block-lot-desc">Block/Lot (Descending)</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow flex flex-col h-[calc(100vh-16rem)]">
          <div className="p-4 border-b flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Showing {filteredBalances.length} records
            </span>
          </div>
          <div className="overflow-auto flex-1">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="sticky left-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Name</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Remaining Balance</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Amount</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Months Paid</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">TCP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Project</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Block</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Lot</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBalances.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                      No balance records found
                    </td>
                  </tr>
                ) : (
                  sortedBalances.map((balance) => (
                    <tr key={balance.id} className="hover:bg-gray-50">
                      <td className="sticky left-0 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {balance['Project']}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                        {balance['Block']}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                        {balance['Lot']}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(balance)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
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

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Balance Record</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete this balance record? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Delete
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
