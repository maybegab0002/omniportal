import React, { useState, useEffect, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, HomeIcon, HomeModernIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabaseClient';
import { Dialog, DialogTitle } from '@headlessui/react';

interface LivingWaterProperty {
  id: number;
  Block: string;
  Lot: string;
  "Due Date 15/30": string;
  "First Due Month": string;
  Amount: number;
  Realty: string;
  "Sales Director": string;
  Owner: string;
  "Date of Reservation": string;
  "Seller Name": string;
  "Broker / Realty": string;
  Reservation: number;
  "Lot Area": number;
  "Price per sqm": number;
  TCP: number;
  TSP: number;
  "MISC FEE": number;
  "Net Contract Price": number;
  "Monthly Amortization": number;
  "1st MA net of Advance Payment": number;
  "2ndto60th MA": number;
  Year: number;
  Status?: string;
  created_at?: string;
}

interface HavahillsProperty {
  id: number;
  Block: string | number;
  Lot: string | number;
  Due: string;
  "Date of Reservation": string;
  "First Due": string;
  Terms: string;
  Amount: number;
  Realty: string;
  "Buyers Name": string;
  "Seller Name": string;
  "Sales Director": string;
  Broker: string;
  "Lot Size": number;
  Price: number;
  "Payment Scheme": string;
  "Vat Status": string;
  TSP: number;
  "Mode of Payment": string;
  Reservation: number;
  "Comm Price": number;
  "Misc Fee": number;
  Vat: number;
  TCP: number;
  "1st MA": number;
  "1ST MA with Holding Fee": number;
  "2ND TO 48TH MA": number;
  "NEW TERM": string;
  "PASALO PRICE": number;
  "NEW MA": number;
  Status?: string;
}

type Property = LivingWaterProperty | HavahillsProperty;

const projects = [
  { 
    id: 'LivingWater', 
    name: 'Living Water Subdivision', 
    icon: (className: string) => <HomeIcon className={className} />
  },
  { 
    id: 'Havahills', 
    name: 'Havahills Estate', 
    icon: (className: string) => <HomeModernIcon className={className} />
  }
];

const statusOptions = [
  { id: 'all', name: 'All Statuses' },
  { id: 'available', name: 'Available' },
  { id: 'sold', name: 'Sold' }
];

const InventoryPage: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
  }, [selectedProject]);

  const parseNumericValue = (value: any): number => {
    if (value === null || value === undefined) return 0;
    
    // If it's already a number, return it
    if (typeof value === 'number') return value;
    
    // If it's a string, remove commas and convert to float
    if (typeof value === 'string') {
      // Remove commas and any other non-numeric characters except decimal point
      const cleanedValue = value.replace(/[^\d.-]/g, '');
      return parseFloat(cleanedValue) || 0;
    }
    
    return 0;
  };

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const tableName = selectedProject.id === 'LivingWater' ? 'Living Water Subdivision' : 'Havahills Estate';
      console.log('Fetching from table:', tableName);

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('Block', { ascending: true })
        .order('Lot', { ascending: true });

      if (error) {
        throw error;
      }

      // Log the raw data received
      console.log(`Received ${data?.length || 0} records:`, data);

      // Log the first record in detail to debug
      if (data && data.length > 0) {
        const firstItem = data[0];
        console.log('First record details:');
        console.log('- TCP:', firstItem.TCP, 'Type:', typeof firstItem.TCP);
        console.log('- TSP:', firstItem.TSP, 'Type:', typeof firstItem.TSP);
        console.log('- Net Contract Price:', firstItem['Net Contract Price'], 'Type:', typeof firstItem['Net Contract Price']);
        
        // Test parsing with our function
        console.log('Parsed TCP:', parseNumericValue(firstItem.TCP));
        console.log('Formatted TCP:', formatCurrency(parseNumericValue(firstItem.TCP)));
      }

      // Transform numeric strings to numbers based on property type
      const transformedData = transformData(data);

      setProperties(transformedData);
    } catch (error: any) {
      console.error('Error fetching properties:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-PH');
    } catch (error) {
      return dateString;
    }
  };

  const formatNumber = (value: number | null) => {
    if (value == null) return '';
    return new Intl.NumberFormat('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatCurrency = (value: number | null) => {
    if (value == null) return '';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Function to render status badge with appropriate color
  const renderStatusBadge = (status: string | undefined) => {
    if (!status) return null;
    
    const statusLower = status.toLowerCase();
    let bgColor = 'bg-gray-100 text-gray-800'; // Default style
    
    if (statusLower === 'available') {
      bgColor = 'bg-green-100 text-green-800';
    } else if (statusLower === 'sold') {
      bgColor = 'bg-red-100 text-red-800';
    }
    
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor}`}>
        {status}
      </span>
    );
  };

  const filteredProperties = properties.filter((property) => {
    const searchQuery = searchTerm;
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    
    if (selectedProject.id === 'LivingWater') {
      const livingWaterProperty = property as LivingWaterProperty;
      return [
        livingWaterProperty.Block,
        livingWaterProperty.Lot,
        livingWaterProperty.Owner,
        livingWaterProperty["Seller Name"],
        livingWaterProperty["Broker / Realty"]
      ].some(field => field?.toString().toLowerCase().includes(searchLower));
    } else {
      const havahillsProperty = property as HavahillsProperty;
      return [
        havahillsProperty.Block,
        havahillsProperty.Lot,
        havahillsProperty['Buyers Name'],
        havahillsProperty['Seller Name'],
        havahillsProperty.Broker
      ].some(field => field?.toString().toLowerCase().includes(searchLower));
    }
  }).filter((property) => {
    if (statusFilter === 'all') return true;
    
    // Case-insensitive comparison for status
    const propertyStatus = property.Status?.toLowerCase() || '';
    const filterStatus = statusFilter.toLowerCase();
    return propertyStatus === filterStatus;
  });

  // Debug logging for status filtering
  useEffect(() => {
    if (statusFilter !== 'all') {
      console.log('Status filter:', statusFilter);
      console.log('Properties with matching status:', properties.filter(p => 
        (p.Status?.toLowerCase() || '') === statusFilter.toLowerCase()
      ).length);
      
      // Log the first few properties and their status values
      console.log('Sample property status values:', 
        properties.slice(0, 5).map(p => p.Status || 'undefined')
      );
    }
  }, [statusFilter, properties]);

  console.log('Filtered properties length:', filteredProperties.length);

  const renderLivingWaterTable = (data: LivingWaterProperty[]) => (
    <div className="bg-white rounded-lg shadow flex flex-col h-[calc(100vh-16rem)]">
      <div className="p-4 border-b flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Showing {data.length} properties
        </span>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="sticky left-0 bg-gray-50 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Block</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Lot</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Owner</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Due Date 15/30</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">First Due Month</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Amount</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Realty</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Date of Reservation</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Seller Name</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Broker / Realty</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Reservation</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Lot Area</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Price per sqm</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">TCP</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">TSP</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">MISC FEE</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Net Contract Price</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Monthly Amortization</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">1st MA net of Advance Payment</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">2ndto60th MA</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Status</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((property) => (
              <tr key={property.id} className="hover:bg-gray-50">
                <td className="sticky left-0 bg-white px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Block}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Lot}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Owner}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property["Due Date 15/30"]}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property["First Due Month"]}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.Amount)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Realty}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{formatDate(property["Date of Reservation"])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property["Seller Name"]}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property["Broker / Realty"]}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.Reservation)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatNumber(property["Lot Area"])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property["Price per sqm"])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.TCP)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.TSP)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property["MISC FEE"])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property["Net Contract Price"])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property["Monthly Amortization"])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property["1st MA net of Advance Payment"])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property["2ndto60th MA"])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {renderStatusBadge(property.Status)}
                </td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-center">
                  <button
                    onClick={() => handleEditProperty(property)}
                    className="text-blue-600 hover:text-blue-900 focus:outline-none"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderHavahillsTable = (data: HavahillsProperty[]) => (
    <div className="bg-white rounded-lg shadow flex flex-col h-[calc(100vh-16rem)]">
      <div className="p-4 border-b flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Showing {data.length} properties
        </span>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="sticky left-0 bg-gray-50 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Block</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Lot</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Buyers Name</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Due</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Date of Reservation</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">First Due</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Terms</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Amount</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Realty</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Seller Name</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Sales Director</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Broker</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Lot Size</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Price</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Payment Scheme</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Vat Status</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">TSP</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Mode of Payment</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Reservation</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Comm Price</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Misc Fee</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Vat</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">TCP</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">1st MA</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">1ST MA with Holding Fee</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">2ND TO 48TH MA</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">NEW TERM</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">PASALO PRICE</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">NEW MA</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Status</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((property) => (
              <tr key={property.id} className="hover:bg-gray-50">
                <td className="sticky left-0 bg-white px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Block}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Lot}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property['Buyers Name']}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Due}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{formatDate(property['Date of Reservation'])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property['First Due']}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Terms}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.Amount)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Realty}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property['Seller Name']}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property['Sales Director']}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Broker}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatNumber(property['Lot Size'])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.Price)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property['Payment Scheme']}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property['Vat Status']}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.TSP)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property['Mode of Payment']}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.Reservation)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property['Comm Price'])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property['Misc Fee'])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.Vat)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.TCP)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property['1st MA'])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property['1ST MA with Holding Fee'])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property['2ND TO 48TH MA'])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property['NEW TERM']}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property['PASALO PRICE'])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property['NEW MA'])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {renderStatusBadge(property.Status)}
                </td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-center">
                  <button
                    onClick={() => handleEditProperty(property)}
                    className="text-blue-600 hover:text-blue-900 focus:outline-none"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const scrollTable = (direction: 'left' | 'right') => {
    const tableContainers = document.querySelectorAll('.inventory-table-container');
    if (tableContainers.length === 0) return;
    
    const tableContainer = tableContainers[0] as HTMLElement;
    const scrollAmount = 300; // Scroll by 300px
    
    if (direction === 'left') {
      tableContainer.scrollLeft -= scrollAmount;
    } else {
      tableContainer.scrollLeft += scrollAmount;
    }
  };

  useEffect(() => {
    const checkTableWidth = () => {
      const tableContainers = document.querySelectorAll('.inventory-table-container');
      if (tableContainers.length === 0) return;
      
      const tableContainer = tableContainers[0] as HTMLElement;
      const needsScrolling = tableContainer.scrollWidth > tableContainer.clientWidth;
      setShowScrollButtons(needsScrolling);
    };
    
    // Check after the table is rendered
    setTimeout(checkTableWidth, 500);
    
    // Also check on window resize
    window.addEventListener('resize', checkTableWidth);
    
    return () => {
      window.removeEventListener('resize', checkTableWidth);
    };
  }, [properties, selectedProject]);

  useEffect(() => {
    // Add a style tag to hide the bottom scrollbar but keep the functionality
    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-custom-styles', 'true');
    styleElement.textContent = `
      .overflow-auto::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }
      .overflow-auto::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 5px;
      }
      .overflow-auto::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 5px;
        border: 2px solid #f1f1f1;
      }
      .overflow-auto::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      if (styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, []);

  useEffect(() => {
    // Create a style element
    const style = document.createElement('style');
    style.innerHTML = `
      .inventory-table-container {
        overflow-x: scroll !important;
        scrollbar-width: auto;
      }
      
      .inventory-table-container::-webkit-scrollbar {
        height: 10px;
        display: block;
      }
      
      .inventory-table-container::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 5px;
      }
      
      .inventory-table-container::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 5px;
      }
      
      .inventory-table-container::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
    `;
    
    // Add the style element to the head
    document.head.appendChild(style);
    
    // Clean up function to remove the style when component unmounts
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    // Remove any existing scrollbars first
    const existingScrollbars = document.querySelectorAll('.top-scrollbar-container');
    existingScrollbars.forEach(scrollbar => {
      if (scrollbar.parentNode) {
        scrollbar.parentNode.removeChild(scrollbar);
      }
    });
    
    // Function to create and sync the top scrollbar
    const createTopScrollbar = () => {
      const tableContainers = document.querySelectorAll('.inventory-table-container');
      if (tableContainers.length === 0) return null;
      
      const tableContainer = tableContainers[0] as HTMLElement;
      
      // Create a scrollbar container
      const scrollbarContainer = document.createElement('div');
      scrollbarContainer.className = 'top-scrollbar-container';
      scrollbarContainer.style.position = 'sticky';
      scrollbarContainer.style.top = '0';
      scrollbarContainer.style.zIndex = '20'; // High z-index to ensure visibility
      scrollbarContainer.style.width = '100%';
      scrollbarContainer.style.height = '12px';
      scrollbarContainer.style.backgroundColor = '#f9fafb';
      scrollbarContainer.style.overflow = 'auto';
      scrollbarContainer.style.borderBottom = '1px solid #e5e7eb';
      
      // Create the scrollbar content
      const scrollbarContent = document.createElement('div');
      
      // Update the width dynamically
      const updateScrollbarWidth = () => {
        if (tableContainer.scrollWidth > 0) {
          scrollbarContent.style.width = tableContainer.scrollWidth + 'px';
        } else {
          scrollbarContent.style.width = '2000px'; // Default width
        }
      };
      
      updateScrollbarWidth();
      scrollbarContent.style.height = '1px';
      
      // Add the content to the container
      scrollbarContainer.appendChild(scrollbarContent);
      
      // Add the scrollbar to the page - insert before the table container
      if (tableContainer.parentNode) {
        tableContainer.parentNode.insertBefore(scrollbarContainer, tableContainer);
      }
      
      // Sync scrolling between the table and the scrollbar
      const syncScroll = (source: HTMLElement, target: HTMLElement) => {
        target.scrollLeft = source.scrollLeft;
      };
      
      scrollbarContainer.addEventListener('scroll', () => {
        syncScroll(scrollbarContainer, tableContainer);
      });
      
      tableContainer.addEventListener('scroll', () => {
        syncScroll(tableContainer, scrollbarContainer);
      });
      
      // Update scrollbar width when table size changes
      const resizeObserver = new ResizeObserver(() => {
        updateScrollbarWidth();
      });
      
      resizeObserver.observe(tableContainer);
      
      return { scrollbar: scrollbarContainer, observer: resizeObserver };
    };
    
    // Wait for the table to render
    const timer = setTimeout(() => {
      const result = createTopScrollbar();
      
      // Clean up function
      return () => {
        if (result) {
          const { scrollbar, observer } = result;
          if (scrollbar && scrollbar.parentNode) {
            scrollbar.parentNode.removeChild(scrollbar);
          }
          observer.disconnect();
        }
      };
    }, 500);
    
    return () => {
      clearTimeout(timer);
    };
  }, [properties, selectedProject, filteredProperties]);

  // Add debug logging for data types
  useEffect(() => {
    if (properties.length > 0) {
      const sampleProperty = properties[0];
      if (selectedProject.id === 'LivingWater') {
        const livingWaterProperty = sampleProperty as LivingWaterProperty;
        console.log('Sample Living Water property data types:', {
          Block: typeof livingWaterProperty.Block,
          Lot: typeof livingWaterProperty.Lot,
          Amount: typeof livingWaterProperty.Amount,
          "Lot Area": typeof livingWaterProperty["Lot Area"],
          TCP: typeof livingWaterProperty.TCP
        });
      } else {
        const havahillsProperty = sampleProperty as HavahillsProperty;
        console.log('Sample Havahills property data types:', {
          Block: typeof havahillsProperty.Block,
          Lot: typeof havahillsProperty.Lot,
          Amount: typeof havahillsProperty.Amount,
          'Lot Size': typeof havahillsProperty['Lot Size'],
          TCP: typeof havahillsProperty.TCP
        });
      }
    }
  }, [properties, selectedProject]);

  const transformData = (data: any[]): Property[] => {
    return data.map(item => {
      if (selectedProject.id === 'LivingWater') {
        return {
          id: item.id,
          Block: item.Block || '',
          Lot: item.Lot || '',
          "Due Date 15/30": item["Due Date 15/30"] || '',
          "First Due Month": item["First Due Month"] || '',
          Amount: parseNumericValue(item.Amount),
          Realty: item.Realty || '',
          "Sales Director": item["Sales Director"] || '',
          Owner: item.Owner || '',
          "Date of Reservation": item["Date of Reservation"] || '',
          "Seller Name": item["Seller Name"] || '',
          "Broker / Realty": item["Broker / Realty"] || '',
          Reservation: parseNumericValue(item.Reservation),
          "Lot Area": parseNumericValue(item["Lot Area"]),
          "Price per sqm": parseNumericValue(item["Price per sqm"]),
          TCP: parseNumericValue(item.TCP),
          TSP: parseNumericValue(item.TSP),
          "MISC FEE": parseNumericValue(item["MISC FEE"]),
          "Net Contract Price": parseNumericValue(item["Net Contract Price"]),
          "Monthly Amortization": parseNumericValue(item["Monthly Amortization"]),
          "1st MA net of Advance Payment": parseNumericValue(item["1st MA net of Advance Payment"]),
          "2ndto60th MA": parseNumericValue(item["2ndto60th MA"]),
          Year: parseNumericValue(item.Year),
          Status: item.Status || '',
          created_at: item.created_at
        } as LivingWaterProperty;
      } else {
        return {
          id: item.id,
          Block: item.Block,
          Lot: item.Lot,
          Due: item.Due || '',
          "Date of Reservation": item["Date of Reservation"] || '',
          "First Due": item["First Due"] || '',
          Terms: item.Terms || '',
          Amount: parseNumericValue(item.Amount),
          Realty: item.Realty || '',
          "Buyers Name": item["Buyers Name"] || '',
          "Seller Name": item["Seller Name"] || '',
          "Sales Director": item["Sales Director"] || '',
          Broker: item.Broker || '',
          "Lot Size": parseNumericValue(item["Lot Size"]),
          Price: parseNumericValue(item.Price),
          "Payment Scheme": item["Payment Scheme"] || '',
          "Vat Status": item["Vat Status"] || '',
          TSP: parseNumericValue(item.TSP),
          "Mode of Payment": item["Mode of Payment"] || '',
          Reservation: parseNumericValue(item.Reservation),
          "Comm Price": parseNumericValue(item["Comm Price"]),
          "Misc Fee": parseNumericValue(item["Misc Fee"]),
          Vat: parseNumericValue(item.Vat),
          TCP: parseNumericValue(item.TCP),
          "1st MA": parseNumericValue(item["1st MA"]),
          "1ST MA with Holding Fee": parseNumericValue(item["1ST MA with Holding Fee"]),
          "2ND TO 48TH MA": parseNumericValue(item["2ND TO 48TH MA"]),
          "NEW TERM": item["NEW TERM"] || '',
          "PASALO PRICE": parseNumericValue(item["PASALO PRICE"]),
          "NEW MA": parseNumericValue(item["NEW MA"]),
          Status: item.Status || ''
        } as HavahillsProperty;
      }
    });
  };

  // Function to handle opening the edit modal
  const handleEditProperty = (property: Property) => {
    setCurrentProperty(property);
    setIsEditModalOpen(true);
    setSaveError(null);
  };

  // Function to handle closing the edit modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentProperty(null);
    setSaveError(null);
  };

  // Function to handle field changes
  const handleFieldChange = (field: string, value: string) => {
    if (!currentProperty) return;
    
    setCurrentProperty({
      ...currentProperty,
      [field]: value
    });
  };

  // Function to save property changes
  const handleSaveProperty = async () => {
    if (!currentProperty) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const tableName = selectedProject.id === 'LivingWater' ? 'Living Water Subdivision' : 'Havahills Estate';
      
      // Prepare update data based on property type
      let updateData: any = { Status: currentProperty.Status };
      
      if (isLivingWaterProperty(currentProperty)) {
        updateData = {
          ...updateData,
          Owner: currentProperty.Owner,
          'Due Date 15/30': currentProperty['Due Date 15/30'],
          'First Due Month': currentProperty['First Due Month'],
          Realty: currentProperty.Realty,
          'Date of Reservation': currentProperty['Date of Reservation'],
          'Seller Name': currentProperty['Seller Name'],
          'Broker / Realty': currentProperty['Broker / Realty']
        };
      } else {
        updateData = {
          ...updateData,
          'Buyers Name': currentProperty['Buyers Name'],
          Due: currentProperty.Due,
          'Date of Reservation': currentProperty['Date of Reservation'],
          'First Due': currentProperty['First Due'],
          Realty: currentProperty.Realty,
          'Seller Name': currentProperty['Seller Name'],
          'Sales Director': currentProperty['Sales Director'],
          Broker: currentProperty.Broker,
          'Mode of Payment': currentProperty['Mode of Payment']
        };
      }
      
      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', currentProperty.id);
      
      if (error) throw error;
      
      // Update local state
      setProperties(prevProperties => 
        prevProperties.map(prop => 
          prop.id === currentProperty.id ? { ...prop, ...updateData } : prop
        )
      );
      
      handleCloseEditModal();
    } catch (error: any) {
      console.error('Error updating property:', error.message);
      setSaveError('Failed to update property. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Function to check if property is Living Water
  const isLivingWaterProperty = (property: Property): property is LivingWaterProperty => {
    return 'Owner' in property;
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Inventory Management</h2>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
        {/* Search Bar - On the left */}
        <div className="w-full sm:w-96">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <input
              type="text"
              id="search"
              placeholder="Search by block, lot, owner, seller, or broker..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
            />
            <svg
              className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter Dropdown - Now on the right */}
          <div className="w-full sm:w-72">
            <Listbox value={statusFilter} onChange={setStatusFilter}>
              <div className="relative mt-1">
                <Listbox.Label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </Listbox.Label>
                <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-3 pl-4 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-opacity-75 focus-visible:ring-offset-2 sm:text-sm transition-all duration-200 hover:bg-gray-50">
                  <span className="flex items-center">
                    <span className="mr-2 text-gray-500">
                      {/* Add an icon here if needed */}
                    </span>
                    <span className="block truncate">{statusOptions.find(option => option.id === statusFilter)?.name}</span>
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {statusOptions.map((option) => (
                      <Listbox.Option
                        key={option.id}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2 pl-10 pr-4 transition-colors duration-200 ${
                            active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                          }`
                        }
                        value={option.id}
                      >
                        {({ selected }) => (
                          <>
                            <span className={`flex items-center truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                              <span className="mr-2 text-gray-500">
                                {/* Add an icon here if needed */}
                              </span>
                              {option.name}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>
          
          {/* Project Selector Dropdown - Now on the far right */}
          <div className="w-full sm:w-72">
            <Listbox value={selectedProject} onChange={setSelectedProject}>
              <div className="relative mt-1">
                <Listbox.Label className="block text-sm font-medium text-gray-700 mb-2">
                  Project
                </Listbox.Label>
                <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-3 pl-4 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-opacity-75 focus-visible:ring-offset-2 sm:text-sm transition-all duration-200 hover:bg-gray-50">
                  <span className="flex items-center">
                    <span className="mr-2 text-gray-500">
                      {selectedProject.icon("h-5 w-5")}
                    </span>
                    <span className="block truncate">{selectedProject.name}</span>
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {projects.map((project) => (
                      <Listbox.Option
                        key={project.id}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2 pl-10 pr-4 transition-colors duration-200 ${
                            active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                          }`
                        }
                        value={project}
                      >
                        {({ selected }) => (
                          <>
                            <span className={`flex items-center truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                              <span className="mr-2 text-gray-500">
                                {project.icon("h-5 w-5")}
                              </span>
                              {project.name}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="relative">
          {showScrollButtons && (
            <button
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-200 hover:bg-gray-300 rounded-lg p-2 shadow-md"
              onClick={() => scrollTable('left')}
            >
              <svg
                className="h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          
          {selectedProject.id === 'LivingWater' ? 
            renderLivingWaterTable(filteredProperties as LivingWaterProperty[]) : 
            renderHavahillsTable(filteredProperties as HavahillsProperty[])}
          
          {showScrollButtons && (
            <button
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-200 hover:bg-gray-300 rounded-lg p-2 shadow-md"
              onClick={() => scrollTable('right')}
            >
              <svg
                className="h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      )}
      
      {isEditModalOpen && currentProperty && (
        <Transition appear show={isEditModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={handleCloseEditModal}>
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
                  <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                    <div className="absolute top-0 right-0 pt-6 pr-6">
                      <button
                        onClick={handleCloseEditModal}
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    <DialogTitle as="h3" className="text-xl font-semibold leading-6 text-gray-900 mb-8">
                      Edit Property
                    </DialogTitle>

                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Editing property details for Block <span className="font-medium text-gray-900">{currentProperty.Block}</span>, Lot <span className="font-medium text-gray-900">{currentProperty.Lot}</span>
                      </p>
                    </div>

                    {saveError && (
                      <div className="rounded-md bg-red-50 p-4 mb-6">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <p className="text-sm text-red-700 mt-1">{saveError}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      {isLivingWaterProperty(currentProperty) ? (
                        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                          <div>
                            <label htmlFor="owner" className="block text-sm font-medium leading-6 text-gray-900">
                              Owner
                            </label>
                            <div className="relative mt-2 rounded-md shadow-sm">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                id="owner"
                                value={currentProperty.Owner || ''}
                                onChange={(e) => handleFieldChange('Owner', e.target.value)}
                                className="block w-full rounded-md border-0 py-2.5 pl-11 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm"
                                placeholder="Enter owner name"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium leading-6 text-gray-900">
                              Due Date
                            </label>
                            <div className="relative mt-2 rounded-md shadow-sm">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <select
                                id="dueDate"
                                value={currentProperty['Due Date 15/30'] || ''}
                                onChange={(e) => handleFieldChange('Due Date 15/30', e.target.value)}
                                className="block w-full rounded-md border-0 py-2.5 pl-11 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm"
                              >
                                <option value="">Select Due Date</option>
                                <option value="Every 15th">Every 15th</option>
                                <option value="Every 30th">Every 30th</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label htmlFor="firstDueMonth" className="block text-sm font-medium leading-6 text-gray-900">
                              First Due Month
                            </label>
                            <div className="relative mt-2 rounded-md shadow-sm">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                id="firstDueMonth"
                                value={currentProperty['First Due Month'] || ''}
                                onChange={(e) => handleFieldChange('First Due Month', e.target.value)}
                                className="block w-full rounded-md border-0 py-2.5 pl-11 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm"
                                placeholder="Enter first due month"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="realty" className="block text-sm font-medium leading-6 text-gray-900">
                              Realty
                            </label>
                            <div className="relative mt-2 rounded-md shadow-sm">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                id="realty"
                                value={currentProperty.Realty || ''}
                                onChange={(e) => handleFieldChange('Realty', e.target.value)}
                                className="block w-full rounded-md border-0 py-2.5 pl-11 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm"
                                placeholder="Enter realty name"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="dateOfReservation" className="block text-sm font-medium leading-6 text-gray-900">
                              Date of Reservation
                            </label>
                            <div className="relative mt-2 rounded-md shadow-sm">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="date"
                                id="dateOfReservation"
                                value={currentProperty['Date of Reservation'] || ''}
                                onChange={(e) => handleFieldChange('Date of Reservation', e.target.value)}
                                className="block w-full rounded-md border-0 py-2.5 pl-11 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="sellerName" className="block text-sm font-medium leading-6 text-gray-900">
                              Seller Name
                            </label>
                            <div className="relative mt-2 rounded-md shadow-sm">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                id="sellerName"
                                value={currentProperty['Seller Name'] || ''}
                                onChange={(e) => handleFieldChange('Seller Name', e.target.value)}
                                className="block w-full rounded-md border-0 py-2.5 pl-11 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm"
                                placeholder="Enter seller name"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="brokerRealty" className="block text-sm font-medium leading-6 text-gray-900">
                              Broker / Realty
                            </label>
                            <div className="relative mt-2 rounded-md shadow-sm">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                id="brokerRealty"
                                value={currentProperty['Broker / Realty'] || ''}
                                onChange={(e) => handleFieldChange('Broker / Realty', e.target.value)}
                                className="block w-full rounded-md border-0 py-2.5 pl-11 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm"
                                placeholder="Enter broker or realty name"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                          <div>
                            <label htmlFor="buyersName" className="block text-sm font-medium leading-6 text-gray-900">
                              Buyers Name
                            </label>
                            <div className="relative mt-2 rounded-md shadow-sm">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                id="buyersName"
                                value={currentProperty['Buyers Name'] || ''}
                                onChange={(e) => handleFieldChange('Buyers Name', e.target.value)}
                                className="block w-full rounded-md border-0 py-2.5 pl-11 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm"
                                placeholder="Enter buyer's name"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="due" className="block text-sm font-medium leading-6 text-gray-900">
                              Due
                            </label>
                            <div className="relative mt-2 rounded-md shadow-sm">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                id="due"
                                value={currentProperty.Due || ''}
                                onChange={(e) => handleFieldChange('Due', e.target.value)}
                                className="block w-full rounded-md border-0 py-2.5 pl-11 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm"
                                placeholder="Enter due date"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="dateOfReservation" className="block text-sm font-medium leading-6 text-gray-900">
                              Date of Reservation
                            </label>
                            <div className="relative mt-2 rounded-md shadow-sm">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="date"
                                id="dateOfReservation"
                                value={currentProperty['Date of Reservation'] || ''}
                                onChange={(e) => handleFieldChange('Date of Reservation', e.target.value)}
                                className="block w-full rounded-md border-0 py-2.5 pl-11 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="firstDue" className="block text-sm font-medium leading-6 text-gray-900">
                              First Due
                            </label>
                            <div className="relative mt-2 rounded-md shadow-sm">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                id="firstDue"
                                value={currentProperty['First Due'] || ''}
                                onChange={(e) => handleFieldChange('First Due', e.target.value)}
                                className="block w-full rounded-md border-0 py-2.5 pl-11 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm"
                                placeholder="Enter first due date"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="realty" className="block text-sm font-medium leading-6 text-gray-900">
                              Realty
                            </label>
                            <div className="relative mt-2 rounded-md shadow-sm">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                id="realty"
                                value={currentProperty.Realty || ''}
                                onChange={(e) => handleFieldChange('Realty', e.target.value)}
                                className="block w-full rounded-md border-0 py-2.5 pl-11 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm"
                                placeholder="Enter realty name"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="sellerName" className="block text-sm font-medium leading-6 text-gray-900">
                              Seller Name
                            </label>
                            <div className="relative mt-2 rounded-md shadow-sm">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                id="sellerName"
                                value={currentProperty['Seller Name'] || ''}
                                onChange={(e) => handleFieldChange('Seller Name', e.target.value)}
                                className="block w-full rounded-md border-0 py-2.5 pl-11 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm"
                                placeholder="Enter seller name"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="salesDirector" className="block text-sm font-medium leading-6 text-gray-900">
                              Sales Director
                            </label>
                            <div className="relative mt-2 rounded-md shadow-sm">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                id="salesDirector"
                                value={currentProperty['Sales Director'] || ''}
                                onChange={(e) => handleFieldChange('Sales Director', e.target.value)}
                                className="block w-full rounded-md border-0 py-2.5 pl-11 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm"
                                placeholder="Enter sales director name"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="broker" className="block text-sm font-medium leading-6 text-gray-900">
                              Broker
                            </label>
                            <div className="relative mt-2 rounded-md shadow-sm">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zM8 10a3 3 0 00-3 3v1a1 1 0 001 1h8a1 1 0 001-1v-1a3 3 0 00-3-3H8z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                id="broker"
                                value={currentProperty.Broker || ''}
                                onChange={(e) => handleFieldChange('Broker', e.target.value)}
                                className="block w-full rounded-md border-0 py-2.5 pl-11 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm"
                                placeholder="Enter broker name"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="modeOfPayment" className="block text-sm font-medium leading-6 text-gray-900">
                              Mode of Payment
                            </label>
                            <div className="relative mt-2 rounded-md shadow-sm">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <select
                                id="modeOfPayment"
                                value={currentProperty['Mode of Payment'] || ''}
                                onChange={(e) => handleFieldChange('Mode of Payment', e.target.value)}
                                className="block w-full rounded-md border-0 py-2.5 pl-11 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm"
                              >
                                <option value="">Select Mode of Payment</option>
                                <option value="Cash">Cash</option>
                                <option value="GCash">GCash</option>
                                <option value="Bank">Bank</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900">
                          Status
                        </label>
                        <div className="relative mt-2 rounded-md shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <select
                            id="status"
                            value={currentProperty.Status || ''}
                            onChange={(e) => handleFieldChange('Status', e.target.value)}
                            className="block w-full rounded-md border-0 py-2.5 pl-11 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm"
                          >
                            <option value="">Select Status</option>
                            <option value="Available">Available</option>
                            <option value="Sold">Sold</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleCloseEditModal}
                        className="inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border border-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveProperty}
                        disabled={isSaving}
                        className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSaving ? (
                          <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </div>
                        ) : 'Save Changes'}
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}
    </div>
  );
};

export default InventoryPage;
