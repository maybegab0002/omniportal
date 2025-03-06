import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Client {
  id: number;
  Name: string;
  firstName?: string;
  lastName?: string;
}

interface Document {
  id: number;
  Name: string;
  Address: string | null;
  'TIN ID': string | null;
  Email: string | null;
  'Contact No': string | null;
  'Marital Status': string | null;
  created_at: string;
}

// Property details interface
interface PropertyDetails {
  project: string;
  block?: string;
  lot?: string;
}

// Map to store client property details - now an array of properties per client
interface ClientPropertyMap {
  [clientName: string]: PropertyDetails[];
}

interface ClientWithDocs extends Client {
  documents: Document[];
  propertyDetails?: PropertyDetails[];
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
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [projectOwners, setProjectOwners] = useState<{[key: string]: string[]}>({
    'Living Water Subdivision': [],
    'Havahills Estate': []
  });
  const [clientProperties, setClientProperties] = useState<ClientPropertyMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [formData, setFormData] = useState<DocumentForm>({
    Address: '',
    'TIN ID': '',
    Email: '',
    'Contact No': '',
    'Marital Status': '',
    file: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [viewingDocId, setViewingDocId] = useState<number | null>(null);

  useEffect(() => {
    fetchClientsWithDocs();
    fetchProjectOwners();
  }, []);

  // Process and sort clients
  useEffect(() => {
    const processedClients = clients.map(client => {
      const nameParts = client.Name.split(' ');
      return {
        ...client,
        firstName: nameParts[0] || '',
        lastName: nameParts[nameParts.length - 1] || '',
        propertyDetails: clientProperties[client.Name] || []
      };
    });

    // Sort based on toggle
    const sortedClients = [...processedClients].sort((a, b) => 
      sortByLastName
        ? (a.lastName || '').localeCompare(b.lastName || '')
        : (a.firstName || '').localeCompare(b.firstName || '')
    );

    // Filter based on search query and project
    const filtered = sortedClients.filter(client => {
      // Filter by search query
      const matchesSearch = searchQuery
        ? client.Name.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      
      // Filter by project
      let matchesProject = true;
      if (selectedProject !== 'all') {
        // Check if any of the client's properties match the selected project
        if (client.propertyDetails && client.propertyDetails.some(property => property.project === selectedProject)) {
          matchesProject = true;
        } else {
          // Fall back to the existing name-based matching
          const projectOwnersList = projectOwners[selectedProject] || [];
          
          // Try a more flexible matching approach
          matchesProject = projectOwnersList.some(owner => {
            // Clean and normalize strings for comparison
            const ownerLower = owner.toLowerCase().trim();
            const clientLower = client.Name.toLowerCase().trim();
            
            // Check for partial matches in either direction
            return ownerLower.includes(clientLower) || clientLower.includes(ownerLower);
          });
        }
      }
      
      return matchesSearch && matchesProject;
    });

    console.log('Filtered clients count:', filtered.length);
    setFilteredClients(filtered);
  }, [clients, searchQuery, sortByLastName, selectedProject, projectOwners, clientProperties]);

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

  // Fetch owners from project tables
  const fetchProjectOwners = async () => {
    try {
      // Fetch Living Water Subdivision owners with block and lot
      const { data: livingWaterData, error: livingWaterError } = await supabase
        .from('Living Water Subdivision')
        .select('Owner, Block, Lot')
        .not('Owner', 'is', null)
        .not('Owner', 'eq', '');  // Skip empty strings

      if (livingWaterError) throw livingWaterError;

      // Fetch Havahills Estate buyers with block and lot
      const { data: havahillsData, error: havahillsError } = await supabase
        .from('Havahills Estate')
        .select('"Buyers Name", Block, Lot')
        .not('"Buyers Name"', 'is', null)
        .not('"Buyers Name"', 'eq', '');  // Skip empty strings

      if (havahillsError) throw havahillsError;

      // Extract unique owner names and clean them
      const livingWaterOwners = livingWaterData 
        ? [...new Set(livingWaterData
            .map(item => item.Owner.trim())
            .filter(name => name !== ''))]
        : [];
        
      const havahillsBuyers = havahillsData 
        ? [...new Set(havahillsData
            .map(item => item['Buyers Name'].trim())
            .filter(name => name !== ''))]
        : [];

      console.log('Living Water Owners:', livingWaterOwners);
      console.log('Havahills Buyers:', havahillsBuyers);

      // Create a map of client names to their property details
      const propertyMap: ClientPropertyMap = {};
      
      // Add Living Water properties
      livingWaterData?.forEach(item => {
        if (item.Owner && item.Owner.trim() !== '') {
          const clientName = item.Owner.trim();
          if (!propertyMap[clientName]) {
            propertyMap[clientName] = [];
          }
          propertyMap[clientName].push({
            project: 'Living Water Subdivision',
            block: item.Block,
            lot: item.Lot
          });
        }
      });
      
      // Add Havahills properties
      havahillsData?.forEach(item => {
        if (item['Buyers Name'] && item['Buyers Name'].trim() !== '') {
          const clientName = item['Buyers Name'].trim();
          if (!propertyMap[clientName]) {
            propertyMap[clientName] = [];
          }
          propertyMap[clientName].push({
            project: 'Havahills Estate',
            block: item.Block,
            lot: item.Lot
          });
        }
      });
      
      // Set the property map in state
      setClientProperties(propertyMap);

      setProjectOwners({
        'Living Water Subdivision': livingWaterOwners,
        'Havahills Estate': havahillsBuyers
      });

    } catch (err: any) {
      console.error('Error fetching project owners:', err.message);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setFormData(prev => ({
          ...prev,
          file: file
        }));
      } else {
        toast.error('Please upload a PDF file');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !formData.file) return;

    setIsUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', formData.file);
      formDataToSend.append('clientName', selectedClient.Name);
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'file' && value) {
          formDataToSend.append(key, value);
        }
      });

