import React, { useState, useEffect, Fragment } from 'react';
import { supabase } from '../lib/supabaseClient';
import { HomeIcon, HomeModernIcon, ChevronUpDownIcon, CheckIcon, CurrencyDollarIcon, UserGroupIcon, CalendarIcon, DocumentTextIcon, BuildingOfficeIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Listbox, Transition } from '@headlessui/react';

interface DatabaseProperty {
  Block: string | number;
  Lot: string | number;
  Status: string;
  [key: string]: any;
}

interface Property extends DatabaseProperty {
  Project: string;
}

const projects = [
  { 
    id: 'LivingWater',
    name: 'Living Water Subdivision',
    icon: HomeIcon
  },
  { 
    id: 'Havahills',
    name: 'Havahills Estate',
    icon: HomeModernIcon
  }
];

const CloseDealPage: React.FC = () => {
  // Define all the steps in the deal closing process
  const steps = [
    { id: 'inventory', name: 'Inventory', description: 'Select a property from available inventory' },
    { id: 'documents', name: 'Document Upload', description: 'Upload required documentation' },
    { id: 'soa', name: 'SOA', description: 'Review Statement of Account' },
    { id: 'payment', name: 'Payment', description: 'Process payment details' },
    { id: 'balance', name: 'Balance Creation', description: 'Set up payment schedule' },
    { id: 'finish', name: 'Finish', description: 'Complete the transaction' },
    { id: 'account', name: 'Account Creation', description: 'Create client account' }
  ];

  // State to track the current step (0-indexed)
  const [currentStep, setCurrentStep] = useState(0);
  const [availableProperties, setAvailableProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editedProperty, setEditedProperty] = useState<{[key: string]: any}>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAvailableProperties();
  }, []);

  const saveAllChanges = async () => {
    if (!selectedProperty) return;
    
    try {
      setIsSaving(true);
      setError(null);

      // Prepare the updated property data
      const updatedData = {
        ...selectedProperty,
        ...editedProperty,
        Status: 'Reserved' // Update status to Reserved
      };

      // Update the appropriate table based on the project
      const { error: updateError } = await supabase
        .from(selectedProperty.Project)
        .update(updatedData)
        .eq('Block', selectedProperty.Block)
        .eq('Lot', selectedProperty.Lot);

      if (updateError) throw updateError;

      // Refresh the properties list
      await fetchAvailableProperties();

      // Move to the final step
      setCurrentStep(steps.length - 1);
    } catch (err: any) {
      console.error('Error saving changes:', err.message);
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 0 && !selectedProperty) {
      setError('Please select a property to proceed');
      return;
    }

    // If we're on the Account Creation step
    if (steps[currentStep].id === 'account') {
      await saveAllChanges();
      return;
    }

    // Otherwise, just move to the next step
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePropertySelect = (property: Property | null) => {
    setSelectedProperty(property);
    setEditedProperty({});
    setError(null);
  };

  // Function to handle property field changes
  const handlePropertyChange = (key: string, value: any) => {
    setEditedProperty(prev => ({
      ...prev,
      [key]: value
    }));
  };

  useEffect(() => {
    if (selectedProperty && selectedProperty.Project === 'Havahills Estate') {
      console.log('Havahills Estate property fields:', Object.entries(selectedProperty).map(([key, value]) => ({
        key,
        value,
        section: key.includes('Price') || key.includes('TCP') || key.includes('TSP') || 
                key.includes('Fee') || key.includes('Payment') || key === 'Amount' || 
                key.includes('MA') ? 'Financial' :
                key.includes('Name') || key.includes('Owner') || key.includes('Broker') || 
                key.includes('Realty') || key.includes('Seller') || key.includes('Director') ? 'People' :
                'Other'
      })));
    }
  }, [selectedProperty]);

  const fetchAvailableProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Living Water properties
      const { data: livingWaterData, error: livingWaterError } = await supabase
        .from('Living Water Subdivision')
        .select('*')
        .eq('Status', 'Available');

      if (livingWaterError) throw livingWaterError;

      // Fetch Havahills properties
      const { data: havahillsData, error: havahillsError } = await supabase
        .from('Havahills Estate')
        .select('*')
        .eq('Status', 'Available');

      if (havahillsError) throw havahillsError;

      // Combine and format the properties
      const formattedProperties: Property[] = [
        ...(livingWaterData || []).map((prop: any) => ({ 
          Block: prop.Block,
          Lot: prop.Lot,
          Status: prop.Status,
          Project: 'Living Water Subdivision',
          ...prop
        })),
        ...(havahillsData || []).map((prop: any) => {
          // Filter out Havahills-specific fields that shouldn't be displayed
          const { 
            'Lot Size': lotSize, 
            'VAT Status': vatStatus, 
            'VAT': vat,
            'NEW TERM': newTerm,
            'PASALO PRICE': pasaloPrice,
            ...filteredProp 
          } = prop;

          return {
            Block: prop.Block,
            Lot: prop.Lot,
            Status: prop.Status,
            Project: 'Havahills Estate',
            ...filteredProp
          };
        })
      ];

      setAvailableProperties(formattedProperties);
    } catch (err: any) {
      console.error('Error fetching properties:', err.message);
      setError('Failed to load available properties');
    } finally {
      setLoading(false);
    }
  };

  // Group properties by project
  const groupedProperties = projects.map(project => ({
    ...project,
    properties: availableProperties.filter(p => p.Project === project.name)
  }));

  const getDisplayText = (property: Property | null) => {
    if (!property) return 'Select a property';
    return `Block ${property.Block} Lot ${property.Lot} - ${property.Project}`;
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Close Deal</h2>
          <div className="text-sm text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="relative mb-8">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 rounded-full"></div>
            <div 
              className="absolute top-5 left-0 h-1 bg-blue-500 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            ></div>
            
            {/* Step Indicators */}
            <div className="relative flex justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  <button 
                    onClick={() => index < currentStep ? setCurrentStep(index) : null}
                    disabled={index > currentStep}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center relative z-10 
                      transition-all duration-300 ease-in-out shadow-md 
                      ${index === currentStep
                        ? 'bg-blue-600 text-white scale-110 ring-4 ring-blue-100'
                        : index < currentStep
                        ? 'bg-green-500 text-white cursor-pointer hover:scale-110'
                        : 'bg-white text-gray-400 border-2 border-gray-200'}
                    `}
                  >
                    {index < currentStep ? (
                      <CheckIcon className="w-6 h-6" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </button>
                  <div className="mt-3 text-xs font-medium text-center max-w-[80px] truncate">
                    <span className={`${index === currentStep ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                      {step.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Current Step Description */}
          <div className="text-center mb-2">
            <span className="inline-block px-4 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
              Step {currentStep + 1}: {steps[currentStep].name}
            </span>
          </div>
        </div>

        {/* Current Step Content */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8 border border-gray-200">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {steps[currentStep].name}
              </h3>
              <p className="text-gray-600">{steps[currentStep].description}</p>
            </div>

            {steps[currentStep].id === 'inventory' && (
              <div className="space-y-6">
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-100 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                  {/* Property Selection */}
                  <div>
                    <Listbox value={selectedProperty} onChange={handlePropertySelect} disabled={loading}>
                      <div className="relative">
                        <Listbox.Label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Available Property
                        </Listbox.Label>
                        <div className="relative">
                          <Listbox.Button className={`
                            relative w-full cursor-default rounded-lg py-3.5 pl-4 pr-10 text-left
                            transition-all duration-200 ease-out
                            border focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500
                            ${loading ? 'bg-gray-50' : 'bg-white hover:bg-blue-50/30'}
                            ${error ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300'}
                            ${!selectedProperty ? 'text-gray-500' : 'text-gray-900'}
                            shadow-sm hover:shadow group
                          `}>
                            <span className="block truncate">
                              {loading ? (
                                <span className="text-gray-400 flex items-center">
                                  <svg className="animate-spin h-4 w-4 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Loading properties...
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  {selectedProperty ? (
                                    <span className="mr-2 text-blue-500 group-hover:scale-110 transition-transform duration-200">
                                      {(() => {
                                        const ProjectIcon = projects.find(p => p.name === selectedProperty.Project)?.icon;
                                        return ProjectIcon ? <ProjectIcon className="h-5 w-5" /> : null;
                                      })()}
                                    </span>
                                  ) : (
                                    <span className="mr-2 text-gray-400">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                      </svg>
                                    </span>
                                  )}
                                  {getDisplayText(selectedProperty)}
                                </span>
                              )}
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                              {loading ? (
                                <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <ChevronUpDownIcon className="h-5 w-5 text-blue-500 group-hover:text-blue-600 transition-colors duration-200" aria-hidden="true" />
                              )}
                            </span>
                          </Listbox.Button>

                          <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 translate-y-4"
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 translate-y-4"
                            enterTo="opacity-100 translate-y-0"
                          >
                            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                              {/* Empty State */}
                              {groupedProperties.every(group => group.properties.length === 0) && (
                                <div className="px-4 py-4 text-center text-gray-500">
                                  No available properties found
                                </div>
                              )}
                              
                              {/* Project Groups */}
                              {groupedProperties.map((group) => (
                                <div key={group.name}>
                                  {/* Project Header */}
                                  <div className="sticky top-0 z-10 bg-blue-50 px-4 py-2 border-b border-blue-100">
                                    <div className="flex items-center text-sm font-semibold text-gray-900">
                                      {(() => {
                                        const GroupIcon = group.icon;
                                        return GroupIcon ? <GroupIcon className="mr-2 h-5 w-5 text-blue-500" /> : null;
                                      })()}
                                      {group.name}
                                    </div>
                                  </div>
                                  
                                  {/* Project Properties */}
                                  {group.properties.length === 0 ? (
                                    <div className="px-4 py-2 text-sm text-gray-500">
                                      No available properties
                                    </div>
                                  ) : (
                                    group.properties.map((property) => (
                                      <Listbox.Option
                                        key={`${property.Project}-${property.Block}-${property.Lot}`}
                                        value={property}
                                        className={({ active, selected }) => `
                                          relative cursor-pointer select-none py-2 pl-10 pr-4
                                          ${active ? 'bg-blue-50 text-blue-900' : 'text-gray-900'}
                                          ${selected ? 'bg-blue-50' : ''}
                                        `}
                                      >
                                        {({ selected }) => (
                                          <>
                                            <span className={`block ${selected ? 'font-medium text-blue-600' : 'font-normal'}`}>
                                              Block {property.Block} Lot {property.Lot}
                                            </span>
                                            {selected && (
                                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                              </span>
                                            )}
                                          </>
                                        )}
                                      </Listbox.Option>
                                    ))
                                  )}
                                </div>
                              ))}
                            </Listbox.Options>
                          </Transition>
                        </div>
                      </div>
                    </Listbox>
                  </div>

                  {/* Selected Property Details */}
                  {selectedProperty && (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-6 overflow-hidden">
                      <div className="p-6 border-b border-gray-200">
                        <div>
                          <h4 className="text-xl font-semibold leading-6 text-gray-900 flex items-center">
                            <DocumentTextIcon className="h-6 w-6 mr-2 text-blue-600" />
                            Property Details
                          </h4>
                          <p className="mt-1 text-sm text-gray-500">
                            View and update property information for {selectedProperty.Project}
                          </p>
                        </div>
                      </div>
                      
                      {/* Main property info */}
                      <div className="p-6 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center mb-3">
                          {(() => {
                            const ProjectIcon = projects.find(p => p.name === selectedProperty.Project)?.icon;
                            return ProjectIcon ? <ProjectIcon className="h-6 w-6 text-blue-600 mr-2" /> : null;
                          })()}
                          <h5 className="text-lg font-medium text-gray-800">{selectedProperty.Project}</h5>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium leading-6 text-gray-900 flex items-center">
                              <BuildingOfficeIcon className="h-4 w-4 mr-1 text-gray-500" /> Block
                            </span>
                            <span className="text-sm font-semibold text-gray-900 mt-1">{selectedProperty.Block}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium leading-6 text-gray-900 flex items-center">
                              <HomeIcon className="h-4 w-4 mr-1 text-gray-500" /> Lot
                            </span>
                            <span className="text-sm font-semibold text-gray-900 mt-1">{selectedProperty.Lot}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Property Information */}
                      <div className="p-6 border-b border-gray-200">
                        <h5 className="text-sm font-medium leading-6 text-gray-900 mb-4 flex items-center">
                          <DocumentTextIcon className="h-4 w-4 mr-1 text-gray-500" /> Property Information
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                          {Object.entries(selectedProperty).map(([key, value]) => {
                            // For Havahills Estate, exclude specific fields
                            if (selectedProperty.Project === 'Havahills Estate') {
                              const fieldsToExclude = [
                                'Lot Size', 'Lot size', 'LOT SIZE',
                                'VAT Status', 'VAT status', 'VAT STATUS',
                                'VAT', 'Vat',
                                'NEW TERM', 'New Term', 'New term',
                                'PASALO PRICE', 'Pasalo Price', 'Pasalo price',
                                'Terms', 'Term', 'TERMS', 'TERM'
                              ];
                              
                              // Check if the current field should be excluded
                              if (fieldsToExclude.some(excludeField => 
                                key === excludeField || 
                                key.toLowerCase() === excludeField.toLowerCase()
                              )) {
                                return null;
                              }
                            }
                            
                            // Skip properties we've already displayed, internal props, or those that belong in other categories
                            if (['Project', 'Block', 'Lot', 'Status', 'id', 'created_at'].includes(key)) return null;
                            if (key.includes('Price') || key.includes('TCP') || key.includes('TSP') || 
                                key.includes('Fee') || key.includes('Payment') || key === 'Amount' || 
                                key.includes('MA')) return null;
                            if (key.includes('Name') || key.includes('Owner') || key.includes('Broker') || 
                                key.includes('Realty') || key.includes('Seller') || key.includes('Director')) return null;
                            
                            // Skip empty values
                            if (value === null || value === undefined || value === '') return null;
                            
                            // Check if this is a non-editable field
                            const isNonEditable = ['Lot Area'].includes(key);
                            
                            return (
                              <div className="flex flex-col" key={key}>
                                <label className="block text-sm font-medium leading-6 text-gray-900 mb-1">{key}</label>
                                {isNonEditable ? (
                                  <div className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 bg-gray-50 ring-1 ring-inset ring-gray-300 sm:text-sm">
                                    {typeof value === 'number' ? value.toLocaleString() : value}
                                  </div>
                                ) : (
                                  <input
                                    type="text"
                                    className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm"
                                    value={editedProperty[key] !== undefined ? editedProperty[key] : value}
                                    onChange={(e) => handlePropertyChange(key, e.target.value)}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Financial Details */}
                      <div className="p-6 border-b border-gray-200">
                        <h5 className="text-sm font-medium leading-6 text-gray-900 mb-4 flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-500" /> Financial Details
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                          {Object.entries(selectedProperty).map(([key, value]) => {
                            // Only include financial properties
                            const isFinancial = (
                              key.includes('Price') || 
                              key.includes('TCP') || 
                              key.includes('TSP') || 
                              key.includes('MA') || 
                              key.includes('Fee') || 
                              key === 'Amount' || 
                              key === 'Reservation' ||
                              key.includes('Payment')
                            );
                            
                            if (!isFinancial) return null;
                            
                            // Skip empty values
                            if (value === null || value === undefined || value === '') return null;
                            
                            // Format display value for the input
                            let displayValue = value;
                            if (typeof value === 'number') {
                              displayValue = value.toFixed(2);
                            } else if (typeof value === 'string') {
                              // Handle string values that might contain commas and currency symbols
                              const numericValue = value.replace(/[^0-9.]/g, '');
                              if (!isNaN(parseFloat(numericValue))) {
                                displayValue = parseFloat(numericValue).toFixed(2);
                              }
                            }
                            
                            // Check if this is a non-editable field
                            const isNonEditable = ['MISC FEE', 'Misc Fee', 'Price per sqm', 'TCP', 'TSP', 'Net Contract Price'].includes(key);
                            
                            return (
                              <div className="flex flex-col" key={key}>
                                <label className="block text-sm font-medium leading-6 text-gray-900 mb-1">{key}</label>
                                <div className="relative">
                                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-500">₱</span>
                                  </div>
                                  {isNonEditable ? (
                                    <div className="block w-full rounded-md border-0 py-2 pl-8 pr-3 text-gray-900 bg-gray-50 ring-1 ring-inset ring-gray-300 sm:text-sm">
                                      {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
                                    </div>
                                  ) : (
                                    <input
                                      type="text"
                                      className="block w-full rounded-md border-0 py-2 pl-8 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm"
                                      value={editedProperty[key] !== undefined ? editedProperty[key] : displayValue}
                                      onChange={(e) => handlePropertyChange(key, e.target.value)}
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* People & Organizations */}
                      <div className="p-6 border-b border-gray-200">
                        <h5 className="text-sm font-medium leading-6 text-gray-900 mb-4 flex items-center">
                          <UserGroupIcon className="h-4 w-4 mr-1 text-gray-500" /> People & Organizations
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                          {/* Ensure critical fields are always displayed */}
                          {['Owner', 'Buyers Name', 'Seller Name', 'Broker / Realty', 'Broker', 'Realty', 'Sales Director'].map(fieldName => {
                            // Check if this field exists in the property
                            const exists = Object.keys(selectedProperty).some(key => key === fieldName);
                            const value = exists ? selectedProperty[fieldName] : '';
                            
                            // Determine which icon to use based on field name
                            let FieldIcon = UserIcon;
                            if (fieldName.includes('Broker') || fieldName.includes('Realty') || fieldName.includes('Director')) {
                              FieldIcon = BuildingOfficeIcon;
                            }
                            
                            return (
                              <div className="flex flex-col" key={fieldName}>
                                <label className="text-sm font-medium leading-6 text-gray-900 mb-1 flex items-center">
                                  <FieldIcon className="h-4 w-4 mr-1 text-gray-500" />
                                  {fieldName}
                                </label>
                                <div className="relative">
                                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <UserIcon className="h-4 w-4 text-gray-400" />
                                  </div>
                                  <input
                                    type="text"
                                    className="block w-full rounded-md border-0 py-2 pl-8 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm"
                                    value={editedProperty[fieldName] !== undefined ? editedProperty[fieldName] : value}
                                    onChange={(e) => handlePropertyChange(fieldName, e.target.value)}
                                    placeholder={`Enter ${fieldName}`}
                                  />
                                </div>
                              </div>
                            );
                          })}
                          
                          {/* Display any additional people/org fields that might exist */}
                          {Object.entries(selectedProperty).map(([key, value]) => {
                            // Only include people/org properties that weren't explicitly added above
                            const isPeopleOrg = (
                              key.includes('Name') || 
                              key.includes('Owner') || 
                              key.includes('Broker') || 
                              key.includes('Realty') || 
                              key.includes('Seller') ||
                              key.includes('Director')
                            );
                            
                            // Skip fields we explicitly added above
                            if (['Owner', 'Buyers Name', 'Seller Name', 'Broker / Realty', 'Broker', 'Realty', 'Sales Director'].includes(key)) {
                              return null;
                            }
                            
                            if (!isPeopleOrg) return null;
                            
                            // Skip empty values
                            if (value === null || value === undefined || value === '') return null;
                            
                            return (
                              <div className="flex flex-col" key={key}>
                                <label className="block text-sm font-medium leading-6 text-gray-900 mb-1">{key}</label>
                                <div className="relative">
                                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <UserIcon className="h-4 w-4 text-gray-400" />
                                  </div>
                                  <input
                                    type="text"
                                    className="block w-full rounded-md border-0 py-2 pl-8 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm"
                                    value={editedProperty[key] !== undefined ? editedProperty[key] : value}
                                    onChange={(e) => handlePropertyChange(key, e.target.value)}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Dates & Schedule */}
                      <div className="p-6">
                        <h5 className="text-sm font-medium leading-6 text-gray-900 mb-4 flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1 text-gray-500" /> Dates & Schedule
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                          {/* Ensure critical date fields are always displayed */}
                          {['Date of Reservation', 'First Due Month', 'First Due'].map(fieldName => {
                            // Check if this field exists in the property
                            const exists = Object.keys(selectedProperty).some(key => key === fieldName);
                            const value = exists ? selectedProperty[fieldName] : '';
                            
                            return (
                              <div className="flex flex-col" key={fieldName}>
                                <label className="text-sm font-medium leading-6 text-gray-900 mb-1 flex items-center">
                                  <ClockIcon className="h-4 w-4 mr-1 text-gray-500" />
                                  {fieldName}
                                </label>
                                <div className="relative">
                                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                                  </div>
                                  <input
                                    type="text"
                                    className="block w-full rounded-md border-0 py-2 pl-8 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm"
                                    value={editedProperty[fieldName] !== undefined ? editedProperty[fieldName] : value}
                                    onChange={(e) => handlePropertyChange(fieldName, e.target.value)}
                                    placeholder={`Enter ${fieldName}`}
                                  />
                                </div>
                              </div>
                            );
                          })}
                          
                          {/* Display any additional date fields that might exist */}
                          {Object.entries(selectedProperty)
                            .filter(([key]) => {
                              // Only show these fields for both property types
                              return ['Date of Reservation', 'First Due Month', 'First Due'].includes(key);
                            })
                            .map(([key, value]) => {
                              // Skip fields we explicitly added above
                              if (['Date of Reservation', 'First Due Month', 'First Due'].includes(key)) {
                                return null;
                              }

                              // Skip empty values
                              if (value === null || value === undefined || value === '') {
                                return null;
                              }

                              return (
                                <div className="flex flex-col" key={key}>
                                  <label className="text-sm font-medium leading-6 text-gray-900 mb-1">{key}</label>
                                  <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                      type="text"
                                      className="block w-full rounded-md border-0 py-2 pl-8 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 hover:ring-gray-400 transition-all duration-200 sm:text-sm"
                                      value={editedProperty[key] !== undefined ? editedProperty[key] : value}
                                      onChange={(e) => handlePropertyChange(key, e.target.value)}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {steps[currentStep].id === 'documents' && (
              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <p className="text-gray-600">Upload all required documents for this transaction.</p>
              </div>
            )}
            {steps[currentStep].id === 'soa' && (
              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <p className="text-gray-600">Generate and review the Statement of Account (SOA).</p>
              </div>
            )}
            {steps[currentStep].id === 'payment' && (
              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <p className="text-gray-600">Process payment information and confirm receipt.</p>
              </div>
            )}
            {steps[currentStep].id === 'balance' && (
              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <p className="text-gray-600">Create and verify balance information.</p>
              </div>
            )}
            {steps[currentStep].id === 'account' && (
              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <p className="text-gray-600">Set up the client account in the system.</p>
              </div>
            )}
            {steps[currentStep].id === 'finish' && (
              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <p className="text-gray-600">Review and finalize all details to complete the deal.</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handlePreviousStep}
            disabled={currentStep === 0}
            className={`
              px-4 py-2 text-sm font-medium rounded-md
              ${currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}
            `}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleNextStep}
            disabled={isSaving}
            className={`
              px-4 py-2 text-sm font-medium text-white rounded-md
              ${isSaving
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'}
            `}
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving Changes...
              </span>
            ) : (
              steps[currentStep].id === 'account' ? 'Save & Finish' : 'Next'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CloseDealPage;
