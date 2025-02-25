import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Client {
  id: number;
  Name: string;
  firstName?: string;
  lastName?: string;
}

interface Document {
  id: number;
  Name: string;
  'TIN ID': string;
  Email: string;
  'Contact No': string;
  'Marital Status': string;
  created_at: string;
}

interface ClientWithDocs extends Client {
  documents: Document[];
}

interface DocumentForm {
  Address: string;
  'TIN ID': string;
  Email: string;
  'Contact No': string;
  'Marital Status': string;
  file: File | null;
}

const DocumentsPage: React.FC = () => {
  const [clients, setClients] = useState<ClientWithDocs[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientWithDocs[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByLastName, setSortByLastName] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<DocumentForm>({
    Address: '',
    'TIN ID': '',
    Email: '',
    'Contact No': '',
    'Marital Status': '',
    file: null
  });
  const [uploadStatus, setUploadStatus] = useState<string>('');

  useEffect(() => {
    fetchClientsWithDocs();
  }, []);

  // Process and sort clients
  useEffect(() => {
    const processedClients = clients.map(client => {
      const nameParts = client.Name.split(' ');
      return {
        ...client,
        firstName: nameParts[0] || '',
        lastName: nameParts[nameParts.length - 1] || ''
      };
    });

    // Sort based on toggle
    const sortedClients = [...processedClients].sort((a, b) => 
      sortByLastName
        ? (a.lastName || '').localeCompare(b.lastName || '')
        : (a.firstName || '').localeCompare(b.firstName || '')
    );

    // Filter based on search query
    const filtered = searchQuery
      ? sortedClients.filter(client =>
          client.Name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : sortedClients;

    setFilteredClients(filtered);
  }, [clients, searchQuery, sortByLastName]);

  const fetchClientsWithDocs = async () => {
    try {
      const { data: clientsData, error: clientsError } = await supabase
        .from('Clients')
        .select('id, Name')
        .order('Name');

      if (clientsError) throw clientsError;

      // Fetch documents for each client
      const clientsWithDocs = await Promise.all((clientsData || []).map(async (client) => {
        const { data: docs, error: docsError } = await supabase
          .from('Documents')
          .select('*')
          .eq('Name', client.Name);

        if (docsError) {
          console.error(`Error fetching documents for client ${client.Name}:`, docsError);
          return { ...client, documents: [] };
        }

        return { ...client, documents: docs || [] };
      }));

      setClients(clientsWithDocs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = () => {
    setSortByLastName(!sortByLastName);
  };

  const handleUpload = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
    setFormData({
      Address: '',
      'TIN ID': '',
      Email: '',
      'Contact No': '',
      'Marital Status': '',
      file: null
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        file: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !formData.file) return;

    setUploadStatus('Uploading...');
    try {
      // 1. Upload file to storage bucket
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${selectedClient.Name}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('Clients Document')
        .upload(fileName, formData.file);

      if (uploadError) throw uploadError;

      // 2. Save document metadata to Documents table
      const { error: dbError } = await supabase
        .from('Documents')
        .insert([
          {
            Name: selectedClient.Name,
            Address: formData.Address,
            'TIN ID': formData['TIN ID'],
            Email: formData.Email,
            'Contact No': formData['Contact No'],
            'Marital Status': formData['Marital Status'],
          }
        ]);

      if (dbError) throw dbError;

      // 3. Refresh the clients list to show updated documents
      await fetchClientsWithDocs();

      setUploadStatus('Upload successful!');
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadStatus(`Error: ${err.message}`);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
    setUploadStatus('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Documents</h1>
      
      <div className="flex gap-4 mb-4">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search clients..."
          className="flex-1 p-2 border rounded-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        {/* Sort Toggle Button */}
        <button
          onClick={toggleSort}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Sort by {sortByLastName ? 'First Name' : 'Last Name'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{client.Name}</h2>
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {client.documents?.length || 0} docs
              </span>
            </div>
            
            <div className="text-gray-500 text-sm mb-4">
              {client.documents && client.documents.length > 0 ? (
                <div className="space-y-1">
                  {client.documents.map((doc, index) => (
                    <div key={doc.id || index} className="flex items-center">
                      <span className="truncate">{doc.Name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div>No documents uploaded yet</div>
              )}
            </div>

            <button
              onClick={() => handleUpload(client)}
              className="w-full text-blue-500 hover:text-blue-600 text-sm font-medium py-2 border border-blue-500 rounded-lg hover:bg-blue-50"
            >
              Upload New Document
            </button>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Upload Document</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="Address"
                  value={formData.Address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TIN ID
                </label>
                <input
                  type="text"
                  name="TIN ID"
                  value={formData['TIN ID']}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact No
                </label>
                <input
                  type="text"
                  name="Contact No"
                  value={formData['Contact No']}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marital Status
                </label>
                <select
                  name="Marital Status"
                  value={formData['Marital Status']}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">Select status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full"
                  required
                />
              </div>

              {uploadStatus && (
                <div className={`text-sm ${
                  uploadStatus.includes('Error') 
                    ? 'text-red-500' 
                    : uploadStatus === 'Upload successful!' 
                      ? 'text-green-500' 
                      : 'text-blue-500'
                }`}>
                  {uploadStatus}
                </div>
              )}

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
