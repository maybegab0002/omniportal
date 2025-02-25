import React, { useState, useEffect, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, HomeIcon, HomeModernIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabaseClient';

interface LivingWaterProperty {
  id: number;
  Block: string;
  Lot: string;
  DueDate: string;
  FirstDueMonth: string;
  Amount: number;
  Realty: string;
  Owner: string;
  DateOfReservation: string;
  SellerName: string;
  Broker: string;
  Reservation: number;
  LotArea: number;
  PricePerSqm: number;
  TCP: number;
  TSP: number;
  MiscFee: number;
  NetContractPrice: number;
  Term: number;
  FirstMA: number;
  AdvancePayment: number;
  FirstMANetOfAdvance: number;
  SecondToMA: number;
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

  useEffect(() => {
    fetchProperties();
  }, [selectedProject]);

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

      // Transform numeric strings to numbers based on property type
      const transformedData = data?.map(item => {
        if (selectedProject.id === 'LivingWater') {
          return {
            ...item,
            Amount: parseFloat(item.Amount) || 0,
            Reservation: parseFloat(item.Reservation) || 0,
            LotArea: parseFloat(item.LotArea) || 0,
            PricePerSqm: parseFloat(item.PricePerSqm) || 0,
            TCP: parseFloat(item.TCP) || 0,
            TSP: parseFloat(item.TSP) || 0,
            MiscFee: parseFloat(item.MiscFee) || 0,
            NetContractPrice: parseFloat(item.NetContractPrice) || 0,
            Term: parseInt(item.Term) || 0,
            FirstMA: parseFloat(item.FirstMA) || 0,
            AdvancePayment: parseFloat(item.AdvancePayment) || 0,
            FirstMANetOfAdvance: parseFloat(item.FirstMANetOfAdvance) || 0,
            SecondToMA: parseFloat(item.SecondToMA) || 0,
            Year: parseInt(item.Year) || 0
          } as LivingWaterProperty;
        } else {
          return {
            ...item,
            Amount: parseFloat(item.Amount) || 0,
            Reservation: parseFloat(item.Reservation) || 0,
            LotSize: parseFloat(item.LotSize) || 0,
            Price: parseFloat(item.Price) || 0,
            TSP: parseFloat(item.TSP) || 0,
            CommPrice: parseFloat(item.CommPrice) || 0,
            MiscFee: parseFloat(item.MiscFee) || 0,
            Vat: parseFloat(item.Vat) || 0,
            TCP: parseFloat(item.TCP) || 0,
            FirstMA: parseFloat(item.FirstMA) || 0,
            FirstMAWithHoldingFee: parseFloat(item.FirstMAWithHoldingFee) || 0,
            SecondToMA: parseFloat(item.SecondToMA) || 0,
            PasaloPrice: parseFloat(item.PasaloPrice) || 0,
            NewMA: parseFloat(item.NewMA) || 0
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
    return value.toLocaleString('en-PH');
  };

  const formatCurrency = (value: number | null) => {
    if (value == null) return '';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
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
        livingWaterProperty.SellerName,
        livingWaterProperty.Broker
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
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Showing {data.length} properties
        </span>
      </div>
      <div className="min-w-max">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky left-0 bg-gray-50 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Block</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Lot</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Due Date 15/30</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">First Due Month</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Amount</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Realty</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Owner</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Date Reserved</th>
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
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Advance</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">1st MA net of Advance</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">2nd to 60th MA</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Year</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((property) => (
              <tr key={property.id} className="hover:bg-gray-50">
                <td className="sticky left-0 bg-white px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Block}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Lot}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.DueDate}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.FirstDueMonth}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.Amount)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Realty}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Owner}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{formatDate(property.DateOfReservation)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.SellerName}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{property.Broker}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.Reservation)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatNumber(property.LotArea)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.PricePerSqm)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.TCP)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.TSP)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.MiscFee)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.NetContractPrice)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{property.Term}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.FirstMA)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.AdvancePayment)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.FirstMANetOfAdvance)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{formatCurrency(property.SecondToMA)}</td>
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap text-right">{property.Year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderHavahillsTable = (data: HavahillsProperty[]) => (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Showing {data.length} properties
        </span>
      </div>
      <div className="min-w-max">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky left-0 bg-gray-50 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Block</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Lot</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Due</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Date Reserved</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">First Due</th>
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
          LotArea: typeof livingWaterProperty.LotArea,
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
  }, [properties, selectedProject.id]);

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
        selectedProject.id === 'LivingWater' ? renderLivingWaterTable(filteredProperties as LivingWaterProperty[]) : renderHavahillsTable(filteredProperties as HavahillsProperty[])
      )}
    </div>
  );
};

export default InventoryPage;