      // Upload to Supabase storage
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${selectedClient.Name}_${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage
        .from('documents')
        .upload(`${selectedClient.Name}/${fileName}`, formData.file);

      if (error) throw error;

      // Get the public URL
      const { data: { publicUrl } } = await supabase.storage
        .from('documents')
        .getPublicUrl(`${selectedClient.Name}/${fileName}`);

      // Save document metadata to database
      const { error: dbError } = await supabase
        .from('documents')
        .insert([
          {
            client_name: selectedClient.Name,
            file_name: fileName,
            file_path: publicUrl,
            contact_no: formData['Contact No'],
            tin_id: formData['TIN ID'],
            email: formData.Email,
            address: formData.Address,
            marital_status: formData['Marital Status']
          }
        ]);

      if (dbError) throw dbError;

      // Refresh the clients list
      await fetchClientsWithDocs();
      
      setFormData({
        'Contact No': '',
        'TIN ID': '',
        Email: '',
        Address: '',
        'Marital Status': '',
        file: null
      });
      setIsModalOpen(false);
      toast.success('Document uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(error.message || 'Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedDocument(null);
  };

  const handleViewDetails = (doc: Document) => {
    setSelectedDocument(doc);
    setIsDetailsModalOpen(true);
  };

  const getDocumentUrl = async (clientName: string) => {
    try {
      // Sanitize the client name to match the upload format
      const sanitizedClientName = clientName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
        .replace(/[^a-zA-Z0-9]/g, '_');   // Replace non-alphanumeric with underscore
      
      // List all files in the bucket
      const { data: files, error } = await supabase.storage
        .from('Clients Document')
        .list();
        
      if (error) {
        throw error;
      }
      
      console.log('All files in bucket:', files);
      
      // Find files that match this client's sanitized name pattern
      const clientFiles = files.filter(file => 
        file.name.startsWith(sanitizedClientName + '_')
      );
      
      console.log('Files found for client:', clientFiles);
      
      if (clientFiles && clientFiles.length > 0) {
        // Use the first file that matches
        const filePath = clientFiles[0].name;
        console.log('Using file:', filePath);
        
        const { data } = await supabase.storage
          .from('Clients Document')
          .getPublicUrl(filePath);

        return data.publicUrl;
      } else {
        console.error('No files found for this client.');
        return null;
      }
    } catch (error) {
      console.error('Error getting document URL:', error);
      return null;
    }
  };

  const handleViewDocument = async (doc: Document) => {
    try {
      setViewingDocId(doc.id);
      
      console.log('Document object:', doc);
      
      const url = await getDocumentUrl(doc.Name);
      setViewingDocId(null);
      
      if (url) {
        window.open(url, '_blank');
      } else {
        alert('Could not retrieve document URL.');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      setViewingDocId(null);
      alert('Error viewing document. Please try again.');
    }
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
        
        {/* Project Filter */}
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option value="all">All Projects</option>
          <option value="Living Water Subdivision">Living Water Subdivision</option>
          <option value="Havahills Estate">Havahills Estate</option>
        </select>
        
        {/* Sort Toggle Button */}
        <button
          onClick={toggleSort}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Sort by {sortByLastName ? 'First Name' : 'Last Name'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Header */}
            <div className="p-3 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-medium text-gray-900 truncate" title={client.Name}>
                  {client.Name}
                </h2>
                <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded">
                  {client.documents?.length || 0} docs
                </span>
              </div>
              
              {/* Property Tags */}
              {clientProperties[client.Name] && clientProperties[client.Name].length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                    {clientProperties[client.Name][0].project}
                  </span>
                  {clientProperties[client.Name].map((property, index) => (
                    <span 
                      key={index} 
                      className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded"
                    >
                      {property.block && `Block ${property.block}`}
                      {property.block && property.lot && ' • '}
                      {property.lot && `Lot ${property.lot}`}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Documents List */}
            <div className="p-3">
              {client.documents && client.documents.length > 0 ? (
                <div className="space-y-1">
                  {client.documents.map((doc, index) => (
                    <div key={doc.id || index} className="group flex items-center text-sm">
                      <span className="flex-1 truncate text-gray-600">{doc.Name}</span>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleViewDetails(doc)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="View Details"
                        >
                          <InformationCircleIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleViewDocument(doc)}
                          className="p-1 text-blue-500 hover:text-blue-700"
                          disabled={viewingDocId === doc.id}
                          title="View PDF"
                        >
                          {viewingDocId === doc.id ? (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-2">
                  No documents
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div className="px-3 pb-3">
              <button
                onClick={() => handleUpload(client)}
                className="w-full bg-white text-blue-600 hover:bg-blue-50 text-sm font-medium py-1.5 rounded transition-colors flex items-center justify-center space-x-1 border border-blue-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Upload</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                  {/* Header with gradient */}
                  <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <Dialog.Title as="h3" className="text-lg font-semibold text-white">
                        Upload Document
                      </Dialog.Title>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10 p-1"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                    {selectedClient && (
                      <div className="mt-1 text-white/80 text-sm font-light text-left">
                        for {selectedClient.Name}
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="p-6">
                    {/* Form Fields */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">
                            Contact No
                          </label>
                          <div className="relative rounded-lg shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              value={formData['Contact No']}
                              onChange={(e) => setFormData({ ...formData, 'Contact No': e.target.value })}
                              className="form-input block w-full pl-10 pr-3 py-2 text-sm border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter number"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">
                            TIN ID
                          </label>
                          <div className="relative rounded-lg shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              value={formData['TIN ID']}
                              onChange={(e) => setFormData({ ...formData, 'TIN ID': e.target.value })}
                              className="form-input block w-full pl-10 pr-3 py-2 text-sm border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter TIN"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <div className="relative rounded-lg shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                          </div>
                          <input
                            type="email"
                            value={formData.Email}
                            onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                            className="form-input block w-full pl-10 pr-3 py-2 text-sm border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter email"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Address
                        </label>
                        <div className="relative rounded-lg shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            value={formData.Address}
                            onChange={(e) => setFormData({ ...formData, Address: e.target.value })}
                            className="form-input block w-full pl-10 pr-3 py-2 text-sm border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter address"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 mt-6">
                        <label className="block text-sm font-medium text-gray-700">
                          Marital Status
                        </label>
                        <div className="relative rounded-lg shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <select
                            value={formData['Marital Status']}
                            onChange={(e) => setFormData({ ...formData, 'Marital Status': e.target.value })}
                            className="form-input block w-full pl-10 pr-3 py-2 text-sm border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          >
                            <option value="">Select status</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Widowed">Widowed</option>
                            <option value="Divorced">Divorced</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* File Upload Section */}
                    <div className="mt-6">
                      <div 
                        className={`relative rounded-xl border-2 border-dashed transition-all duration-200 bg-gradient-to-r from-gray-50 to-white ${
                          formData.file 
                            ? 'border-blue-500/50 bg-blue-50/50' 
                            : 'border-gray-300 hover:border-blue-400/50 hover:bg-blue-50/30'
                        }`}
                      >
                        <input
                          type="file"
                          id="file-upload"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer block px-6 py-8"
                        >
                          {formData.file ? (
                            <div className="flex items-center justify-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-full shadow-sm">
                                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <div className="text-left">
                                <div className="text-sm font-medium text-blue-700 truncate max-w-[200px]">
                                  {formData.file.name}
                                </div>
                                <div className="text-xs text-blue-500 mt-0.5">Click to change file</div>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="mx-auto w-12 h-12 mb-3 bg-gray-100 rounded-full flex items-center justify-center shadow-sm">
                                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                              </div>
                              <div className="text-sm text-gray-600">
                                <span className="text-blue-600 font-medium">Click to upload</span>
                                <span> or drag and drop</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">PDF files only</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-all duration-200 hover:shadow-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!formData.file || isUploading}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 flex items-center bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 ${
                          !formData.file || isUploading
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:shadow-md hover:shadow-blue-500/10'
                        }`}
                      >
                        {isUploading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Upload Document
                          </>
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

      {/* Details Modal */}
      <Transition appear show={isDetailsModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeDetailsModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                  {/* Header with gradient */}
                  <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <Dialog.Title as="h3" className="text-lg font-semibold text-white">
                        Client Details
                      </Dialog.Title>
                      <button
                        onClick={closeDetailsModal}
                        className="text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10 p-1"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    {selectedDocument && (
                      <div className="space-y-4">
                        {/* Client Name Card */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-blue-600 font-medium">Client Name</p>
                              <p className="text-sm font-semibold text-gray-900">{selectedDocument.Name}</p>
                            </div>
                          </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <h4 className="text-sm font-medium text-gray-900">Contact Information</h4>
                          </div>
                          <div className="grid grid-cols-2 gap-4 p-4">
                            <div>
                              <label className="text-xs text-gray-500">Contact No</label>
                              <p className="text-sm font-medium text-gray-900 truncate" title={selectedDocument['Contact No'] || '-'}>
                                {selectedDocument['Contact No'] || '-'}
                              </p>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Email</label>
                              <p className="text-sm font-medium text-gray-900 truncate" title={selectedDocument.Email || '-'}>
                                {selectedDocument.Email || '-'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Personal Information */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <h4 className="text-sm font-medium text-gray-900">Personal Information</h4>
                          </div>
                          <div className="p-4 space-y-3">
                            <div>
                              <label className="text-xs text-gray-500">TIN ID</label>
                              <p className="text-sm font-medium text-gray-900 truncate" title={selectedDocument['TIN ID'] || '-'}>
                                {selectedDocument['TIN ID'] || '-'}
                              </p>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Address</label>
                              <p className="text-sm font-medium text-gray-900 break-words" title={selectedDocument.Address || '-'}>
                                {selectedDocument.Address || '-'}
                              </p>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Marital Status</label>
                              <p className="text-sm font-medium text-gray-900 truncate" title={selectedDocument['Marital Status'] || '-'}>
                                {selectedDocument['Marital Status'] || '-'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Document Information */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <h4 className="text-sm font-medium text-gray-900">Document Information</h4>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Created On</p>
                                  <p className="text-sm font-medium text-gray-900">
                                    {new Date(selectedDocument.created_at).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
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
