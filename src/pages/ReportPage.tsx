import { useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import PageTransition from '../components/PageTransition';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { MagnifyingGlassIcon, DocumentTextIcon, ChartBarIcon, ExclamationTriangleIcon, PencilIcon, PrinterIcon, XMarkIcon } from '@heroicons/react/24/outline';
import hdcLogo from '../assets/HDC LOGO.png';

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
  "Payment for the Month of": string;
}

const ReportPage = (): ReactNode => {
  const projects = [
    'all',
    'Living Water Subdivision',
    'Havahills Estate'
  ];

  const paymentTypes = [
    'all',
    'cash',
    'SB-HRM',
    'SB-LWS',
    'SB-HHE',
    'CBS-LWS',
    'CBS-HHE'
  ];

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedPrintDate, setSelectedPrintDate] = useState<Date | null>(null);
  const [selectedPrintProject, setSelectedPrintProject] = useState(projects.find(p => p !== 'all') || '');
  const [filteredRecords, setFilteredRecords] = useState<PaymentRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [editingRecord, setEditingRecord] = useState<PaymentRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchPaymentRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [paymentRecords, searchTerm, selectedPaymentType, selectedProject]);

  const filterRecords = () => {
    let filtered = [...paymentRecords];
    

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

    if (selectedProject !== 'all') {
      filtered = filtered.filter(record => record.Project === selectedProject);
    }

    setFilteredRecords(filtered);
  };

  const handleEdit = async (record: PaymentRecord) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
  };

  const handleUpdateRecord = async (updatedRecord: PaymentRecord) => {
    try {
      const { error } = await supabase
        .from('Payment Record')
        .update({
          Name: updatedRecord.Name,
          Amount: updatedRecord.Amount,
          Penalty: updatedRecord.Penalty,
          Project: updatedRecord.Project,
          Block: updatedRecord.Block,
          Lot: updatedRecord.Lot,
          "Payment Type": updatedRecord["Payment Type"]
        })
        .eq('id', updatedRecord.id);

      if (error) throw error;

      setIsEditModalOpen(false);
      setEditingRecord(null);
      await fetchPaymentRecords();
    } catch (error) {
      console.error('Error updating record:', error);
    }
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

  const calculateTotals = (records: PaymentRecord[]) => {
    return records.reduce((acc, record) => ({
      amount: acc.amount + (parseFloat(record.Amount?.toString() || '0') || 0),
      penalty: acc.penalty + (parseFloat(record.Penalty?.toString() || '0') || 0)
    }), { amount: 0, penalty: 0 });

  };

  const totals = calculateTotals(filteredRecords);

  const getMonthlyTotal = (date: Date | null, project: string) => {
    if (!date) return 0;
    return paymentRecords
      .filter(record => {
        const recordDate = new Date(record.created_at);
        return recordDate.getMonth() === date.getMonth() &&
               recordDate.getFullYear() === date.getFullYear() &&
               (project === 'all' || record.Project === project);
      })
      .reduce((sum, record) => sum + (Number(record.Amount) + (Number(record.Penalty) || 0)), 0);
  };

  const getDailyTotal = (date: Date | null, project: string) => {
    if (!date) return 0;
    return paymentRecords
      .filter(record => {
        const recordDate = new Date(record.created_at);
        const isMatchingDate = recordDate.getDate() === date.getDate() &&
                              recordDate.getMonth() === date.getMonth() &&
                              recordDate.getFullYear() === date.getFullYear();
        return isMatchingDate && (project === 'all' || record.Project === project);
      })
      .reduce((sum, record) => sum + (Number(record.Amount) + (Number(record.Penalty) || 0)), 0);
  };

  const convertImageToBase64 = async (imgUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = imgUrl;
    });
  };

  const handlePrint = async () => {
    if (!selectedPrintDate || !selectedPrintProject) {
      alert('Please select both a date and project before printing');
      return;
    }

    const printRecords = paymentRecords.filter(record => {
      const recordDate = new Date(record.created_at);
      const isMatchingDate = recordDate.getDate() === selectedPrintDate.getDate() &&
                            recordDate.getMonth() === selectedPrintDate.getMonth() &&
                            recordDate.getFullYear() === selectedPrintDate.getFullYear();
      return isMatchingDate && record.Project === selectedPrintProject;
    });

    const printTotals = calculateTotals(printRecords);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const currentDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const logoBase64 = await convertImageToBase64(hdcLogo);
    const html = `
      <html>
        <head>
          <title></title>
          <style>
            @page {
              margin: 0;
              size: A4;
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0;
              padding: 0;
              color: #333;
              background: linear-gradient(45deg, #0A0D50 25%, transparent 25%) -50px 0,
                        linear-gradient(-45deg, #0A0D50 25%, transparent 25%) -50px 0,
                        linear-gradient(45deg, transparent 75%, #0A0D50 75%),
                        linear-gradient(-45deg, transparent 75%, #0A0D50 75%);
              background-size: 10px 10px;
              background-color: white;
            }
            .report-wrapper {
              background: white;
              margin: 0;
              min-height: 100vh;
              position: relative;
              z-index: 1;
            }
            .pattern-border {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              height: 80px;
              background: repeating-linear-gradient(
                45deg,
                #0A0D50,
                #0A0D50 10px,
                #141B7A 10px,
                #141B7A 20px
              );
              opacity: 0.1;
            }
            .pattern-border-bottom {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              height: 40px;
              background: repeating-linear-gradient(
                45deg,
                #0A0D50,
                #0A0D50 10px,
                #141B7A 10px,
                #141B7A 20px
              );
              opacity: 0.1;
            }
            .content {
              padding: 40px;
              position: relative;
              z-index: 2;
            }
            .header {
              margin-bottom: 40px;
              position: relative;
              display: flex;
              align-items: flex-start;
              justify-content: space-between;
            }
            .header-left {
              display: flex;
              align-items: center;
              gap: 15px;
            }
            .logo {
              width: 60px;
              height: auto;
            }
            .report-title {
              color: #0A0D50;
              font-size: 24px;
              font-weight: bold;
              margin: 0;
              border-bottom: 2px solid #0A0D50;
              padding-bottom: 5px;
            }
            .report-info {
              text-align: right;
              font-size: 12px;
              color: #666;
            }
            .report-info p {
              margin: 3px 0;
            }
            table { 
              width: 100%; 
              border-collapse: separate;
              border-spacing: 0;
              margin-top: 20px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            th { 
              background-color: #0A0D50; 
              color: white;
              padding: 12px;
              text-align: left;
              font-size: 12px;
              position: relative;
            }
            th:after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              height: 2px;
              background: linear-gradient(90deg, #0A0D50, #141B7A);
            }
            td { 
              padding: 12px;
              border-bottom: 1px solid #eee;
              font-size: 12px;
              background: white;
            }
            tr:hover td {
              background-color: #f8f9fc;
            }
            .totals {
              margin-top: 30px;
              padding: 20px;
              background: #f8f9fc;
              border-radius: 4px;
              border-left: 4px solid #0A0D50;
            }
            .totals p {
              margin: 8px 0;
              display: flex;
              justify-content: space-between;
              font-size: 12px;
            }
            .total-amount {
              font-weight: bold;
              color: #0A0D50;
            }
            @media print {
              body { background: none; }
              .pattern-border, .pattern-border-bottom { display: none; }
              th { background-color: #0A0D50 !important; color: white !important; }
              .report-wrapper { margin: 0; box-shadow: none; }
              thead { display: table-header-group; }
              tfoot { display: table-footer-group; }
            }
          </style>
        </head>
        <body>
          <div class="pattern-border"></div>
          <div class="pattern-border-bottom"></div>
          <div class="report-wrapper">
            <div class="content">
              <div class="header">
                <div class="header-left">
                  <img src="${logoBase64}" alt="HDC Logo" class="logo">
                  <h1 class="report-title">Payment Report</h1>
                </div>
                <div class="report-info">
                  <p>Generated on: ${currentDate}</p>
                  <p>Project: ${selectedPrintProject}</p>
                  <p>Date: ${selectedPrintDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Payment for the Month of</th>
                <th>Name</th>
                <th>Project</th>
                <th>Block & Lot</th>
                <th>Amount</th>
                <th>Penalty</th>
                <th>Payment Type</th>
                <th>Payment Month</th>
              </tr>
            </thead>
            <tbody>
              ${printRecords.map(record => `
                <tr>
                  <td>${new Date(record.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td>${record["Payment for the Month of"] || ''}</td>
                  <td>${record.Name}</td>
                  <td>${record.Project}</td>
                  <td>Block ${record.Block} Lot ${record.Lot}</td>
                  <td>₱${record.Amount.toLocaleString()}</td>
                  <td>${record.Penalty ? `₱${record.Penalty.toLocaleString()}` : 'N/A'}</td>
                  <td>${record["Payment Type"]}</td>
                  <td>${record["Payment for the Month of"] || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals mb-4">
            <p><span>Total Amount:</span> <span class="total-amount">₱${printTotals.amount.toLocaleString()}</span></p>
            <p><span>Total Penalty:</span> <span class="total-amount">₱${printTotals.penalty.toLocaleString()}</span></p>
            <p><span>Grand Total:</span> <span class="total-amount">₱${(printTotals.amount + printTotals.penalty).toLocaleString()}</span></p>
            <p><span>Monthly Total (${selectedPrintDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}):</span> <span class="total-amount">₱${getMonthlyTotal(selectedPrintDate, selectedPrintProject).toLocaleString()}</span></p>
            <p><span>Daily Total (${selectedPrintDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}):</span> <span class="total-amount">₱${getDailyTotal(selectedPrintDate, selectedPrintProject).toLocaleString()}</span></p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-4 flex flex-col">
        {/* Page Title and Description */}
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600">A comprehensive list of all payment reports and transactions in the system.</p>
        </div>

        {/* Search Bar and Filters */}
        <div className="flex justify-between items-center mb-2">
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
          <div className="flex gap-4 items-center">
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
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <PrinterIcon className="h-5 w-5" />
              Print Report
            </button>
          </div>
        </div>

        {/* Print Modal */}
        {isPrintModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <PrinterIcon className="h-5 w-5 text-[#0A0D50]" />
                  <h3 className="text-lg font-medium text-gray-900">Print Report</h3>
                </div>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Project</label>
                  <select
                    value={selectedPrintProject}
                    onChange={(e) => setSelectedPrintProject(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-[#0A0D50] focus:border-[#0A0D50] rounded-md"
                  >
                    <option value="">Choose a project</option>
                    {projects.filter(p => p !== 'all').map((project) => (
                      <option key={project} value={project}>{project}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                  <div className="relative">
                    <DatePicker
                      selected={selectedPrintDate}
                      onChange={(date) => setSelectedPrintDate(date)}
                      dateFormat="MMMM d, yyyy"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-[#0A0D50] focus:border-[#0A0D50] rounded-md"
                      placeholderText="Select a date"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Monthly Total:</span>
                    <span className="font-medium text-[#0A0D50]">
                      ₱{selectedPrintDate && selectedPrintProject ? getMonthlyTotal(selectedPrintDate, selectedPrintProject).toLocaleString() : '0'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Daily Total:</span>
                    <span className="font-medium text-[#0A0D50]">
                      ₱{selectedPrintDate && selectedPrintProject ? getDailyTotal(selectedPrintDate, selectedPrintProject).toLocaleString() : '0'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-3">
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A0D50]"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePrint}
                  disabled={!selectedPrintDate || !selectedPrintProject}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A0D50] ${!selectedPrintDate || !selectedPrintProject ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#0A0D50] hover:bg-[#141B7A]'}`}
                >
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
          <div className="bg-blue-50 rounded-lg p-3">
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

          <div className="bg-purple-50 rounded-lg p-3">
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

          <div className="bg-amber-50 rounded-lg p-3">
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
        <div className="flex-1 min-h-0">
          <div className="mb-2">
            <span className="text-sm font-medium text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredRecords.length}</span> records
            </span>
          </div>
          <div className="relative border border-gray-200 rounded-lg">
            <div className="overflow-auto h-[600px]">
            <table className="min-w-full table-fixed">
              <thead className="sticky top-0 bg-[#0A0D50] z-10">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[180px]">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[180px]">
                    Payment for the Month of
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[200px]">
                    Project
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[180px]">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[100px]">
                    Block
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[100px]">
                    Lot
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[120px]">
                    Amount
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[120px]">
                    Penalty
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[120px]">
                    Payment Type
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-[100px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 overflow-auto">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                      Loading payment records...
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No payment records found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchTerm ? 'Try adjusting your search criteria' : 'No records available at the moment'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.created_at).toLocaleDateString('en-PH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {record["Payment for the Month of"] || ''}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {record.Project}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {record.Name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {record.Block}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {record.Lot}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Intl.NumberFormat('en-PH', {
                          style: 'currency',
                          currency: 'PHP'
                        }).format(record.Amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-red-600">
                        {record.Penalty ? new Intl.NumberFormat('en-PH', {
                          style: 'currency',
                          currency: 'PHP'
                        }).format(record.Penalty) : '₱0.00'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {record["Payment Type"] || 'cash'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors duration-200 flex items-center space-x-2"
                        >
                          <PencilIcon className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && editingRecord && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full transform transition-all">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <PencilIcon className="h-5 w-5 text-[#0A0D50]" />
                  <h3 className="text-lg font-medium text-gray-900">Edit Payment Record</h3>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (editingRecord) handleUpdateRecord(editingRecord);
              }} className="px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={editingRecord.Name}
                      onChange={(e) => setEditingRecord({ ...editingRecord, Name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0A0D50] focus:ring-[#0A0D50] sm:text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment for the Month of</label>
                      <select
                        value={editingRecord["Payment for the Month of"] || ''}
                        onChange={(e) => setEditingRecord({ ...editingRecord, "Payment for the Month of": e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0A0D50] focus:ring-[#0A0D50] sm:text-sm"
                      >
                        <option value="">Select month</option>
                        {months.map((month) => (
                          <option key={month} value={month}>{month}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">₱</span>
                        </div>
                        <input
                          type="number"
                          value={editingRecord.Amount}
                          onChange={(e) => setEditingRecord({ ...editingRecord, Amount: parseFloat(e.target.value) })}
                          className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-[#0A0D50] focus:ring-[#0A0D50] sm:text-sm"
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Penalty</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">₱</span>
                        </div>
                        <input
                          type="number"
                          value={editingRecord.Penalty}
                          onChange={(e) => setEditingRecord({ ...editingRecord, Penalty: parseFloat(e.target.value) })}
                          className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-[#0A0D50] focus:ring-[#0A0D50] sm:text-sm"
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment Type</label>
                      <select
                        value={editingRecord["Payment Type"] || ''}
                        onChange={(e) => setEditingRecord({ ...editingRecord, "Payment Type": e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0A0D50] focus:ring-[#0A0D50] sm:text-sm"
                      >
                        {paymentTypes.filter(type => type !== 'all').map((type) => (
                          <option key={type} value={type}>
                            {type.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Block</label>
                      <input
                        type="text"
                        value={editingRecord.Block}
                        onChange={(e) => setEditingRecord({ ...editingRecord, Block: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0A0D50] focus:ring-[#0A0D50] sm:text-sm"
                        placeholder="Enter block number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Lot</label>
                      <input
                        type="text"
                        value={editingRecord.Lot}
                        onChange={(e) => setEditingRecord({ ...editingRecord, Lot: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0A0D50] focus:ring-[#0A0D50] sm:text-sm"
                        placeholder="Enter lot number"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project</label>
                    <select
                      value={editingRecord.Project}
                      onChange={(e) => setEditingRecord({ ...editingRecord, Project: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0A0D50] focus:ring-[#0A0D50] sm:text-sm"
                    >
                      {projects.filter(project => project !== 'all').map((project) => (
                        <option key={project} value={project}>
                          {project}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A0D50]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-[#0A0D50] rounded-md hover:bg-[#141B7A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A0D50]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default ReportPage;
