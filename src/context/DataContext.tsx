import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

// Define types
interface Client {
  id: number;
  Name: string;
  firstName?: string;
  lastName?: string;
  Email?: string;  // Changed from email to Email
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

// Context type definition
interface DataContextType {
  clients: Client[];
  clientsWithDocs: ClientWithDocs[];
  isClientsLoading: boolean;
  isDocsLoading: boolean;
  refreshClients: () => Promise<void>;
  refreshDocuments: () => Promise<void>;
  preloadDocumentsData: () => Promise<void>;
  isPreloaded: boolean;
}

// Create context with default values
const DataContext = createContext<DataContextType>({
  clients: [],
  clientsWithDocs: [],
  isClientsLoading: true,
  isDocsLoading: true,
  refreshClients: async () => {},
  refreshDocuments: async () => {},
  preloadDocumentsData: async () => {},
  isPreloaded: false,
});

// Provider component
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsWithDocs, setClientsWithDocs] = useState<ClientWithDocs[]>([]);
  const [isClientsLoading, setIsClientsLoading] = useState(true);
  const [isDocsLoading, setIsDocsLoading] = useState(true);
  const [isPreloaded, setIsPreloaded] = useState(false);

  // Fetch clients data
  const fetchClients = async () => {
    try {
      setIsClientsLoading(true);
      
      const { data, error } = await supabase
        .from('Clients')
        .select('id, Name, Email')  // Changed from email to Email
        .order('Name', { ascending: true });

      if (error) throw error;

      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setIsClientsLoading(false);
    }
  };

  // Fetch clients with documents
  const fetchClientsWithDocs = async () => {
    try {
      setIsDocsLoading(true);
      
      const { data: clientsData, error: clientsError } = await supabase
        .from('Clients')
        .select('id, Name, Email')  // Added Email field
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

        // Process name parts
        const nameParts = client.Name.split(' ');
        return { 
          ...client, 
          documents: docs || [],
          firstName: nameParts[0] || '',
          lastName: nameParts[nameParts.length - 1] || ''
        };
      }));

      setClientsWithDocs(clientsWithDocs);
      setIsPreloaded(true);
    } catch (err: any) {
      console.error('Error fetching clients with docs:', err.message);
    } finally {
      setIsDocsLoading(false);
    }
  };

  // Function to preload documents data
  const preloadDocumentsData = async () => {
    if (!isPreloaded && !isDocsLoading) {
      console.log("Preloading documents data...");
      await fetchClientsWithDocs();
    }
  };

  // Initial data load
  useEffect(() => {
    fetchClients();
    // We don't automatically load documents data on initial load
    // to improve performance. Instead, we'll preload it when needed.
  }, []);

  // Context value
  const value = {
    clients,
    clientsWithDocs,
    isClientsLoading,
    isDocsLoading,
    refreshClients: fetchClients,
    refreshDocuments: fetchClientsWithDocs,
    preloadDocumentsData,
    isPreloaded,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// Custom hook to use the data context
export const useData = () => useContext(DataContext);
