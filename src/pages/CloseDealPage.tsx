import React, { useState, useEffect, Fragment } from 'react';
import { supabase } from '../lib/supabaseClient';
import { HomeIcon, HomeModernIcon, ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Listbox, Transition } from '@headlessui/react';

interface DatabaseProperty {
  Block: string | number;
  Lot: string | number;
  Status: string;
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

  useEffect(() => {
    fetchAvailableProperties();
  }, []);

  const fetchAvailableProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Living Water properties
      const { data: livingWaterData, error: livingWaterError } = await supabase
        .from('Living Water Subdivision')
        .select('Block, Lot, Status')
        .eq('Status', 'Available');

      if (livingWaterError) throw livingWaterError;

      // Fetch Havahills properties
      const { data: havahillsData, error: havahillsError } = await supabase
        .from('Havahills Estate')
        .select('Block, Lot, Status')
        .eq('Status', 'Available');

      if (havahillsError) throw havahillsError;

      // Combine and format the properties
      const formattedProperties: Property[] = [
        ...(livingWaterData || []).map((prop: DatabaseProperty) => ({ 
          ...prop, 
          Project: 'Living Water Subdivision' 
        })),
        ...(havahillsData || []).map((prop: DatabaseProperty) => ({ 
          ...prop, 
          Project: 'Havahills Estate' 
        }))
      ];

      setAvailableProperties(formattedProperties);
    } catch (err: any) {
      console.error('Error fetching properties:', err.message);
      setError('Failed to load available properties');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 0 && !selectedProperty) {
      setError('Please select a property to proceed');
      return;
    }
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
    setError(null);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Close Deal</h2>
          <div className="text-sm text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 relative ${
                  index !== steps.length - 1 ? 'after:content-[""] after:h-[2px] after:w-full after:absolute after:top-4 after:left-1/2 after:bg-gray-200' : ''
                }`}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 transition-colors duration-200 ${
                      index === currentStep
                        ? 'bg-blue-600 text-white'
                        : index < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckIcon className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="mt-2 text-xs font-medium text-gray-500">
                    {step.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-xl p-8 mb-8 border border-blue-100">
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
                  <div className="rounded-2xl bg-red-50 border border-red-100 p-4 backdrop-blur-lg">
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
                            relative w-full cursor-default rounded-2xl py-4 pl-4 pr-10 text-left
                            backdrop-blur-xl transition-all duration-200 ease-out
                            border focus:outline-none focus:ring-2 focus:ring-blue-500/50 sm:text-sm
                            ${loading ? 'bg-gray-50' : 'bg-white hover:bg-blue-50/50'}
                            ${error ? 'border-red-300' : 'border-blue-200'}
                            ${!selectedProperty ? 'text-gray-500' : 'text-gray-900'}
                            group shadow-sm hover:shadow-md
                          `}>
                            <span className="block truncate">
                              {loading ? (
                                <span className="text-gray-400">Loading properties...</span>
                              ) : (
                                <span className="flex items-center">
                                  {selectedProperty && (
                                    <span className="mr-2 transition-transform duration-200 ease-out group-hover:scale-110">
                                      {projects.find(p => p.name === selectedProperty.Project)?.icon({
                                        className: "h-5 w-5 text-blue-500"
                                      })}
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
                                <ChevronUpDownIcon className="h-5 w-5 text-blue-500 transition-transform duration-200 ease-out group-hover:scale-110" aria-hidden="true" />
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
                            <Listbox.Options className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-2xl bg-white/90 backdrop-blur-xl py-2 text-base shadow-xl ring-1 ring-black/5 focus:outline-none sm:text-sm">
                              {groupedProperties.map((group) => (
                                <div key={group.id}>
                                  <div className="sticky top-0 z-10 backdrop-blur-xl bg-blue-50/90 px-4 py-3 border-b border-blue-100">
                                    <div className="flex items-center text-sm font-semibold text-gray-900">
                                      <group.icon className="mr-2 h-5 w-5 text-blue-500" />
                                      {group.name}
                                    </div>
                                  </div>
                                  {group.properties.length === 0 ? (
                                    <div className="px-4 py-3 text-sm text-gray-500 italic">
                                      No available properties
                                    </div>
                                  ) : (
                                    group.properties.map((property) => (
                                      <Listbox.Option
                                        key={`${property.Project}-${property.Block}-${property.Lot}`}
                                        value={property}
                                        className={({ active, selected }) => `
                                          relative cursor-default select-none py-3 pl-10 pr-4
                                          transition-all duration-150 ease-out
                                          ${active ? 'bg-blue-50 text-blue-900' : 'text-gray-900'}
                                          ${selected ? 'bg-blue-50/50' : ''}
                                          hover:bg-blue-50
                                        `}
                                      >
                                        {({ selected, active }) => (
                                          <>
                                            <span className={`block truncate ${selected ? 'font-medium text-blue-600' : 'font-normal'}`}>
                                              Block {property.Block} Lot {property.Lot}
                                            </span>
                                            {selected && (
                                              <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-blue-600' : 'text-blue-600'}`}>
                                                <CheckIcon className="h-5 w-5 transition-all duration-200 ease-out" aria-hidden="true" />
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
                    <div className="backdrop-blur-xl bg-white/90 rounded-2xl p-6 border border-blue-100 transition-all duration-300 ease-out hover:shadow-lg hover:bg-blue-50/50">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Selected Property Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="flex flex-col">
                          <dt className="text-sm font-medium text-gray-500 mb-1">Project</dt>
                          <dd className="text-sm text-gray-900 font-medium">
                            <div className="flex items-center">
                              {projects.find(p => p.name === selectedProperty.Project)?.icon({
                                className: "h-5 w-5 text-blue-500 mr-2"
                              })}
                              {selectedProperty.Project}
                            </div>
                          </dd>
                        </div>
                        <div className="flex flex-col">
                          <dt className="text-sm font-medium text-gray-500 mb-1">Block</dt>
                          <dd className="text-sm text-gray-900 font-medium">{selectedProperty.Block}</dd>
                        </div>
                        <div className="flex flex-col">
                          <dt className="text-sm font-medium text-gray-500 mb-1">Lot</dt>
                          <dd className="text-sm text-gray-900 font-medium">{selectedProperty.Lot}</dd>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {steps[currentStep].id === 'documents' && (
              <p className="text-gray-600">Upload all required documents for this transaction.</p>
            )}
            {steps[currentStep].id === 'soa' && (
              <p className="text-gray-600">Generate and review the Statement of Account (SOA).</p>
            )}
            {steps[currentStep].id === 'payment' && (
              <p className="text-gray-600">Process payment information and confirm receipt.</p>
            )}
            {steps[currentStep].id === 'balance' && (
              <p className="text-gray-600">Create and verify balance information.</p>
            )}
            {steps[currentStep].id === 'account' && (
              <p className="text-gray-600">Set up the client account in the system.</p>
            )}
            {steps[currentStep].id === 'finish' && (
              <p className="text-gray-600">Review and finalize all details to complete the deal.</p>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePreviousStep}
            disabled={currentStep === 0}
            className={`
              px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200
              ${currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }
            `}
          >
            Previous
          </button>
          <button
            onClick={handleNextStep}
            disabled={currentStep === steps.length - 1}
            className={`
              px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200
              ${currentStep === steps.length - 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CloseDealPage;
