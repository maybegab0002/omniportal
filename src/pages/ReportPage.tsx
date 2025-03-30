import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import PageTransition from '../components/PageTransition';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { MagnifyingGlassIcon, DocumentTextIcon, ChartBarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface PaymentRecord {
  id: number;
  created_at: string;
  Name: string;
  Amount: number;
  Project: string;
  Block: string;
  Lot: string;
  Penalty: number;
  "Payment Type": string;
}

const ReportPage: React.FC = () => {
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [filteredRecords, setFilteredRecords] = useState<PaymentRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>('all');

  const paymentTypes = [
    'all',
    'cash',
    'SB-HRM',
    'SB-LWS',
    'SB-HHE',
    'CBS-LWS',
    'CBS-HHE'
  ];

  useEffect(() => {
    fetchPaymentRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [startDate, endDate, paymentRecords, searchTerm, selectedPaymentType]);

  const filterRecords = () => {
    let filtered = [...paymentRecords];
    
    if (startDate && endDate) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.created_at);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(record =>
        record.Name.toLowerCase().includes(searchLower) ||
        record.Project.toLowerCase().includes(searchLower) ||
        record.Block.toLowerCase().includes(searchLower) ||
        record.Lot.toLowerCase().includes(searchLower)
      );
    }

    if (selectedPaymentType !== 'all') {
      filtered = filtered.filter(record => record["Payment Type"] === selectedPaymentType);
    }

    setFilteredRecords(filtered);
  };

  const fetchPaymentRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Payment Record')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentRecords(data || []);
      setFilteredRecords(data || []);
    } catch (error) {
      console.error('Error fetching payment records:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const totals = filteredRecords.reduce((acc, record) => ({
      amount: acc.amount + (record.Amount || 0),
      penalty: acc.penalty + (record.Penalty || 0)
    }), { amount: 0, penalty: 0 });

    return totals;
  };

  const totals = calculateTotals();

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        {/* Page Title and Description */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600">A comprehensive list of all payment reports and transactions in the system.</p>
        </div>

        {/* Search Bar and Filters */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <div className="flex gap-4">
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              selectsStart
              startDate={startDate || undefined}
              endDate={endDate || undefined}
              className="w-48 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholderText="Start Date"
            />
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              selectsEnd
              startDate={startDate || undefined}
              endDate={endDate || undefined}
              minDate={startDate || undefined}
              className="w-48 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholderText="End Date"
            />
            <select
              value={selectedPaymentType}
              onChange={(e) => setSelectedPaymentType(e.target.value)}
              className="w-48 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              {paymentTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Payment Types' : type.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold text-blue-600">{filteredRecords.length}</p>
                <p className="text-sm text-gray-600">Total Records</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <DocumentTextIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              97% coverage
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold text-purple-600">
                  {new Intl.NumberFormat('en-PH', {
                    style: 'currency',
                    currency: 'PHP',
                    maximumFractionDigits: 0
                  }).format(totals.amount)}
                </p>
                <p className="text-sm text-gray-600">Total Amount</p>
              </div>
              <div className="bg-purple-100 p-2 rounded-lg">
                <ChartBarIcon className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              0.4 docs per client
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold text-amber-600">
                  {new Intl.NumberFormat('en-PH', {
                    style: 'currency',
                    currency: 'PHP',
                    maximumFractionDigits: 0
                  }).format(totals.penalty)}
                </p>
                <p className="text-sm text-gray-600">Total Penalties</p>
              </div>
              <div className="bg-amber-100 p-2 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              4% pending
            </div>
          </div>
        </div>

        {/* Payment Records Table */}
        <div className="mt-6">
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredRecords.length}</span> records
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Block
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lot
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Penalty
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Type
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                      Loading payment records...
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No payment records found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchTerm || (startDate && endDate) ? 'Try adjusting your search or filter criteria' : 'No records available at the moment'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.created_at).toLocaleDateString('en-PH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.Project}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.Name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.Block}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.Lot}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Intl.NumberFormat('en-PH', {
                          style: 'currency',
                          currency: 'PHP'
                        }).format(record.Amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                        {record.Penalty ? new Intl.NumberFormat('en-PH', {
                          style: 'currency',
                          currency: 'PHP'
                        }).format(record.Penalty) : '₱0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record["Payment Type"] || 'cash'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ReportPage;
