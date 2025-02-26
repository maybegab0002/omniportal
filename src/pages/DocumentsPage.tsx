import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Client {
  id: number;
  Name: string;
  firstName?: string;
  lastName?: string;
}

interface Document {
  id: number;
  Name: string;
  'TIN ID': string | null;
  Email: string | null;
  'Contact No': string | null;
  'Marital Status': string | null;
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
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

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

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData(prev => ({
        ...prev,
        file: e.dataTransfer.files[0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !formData.file) return;

    setUploadStatus('Uploading...');
    setIsUploading(true);
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
            Address: formData.Address || null,
            'TIN ID': formData['TIN ID'] || null,
            Email: formData.Email || null,
            'Contact No': formData['Contact No'] || null,
            'Marital Status': formData['Marital Status'] || null,
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
    } finally {
      setIsUploading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
    setUploadStatus('');
    setDragActive(false);
    setIsUploading(false);
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
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
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
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900">
                      Upload Document
                    </Dialog.Title>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full p-1"
                      onClick={closeModal}
                    >
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                  
                  {selectedClient && (
                    <div className="mb-6 bg-blue-50 p-4 rounded-lg flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <span className="text-blue-700 font-bold">{selectedClient.Name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm text-blue-800 font-medium">
                          {selectedClient.Name}
                        </p>
                        <p className="text-xs text-blue-600">
                          Uploading new document
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        name="Address"
                        value={formData.Address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        TIN ID
                      </label>
                      <input
                        type="text"
                        name="TIN ID"
                        value={formData['TIN ID']}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="Email"
                          value={formData.Email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact No
                        </label>
                        <input
                          type="text"
                          name="Contact No"
                          value={formData['Contact No']}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Marital Status
                      </label>
                      <select
                        name="Marital Status"
                        value={formData['Marital Status']}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">Select status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Document
                      </label>
                      <div 
                        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors ${dragActive ? 'bg-blue-50' : ''}`}
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                      >
                        <div className="space-y-1 text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                            >
                              <span>Upload a file</span>
                              <input 
                                id="file-upload" 
                                name="file-upload" 
                                type="file" 
                                className="sr-only" 
                                onChange={handleFileChange}
                                required
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PDF, PNG, JPG, GIF up to 10MB
                          </p>
                          {formData.file && (
                            <div className="mt-3 text-center">
                              <p className="text-sm text-blue-600 font-medium">
                                Selected: {formData.file.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                              {formData.file.type.startsWith('image/') && (
                                <div className="mt-2 border rounded-lg overflow-hidden max-w-xs mx-auto">
                                  <img
                                    src={URL.createObjectURL(formData.file)}
                                    alt="Preview"
                                    className="max-h-32 object-contain mx-auto"
                                    onLoad={(e) => {
                                      // Clean up the object URL after the image loads to avoid memory leaks
                                      return () => URL.revokeObjectURL((e.target as HTMLImageElement).src);
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {uploadStatus && (
                      <div className={`p-3 rounded-lg ${
                        uploadStatus.includes('Error') 
                          ? 'bg-red-50 text-red-700' 
                          : uploadStatus === 'Upload successful!' 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-blue-50 text-blue-700'
                      }`}>
                        <p className="text-sm font-medium">
                          {uploadStatus}
                        </p>
                      </div>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isUploading}
                        className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                          isUploading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isUploading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span className="ml-2">Uploading...</span>
                          </div>
                        ) : (
                          <span>Upload Document</span>
                        )}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default DocumentsPage;
