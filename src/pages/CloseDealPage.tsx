import React, { useState } from 'react';

const CloseDealPage: React.FC = () => {
  // Define all the steps in the deal closing process
  const steps = [
    { id: 'purchasing', name: 'Purchasing' },
    { id: 'documents', name: 'Document Upload' },
    { id: 'soa', name: 'SOA' },
    { id: 'payment', name: 'Payment' },
    { id: 'balance', name: 'Balance Creation' },
    { id: 'account', name: 'Account Creation' },
    { id: 'finish', name: 'Finish' }
  ];

  // State to track the current step (0-indexed)
  const [currentStep, setCurrentStep] = useState(0);

  // Function to handle moving to the next step
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Function to handle moving to the previous step
  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Close Deal</h2>
      
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 flex items-center justify-center rounded-full ${index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'} ${index === currentStep ? 'ring-2 ring-blue-300' : ''}`}
              >
                {index < currentStep ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className={`text-xs mt-1 ${index <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                {step.name}
              </span>
            </div>
          ))}
        </div>
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
            <div 
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-300"
            ></div>
          </div>
        </div>
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Step {currentStep + 1}: {steps[currentStep].name}
        </h3>
        <p className="text-gray-600 mb-4">
          {steps[currentStep].id === 'purchasing' && 'Complete the purchasing information for this deal.'}
          {steps[currentStep].id === 'documents' && 'Upload all required documents for this transaction.'}
          {steps[currentStep].id === 'soa' && 'Generate and review the Statement of Account (SOA).'}
          {steps[currentStep].id === 'payment' && 'Process payment information and confirm receipt.'}
          {steps[currentStep].id === 'balance' && 'Create and verify balance information.'}
          {steps[currentStep].id === 'account' && 'Set up the client account in the system.'}
          {steps[currentStep].id === 'finish' && 'Review and finalize all details to complete the deal.'}
        </p>
        <div className="bg-gray-50 p-4 rounded border border-gray-200">
          <p className="text-sm text-gray-500">Form content for this step will be implemented here...</p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handlePreviousStep}
          disabled={currentStep === 0}
          className={`px-4 py-2 rounded ${currentStep === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-600 text-white hover:bg-gray-700'}`}
        >
          Previous
        </button>
        <button
          onClick={handleNextStep}
          disabled={currentStep === steps.length - 1}
          className={`px-4 py-2 rounded ${currentStep === steps.length - 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default CloseDealPage;
