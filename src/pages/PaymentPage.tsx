import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';

interface Client {
  id: number;
  Name: string;
}

const PaymentPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client =>
        client.Name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredClients(filtered);
    }
  }, [searchQuery, clients]);

  useEffect(() => {
    if (selectedClient) {
      fetchClientBalance(selectedClient.id);
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('Clients')
        .select('id, Name')
        .order('Name', { ascending: true });
      
      if (error) throw error;
      if (data) {
        setClients(data);
        setFilteredClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchClientBalance = async (clientId: number) => {
    try {
      // Replace this query with your actual balance calculation logic
      const { data, error } = await supabase
        .from('payments')
        .select('amount')
        .eq('client_id', clientId);
      
      if (error) throw error;
      
      // Calculate total balance - modify this according to your business logic
      const totalBalance = data ? data.reduce((sum, payment) => sum + payment.amount, 0) : 0;
      setBalance(totalBalance.toString());
    } catch (error) {
      console.error('Error fetching client balance:', error);
      setBalance('0');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log({
      client: selectedClient,
      startDate,
      endDate,
      amount,
      balance
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Payment</h2>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Client Search/Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Select Client
              </label>
              <div className="relative">
                <Combobox value={selectedClient} onChange={setSelectedClient}>
                  <div className="relative">
                    <div className="relative w-full">
                      <Combobox.Input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pr-10"
                        displayValue={(client: Client | null) => client?.Name || ''}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Type or select client..."
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center px-2">
                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </Combobox.Button>
                    </div>
                    <Combobox.Options className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto focus:outline-none text-sm">
                      {filteredClients.length === 0 && searchQuery !== '' ? (
                        <div className="px-3 py-2 text-gray-500">
                          No clients found.
                        </div>
                      ) : (
                        filteredClients.map((client) => (
                          <Combobox.Option
                            key={client.id}
                            value={client}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-2 px-3 ${
                                active ? 'bg-blue-600 text-white' : 'text-gray-900'
                              }`
                            }
                          >
                            {client.Name}
                          </Combobox.Option>
                        ))
                      )}
                    </Combobox.Options>
                  </div>
                </Combobox>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Balance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Balance
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₱</span>
                  <input
                    type="number"
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₱</span>
                  <input
                    type="number"
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150 font-medium text-sm"
              >
                Submit Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
