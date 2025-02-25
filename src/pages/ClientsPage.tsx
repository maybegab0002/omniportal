import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Client {
  id: number;
  Name: string;
}

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchClients();
  }, [currentPage]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredClients(clients);
      setTotalPages(Math.ceil(clients.length / itemsPerPage));
    } else {
      const filtered = clients.filter(client =>
        client.Name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredClients(filtered);
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));
      setCurrentPage(1);
    }
  }, [searchQuery, clients]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('Clients')
        .select('id, Name')
        .order('Name', { ascending: true });

      if (error) throw error;

      setClients(data || []);
      setFilteredClients(data || []);
      setTotalPages(Math.ceil((data?.length || 0) / itemsPerPage));
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPageClients = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(startIndex, startIndex + itemsPerPage);
  };

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg overflow-hidden">
          <div className="px-6 py-4 flex items-center space-x-4">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate">
              Clients
            </h2>
            {!loading && (
              <p className="mt-2 text-sm text-gray-600">
                Showing {filteredClients.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredClients.length)} of {filteredClients.length} clients
              </p>
            )}
          </div>
          <div className="mt-4 md:mt-0 md:ml-4">
            <div className="relative rounded-md shadow-sm max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients..."
                className="block w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
              {searchQuery && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black ring-opacity-5">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="relative">
                <div className="h-24 w-24">
                  <div className="absolute h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500"></div>
                  <div className="absolute h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
                </div>
                <div className="mt-4 text-center text-sm text-gray-600">Loading clients...</div>
              </div>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr>
                    <th scope="col" className="bg-gray-50/50 px-6 py-3 text-left">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Client Name
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {getCurrentPageClients().map((client, index) => (
                    <tr 
                      key={client.id}
                      className={`group transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      } hover:bg-blue-50/50`}
                    >
                      <td className="px-6 py-2.5">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
                              <span className="text-blue-700 font-medium text-xs">
                                {client.Name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                              {client.Name}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredClients.length === 0 && (
                    <tr>
                      <td className="px-6 py-12 text-center">
                        <div className="max-w-sm mx-auto">
                          <div className="bg-gray-50 rounded-xl p-6">
                            <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="mt-3 text-gray-500 text-sm">
                              {searchQuery ? 'No clients found matching your search' : 'No clients found'}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 rounded-b-2xl">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`group relative inline-flex items-center rounded-full p-1.5 ${
                        currentPage === 1
                          ? 'cursor-not-allowed'
                          : 'hover:bg-blue-100 text-gray-500 hover:text-blue-600'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg 
                        className={`h-5 w-5 transition-transform duration-200 ${
                          currentPage !== 1 && 'group-hover:-translate-x-1'
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`group relative inline-flex items-center rounded-full p-1.5 ${
                        currentPage === totalPages
                          ? 'cursor-not-allowed'
                          : 'hover:bg-blue-100 text-gray-500 hover:text-blue-600'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg 
                        className={`h-5 w-5 transition-transform duration-200 ${
                          currentPage !== totalPages && 'group-hover:translate-x-1'
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;
