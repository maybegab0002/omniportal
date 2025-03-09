import React, { useState } from 'react';

const CloseDealPage: React.FC = () => {
  // Define all the steps in the deal closing process
  const steps = [
    { id: 'purchasing', name: 'Purchasing' },
    { id: 'documents', name: 'Document Upload' },
    { id: 'soa', name: 'SOA' },
    { id: 'payment', name: 'Payment' },
    { id: 'balance', name: 'Balance Creation' },
    { id: 'finish', name: 'Finish' },
    { id: 'account', name: 'Account Creation' }
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
    <div className="p-6 bg-gray-50">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Close Deal</h2>
      
      {/* Futuristic Progress Bar - Minimalist Tech Style */}
      <div className="mb-12 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        {/* Progress percentage and step name */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 flex items-center justify-center bg-black text-white rounded-md font-mono">
              {currentStep + 1}/{steps.length}
            </div>
            <div className="ml-4 font-semibold text-lg">{steps[currentStep].name}</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {Math.round((currentStep / (steps.length - 1)) * 100)}%
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Complete</div>
          </div>
        </div>
        
        {/* Horizontal progress line */}
        <div className="relative h-1 bg-gray-200 mb-8">
          {/* Main progress line */}
          <div 
            className="absolute top-0 left-0 h-full bg-black transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
          
          {/* Animated dot at the end of progress */}
          <div 
            className="absolute top-0 h-3 w-3 bg-black rounded-full -mt-1 transition-all duration-500 ease-out"
            style={{ left: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
        
        {/* Step indicators */}
        <div className="grid grid-cols-7 gap-2">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className={`
                relative py-3 px-1 text-center transition-all duration-300
                ${index === currentStep ? 'bg-black text-white' : ''}
                ${index < currentStep ? 'text-black' : 'text-gray-400'}
                ${index > currentStep ? 'text-gray-300' : ''}
                hover:bg-gray-100 cursor-pointer
              `}
              onClick={() => setCurrentStep(index)}
            >
              <div className="text-xs uppercase tracking-wider font-mono mb-1">
                Step {index + 1}
              </div>
              <div className="text-xs font-medium truncate">
                {step.name}
              </div>
              {index < currentStep && (
                <svg className="w-4 h-4 absolute top-1 right-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {steps[currentStep].name}
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
          className={`
            px-6 py-2 font-medium rounded-md transition-all duration-200
            ${currentStep === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}
          `}
        >
          Previous
        </button>
        <button
          onClick={handleNextStep}
          disabled={currentStep === steps.length - 1}
          className={`
            px-6 py-2 font-medium rounded-md transition-all duration-200
            ${currentStep === steps.length - 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}
          `}
        >
          {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default CloseDealPage;
