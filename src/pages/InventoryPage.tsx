import React, { useState, useEffect, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, HomeIcon, HomeModernIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabaseClient';

interface LivingWaterProperty {
  id: number;
  Block: string;
  Lot: string;
  "Due Date 15/30": string;
  "First Due Month": string;
  Amount: number;
  Realty: string;
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
  Term: number;
  "First MA": number;
  "Advance Payment": number;
  "1st MA net of Advance Payment": number;
  "2ndto60th MA": number;
  Year: number;
  created_at?: string;
}

interface HavahillsProperty {
  id: number;
  Block: string;
  Lot: string;
  Due: string;
  DateOfReservation: string;
  FirstDueMonth: string;
  Terms: string;
  Amount: number;
  Realty: string;
  BuyersName: string;
  SellerName: string;
  SalesDirector: string;
  Broker: string;
  LotSize: number;
  Price: number;
  PaymentScheme: string;
  VatStatus: string;
  TSP: number;
  ModeOfPayment: string;
  Reservation: number;
  CommPrice: number;
  MiscFee: number;
  Vat: number;
  TCP: number;
  FirstMA: number;
  FirstMAWithHoldingFee: number;
  SecondToMA: number;
  NewTerm: string;
  PasaloPrice: number;
  NewMA: number;
  created_at?: string;
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

const InventoryPage: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButtons, setShowScrollButtons] = useState(false);

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
      const transformedData = data?.map(item => {
        if (selectedProject.id === 'LivingWater') {
          // Log a sample of raw numeric values to debug
          if (data.length > 0 && item.id === data[0].id) {
            console.log('Sample raw numeric values:', {
              TCP: item.TCP,
              TSP: item.TSP,
              "Net Contract Price": item["Net Contract Price"]
            });
          }
          
          return {
            ...item,
            Amount: parseNumericValue(item.Amount),
            Reservation: parseNumericValue(item.Reservation),
            "Lot Area": parseNumericValue(item["Lot Area"]),
            "Price per sqm": parseNumericValue(item["Price per sqm"]),
            TCP: parseNumericValue(item.TCP),
            TSP: parseNumericValue(item.TSP),
            "MISC FEE": parseNumericValue(item["MISC FEE"]),
            "Net Contract Price": parseNumericValue(item["Net Contract Price"]),
            Term: parseInt(String(item.Term)) || 0,
            "First MA": parseNumericValue(item["First MA"]),
            "Advance Payment": parseNumericValue(item["Advance Payment"]),
            "1st MA net of Advance Payment": parseNumericValue(item["1st MA net of Advance Payment"]),
            "2ndto60th MA": parseNumericValue(item["2ndto60th MA"]),
            Year: parseInt(String(item.Year)) || 0
          } as LivingWaterProperty;
        } else {
          return {
            ...item,
            Amount: parseNumericValue(item.Amount),
            Reservation: parseNumericValue(item.Reservation),
            LotSize: parseNumericValue(item.LotSize),
            Price: parseNumericValue(item.Price),
            TSP: parseNumericValue(item.TSP),
            CommPrice: parseNumericValue(item.CommPrice),
            MiscFee: parseNumericValue(item.MiscFee),
            Vat: parseNumericValue(item.Vat),
            TCP: parseNumericValue(item.TCP),
            FirstMA: parseNumericValue(item.FirstMA),
            FirstMAWithHoldingFee: parseNumericValue(item.FirstMAWithHoldingFee),
            SecondToMA: parseNumericValue(item.SecondToMA),
            PasaloPrice: parseNumericValue(item.PasaloPrice),
            NewMA: parseNumericValue(item.NewMA)
          } as HavahillsProperty;
        }
      }) || [];

      // Sort the data by Block and Lot
      const sortedData = transformedData.sort((a, b) => {
        // Convert Block to number for comparison (remove any non-numeric characters)
        const blockA = parseInt(String(a.Block).replace(/\D/g, '') || '0');
        const blockB = parseInt(String(b.Block).replace(/\D/g, '') || '0');
        
        // If blocks are different, sort by block
        if (blockA !== blockB) {
          return blockA - blockB;
        }
        
        // If blocks are the same, sort by lot
        const lotA = parseInt(String(a.Lot).replace(/\D/g, '') || '0');
        const lotB = parseInt(String(b.Lot).replace(/\D/g, '') || '0');
        return lotA - lotB;
      });

      setProperties(sortedData);
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
        havahillsProperty.BuyersName,
        havahillsProperty.SellerName,
        havahillsProperty.Broker
      ].some(field => field?.toString().toLowerCase().includes(searchLower));
    }
  });

  console.log('Filtered properties length:', filteredProperties.length);

  const renderLivingWaterTable = (data: LivingWaterProperty[]) => (
    <div className="overflow-x-auto bg-white rounded-lg shadow inventory-table-container" style={{ overflowX: 'scroll', position: 'relative' }}>
      <div className="p-4 border-b flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Showing {data.length} properties
        </span>
      </div>
      <div className="min-w-max">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="sticky left-0 bg-gray-50 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Block</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Lot</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Due Date 15/30</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">First Due Month</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Amount</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Realty</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Owner</th>
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
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Term</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">First MA</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Advance Payment</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">1st MA net of Advance Payment</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">2ndto60th MA</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Year</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((property) => (
              <tr key={property.id} className="hover:bg-gray-50">
                <td className="sticky left-0 bg-white px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Block}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Lot}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property["Due Date 15/30"]}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property["First Due Month"]}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.Amount)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Realty}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Owner}</td>
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
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{property.Term}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property["First MA"])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property["Advance Payment"])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property["1st MA net of Advance Payment"])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property["2ndto60th MA"])}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{property.Year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderHavahillsTable = (data: HavahillsProperty[]) => (
    <div className="overflow-x-auto bg-white rounded-lg shadow inventory-table-container" style={{ overflowX: 'scroll', position: 'relative' }}>
      <div className="p-4 border-b flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Showing {data.length} properties
        </span>
      </div>
      <div className="min-w-max">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="sticky left-0 bg-gray-50 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Block</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Lot</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Due</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Date of Reservation</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">First Due Month</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Terms</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Amount</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Realty</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Buyers Name</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Seller Name</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Sales Director</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Broker</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Lot Size</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Price</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Payment Scheme</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Vat Status</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">TSP</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Mode of Payment</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Reservation</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Comm Price</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Misc Fee</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Vat</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">TCP</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">1st MA</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">1ST MA with Holding Fee</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">2ND TO 48TH MA</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">NEW TERM</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">PASALO PRICE</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">NEW MA</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((property) => (
              <tr key={property.id} className="hover:bg-gray-50">
                <td className="sticky left-0 bg-white px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Block}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Lot}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Due}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.DateOfReservation}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.FirstDueMonth}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Terms}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{formatCurrency(property.Amount)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Realty}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.BuyersName}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.SellerName}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.SalesDirector}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Broker}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.LotSize}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{formatCurrency(property.Price)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.PaymentScheme}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.VatStatus}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{formatCurrency(property.TSP)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.ModeOfPayment}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{formatCurrency(property.Reservation)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{formatCurrency(property.CommPrice)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{formatCurrency(property.MiscFee)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{formatCurrency(property.Vat)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{formatCurrency(property.TCP)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{formatCurrency(property.FirstMA)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{formatCurrency(property.FirstMAWithHoldingFee)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{formatCurrency(property.SecondToMA)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.NewTerm}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{formatCurrency(property.PasaloPrice)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{formatCurrency(property.NewMA)}</td>
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

  useEffect(() => {
    // Add a style tag to hide the bottom scrollbar but keep the functionality
    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-custom-styles', 'true');
    styleElement.textContent = `
      .inventory-table-container::-webkit-scrollbar {
        display: none;
      }
      .inventory-table-container {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
      }
      .top-scrollbar-container::-webkit-scrollbar {
        height: 8px;
      }
      .top-scrollbar-container::-webkit-scrollbar-track {
        background: #f3f4f6;
      }
      .top-scrollbar-container::-webkit-scrollbar-thumb {
        background-color: #6b7280;
        border-radius: 4px;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      // Clean up the style element when component unmounts
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
          LotSize: typeof havahillsProperty.LotSize,
          TCP: typeof havahillsProperty.TCP
        });
      }
    }
  }, [properties, selectedProject]);

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg shadow">
        <div className="w-full sm:w-72">
          <Listbox value={selectedProject} onChange={setSelectedProject}>
            <div className="relative mt-1">
              <Listbox.Label className="block text-sm font-medium text-gray-700 mb-2">
                Select Project
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
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
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
    </div>
  );
};

export default InventoryPage;
