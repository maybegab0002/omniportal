import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  XMarkIcon, 
  UserIcon, 
  ClockIcon, 
  TagIcon, 
  FolderIcon,
  DocumentTextIcon,
  PaperClipIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

// Add custom scrollbar styles
import './ticketStyles.css';

// Define Ticket interface based on your Supabase table structure
interface Ticket {
  id: number;
  Name: string;
  Subject: string;
  Description: string;
  Status: string;
  Priority: string;
  Assigned: string | null;
  Resolution: string | null;
  Attachment: string | null;
  Category: string | null;
  created_at?: string;
  updated_at?: string;
}

function TicketPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Fetch tickets from Supabase
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        
        // Check if supabase client is properly initialized
        if (!supabase) {
          throw new Error('Supabase client is not initialized');
        }
        
        console.log('Fetching tickets with filter:', statusFilter);
        
        let query = supabase.from('Tickets').select('*');
        
        // Apply status filter if not 'all'
        if (statusFilter !== 'all') {
          query = query.eq('Status', statusFilter);
        }
        
        // Order by id (descending)
        query = query.order('id', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }
        
        console.log('Tickets fetched successfully:', data);
        setTickets(data || []);
      } catch (err: any) {
        console.error('Error fetching tickets:', err);
        // Provide more detailed error message
        if (err.message === 'Failed to fetch') {
          setError('Network error: Could not connect to Supabase. Please check your internet connection and Supabase configuration.');
        } else {
          setError(`${err.message || 'Unknown error'}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [statusFilter]);

  // Function to update ticket status
  const updateTicketStatus = async (ticketId: number, status: string) => {
    try {
      const { error } = await supabase
        .from('Tickets')
        .update({ Status: status })
        .eq('id', ticketId);

      if (error) throw error;

      // Update local state
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId ? { ...ticket, Status: status } : ticket
      ));
      
      // Update selected ticket if it's the one being modified
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, Status: status });
      }
    } catch (err: any) {
      console.error('Error updating ticket status:', err);
      alert(`Failed to update ticket status: ${err.message}`);
    }
  };

  // Function to assign ticket
  const assignTicket = async (ticketId: number, assignee: string) => {
    try {
      const { error } = await supabase
        .from('Tickets')
        .update({ Assigned: assignee })
        .eq('id', ticketId);

      if (error) throw error;

      // Update local state
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId ? { ...ticket, Assigned: assignee } : ticket
      ));
      
      // Update selected ticket if it's the one being modified
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, Assigned: assignee });
      }
    } catch (err: any) {
      console.error('Error assigning ticket:', err);
      alert(`Failed to assign ticket: ${err.message}`);
    }
  };

  // Function to update ticket priority
  const updateTicketPriority = async (ticketId: number, newPriority: string) => {
    try {
      const { error } = await supabase
        .from('Tickets')
        .update({ Priority: newPriority })
        .eq('id', ticketId);

      if (error) throw error;

      // Update local state
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId ? { ...ticket, Priority: newPriority } : ticket
      ));
      
      // Update selected ticket if it's the one being modified
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, Priority: newPriority });
      }
    } catch (err: any) {
      console.error('Error updating ticket priority:', err);
      alert(`Failed to update ticket priority: ${err.message}`);
    }
  };

  // Function to open ticket detail modal
  const openTicketModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsTicketModalOpen(true);
  };

  // Function to close ticket detail modal
  const closeTicketModal = () => {
    setIsTicketModalOpen(false);
    setSelectedTicket(null);
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in progress':
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority badge color
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 bg-white">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Support Tickets</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all support tickets submitted by clients.
          </p>
        </div>
      </div>

      {/* Filter controls */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
            Filter by status:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Tickets</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Tickets table */}
      <div className="mt-6 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              {loading ? (
                <div className="flex justify-center items-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-500">
                  Error loading tickets: {error}
                </div>
              ) : tickets.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No tickets found. {statusFilter !== 'all' && 'Try changing your filter.'}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        ID
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Client
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Subject
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Priority
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Assigned To
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {tickets.map((ticket) => (
                      <tr 
                        key={ticket.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => openTicketModal(ticket)}
                      >
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          #{ticket.id}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {ticket.Name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {ticket.Subject}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeColor(ticket.Status)}`}>
                            {ticket.Status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPriorityBadgeColor(ticket.Priority)}`}>
                            {ticket.Priority}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {ticket.Assigned || 'Unassigned'}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openTicketModal(ticket);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View<span className="sr-only">, ticket #{ticket.id}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error message with debugging info */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-lg font-medium text-red-800">Error loading tickets</h3>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          
          <div className="mt-3 p-3 bg-white rounded border border-red-100">
            <h4 className="text-sm font-medium text-gray-700">Debugging Information</h4>
            <p className="text-xs text-gray-600 mt-1">
              Supabase URL defined: {import.meta.env.VITE_SUPABASE_URL ? 'Yes' : 'No'}<br />
              Supabase Key defined: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Yes' : 'No'}<br />
              URL Length: {import.meta.env.VITE_SUPABASE_URL?.length || 0}<br />
              Key Length: {import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Note: If either value shows "No" or has a length of 0, your environment variables are not properly configured.
            </p>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <Transition appear show={isTicketModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={closeTicketModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                  <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border border-gray-200">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                    >
                      <span className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-500" aria-hidden="true" />
                        Ticket #{selectedTicket.id}: {selectedTicket.Subject}
                      </span>
                      <button
                        type="button"
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={closeTicketModal}
                      >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </Dialog.Title>
                    
                    <div className="mt-4 space-y-6 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 px-4 py-3 rounded-md shadow-sm hover-card">
                          <div className="flex items-center mb-1">
                            <UserIcon className="h-4 w-4 text-blue-500 mr-1.5" aria-hidden="true" />
                            <p className="text-xs text-gray-500">Client</p>
                          </div>
                          <p className="text-sm font-medium">{selectedTicket.Name}</p>
                        </div>
                        
                        <div className="bg-gray-50 px-4 py-3 rounded-md shadow-sm hover-card">
                          <div className="flex items-center mb-1">
                            <ArrowPathIcon className="h-4 w-4 text-blue-500 mr-1.5" aria-hidden="true" />
                            <p className="text-xs text-gray-500">Status</p>
                          </div>
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              selectedTicket.Status === 'new' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              selectedTicket.Status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                              selectedTicket.Status === 'resolved' ? 'bg-green-100 text-green-800 border border-green-200' :
                              selectedTicket.Status === 'closed' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                              'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                              {selectedTicket.Status === 'new' && <ExclamationCircleIcon className="h-3 w-3 mr-1" aria-hidden="true" />}
                              {selectedTicket.Status === 'in_progress' && <ArrowPathIcon className="h-3 w-3 mr-1" aria-hidden="true" />}
                              {selectedTicket.Status === 'resolved' && <CheckCircleIcon className="h-3 w-3 mr-1" aria-hidden="true" />}
                              {selectedTicket.Status === 'closed' && <XMarkIcon className="h-3 w-3 mr-1" aria-hidden="true" />}
                              {selectedTicket.Status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 px-4 py-3 rounded-md shadow-sm hover-card">
                          <div className="flex items-center mb-1">
                            <ExclamationCircleIcon className="h-4 w-4 text-blue-500 mr-1.5" aria-hidden="true" />
                            <p className="text-xs text-gray-500">Priority</p>
                          </div>
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              selectedTicket.Priority === 'low' ? 'bg-green-100 text-green-800 border border-green-200' :
                              selectedTicket.Priority === 'medium' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              selectedTicket.Priority === 'high' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                              selectedTicket.Priority === 'urgent' ? 'bg-red-100 text-red-800 border border-red-200' :
                              'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                              {selectedTicket.Priority}
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 px-4 py-3 rounded-md shadow-sm hover-card">
                          <div className="flex items-center mb-1">
                            <UserIcon className="h-4 w-4 text-blue-500 mr-1.5" aria-hidden="true" />
                            <p className="text-xs text-gray-500">Assigned To</p>
                          </div>
                          <p className="text-sm font-medium">{selectedTicket.Assigned || 'Unassigned'}</p>
                        </div>
                        
                        {selectedTicket.Category && (
                          <div className="bg-gray-50 px-4 py-3 rounded-md shadow-sm hover-card">
                            <div className="flex items-center mb-1">
                              <FolderIcon className="h-4 w-4 text-blue-500 mr-1.5" aria-hidden="true" />
                              <p className="text-xs text-gray-500">Category</p>
                            </div>
                            <p className="text-sm font-medium">{selectedTicket.Category}</p>
                          </div>
                        )}
                        
                        <div className="bg-gray-50 px-4 py-3 rounded-md shadow-sm hover-card">
                          <div className="flex items-center mb-1">
                            <ClockIcon className="h-4 w-4 text-blue-500 mr-1.5" aria-hidden="true" />
                            <p className="text-xs text-gray-500">Created</p>
                          </div>
                          <p className="text-sm font-medium">
                            {selectedTicket.created_at 
                              ? new Date(selectedTicket.created_at).toLocaleString() 
                              : 'Unknown'}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-md p-4 shadow-sm hover-card">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center">
                          <ChatBubbleLeftRightIcon className="h-4 w-4 text-blue-500 mr-1.5" aria-hidden="true" />
                          Description
                        </h4>
                        <div className="mt-2 rounded-md bg-white p-4 shadow-inner border border-gray-100">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTicket.Description}</p>
                        </div>
                      </div>
                      
                      {selectedTicket.Attachment && (
                        <div className="bg-gray-50 rounded-md p-4 shadow-sm hover-card">
                          <h4 className="text-sm font-medium text-gray-900 flex items-center">
                            <PaperClipIcon className="h-4 w-4 text-blue-500 mr-1.5" aria-hidden="true" />
                            Attachment
                          </h4>
                          <div className="mt-2">
                            <a 
                              href={selectedTicket.Attachment} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                            >
                              <PaperClipIcon className="h-5 w-5 mr-2 text-blue-500" aria-hidden="true" />
                              View Attachment
                            </a>
                          </div>
                        </div>
                      )}

                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center">
                          <TagIcon className="h-4 w-4 text-blue-500 mr-1.5" aria-hidden="true" />
                          Update Ticket
                        </h4>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="update-status" className="block text-xs text-gray-500 items-center">
                              <ArrowPathIcon className="h-3.5 w-3.5 text-blue-500 mr-1" aria-hidden="true" />
                              Status
                            </label>
                            <select
                              id="update-status"
                              value={selectedTicket.Status}
                              onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="new">New</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="update-priority" className="block text-xs text-gray-500 items-center">
                              <ExclamationCircleIcon className="h-3.5 w-3.5 text-blue-500 mr-1" aria-hidden="true" />
                              Priority
                            </label>
                            <select
                              id="update-priority"
                              value={selectedTicket.Priority}
                              onChange={(e) => updateTicketPriority(selectedTicket.id, e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="update-assignee" className="block text-xs text-gray-500 items-center">
                              <UserIcon className="h-3.5 w-3.5 text-blue-500 mr-1" aria-hidden="true" />
                              Assign To
                            </label>
                            <input
                              type="text"
                              id="update-assignee"
                              defaultValue={selectedTicket.Assigned || ''}
                              placeholder="Enter name"
                              className="mt-1 block w-full rounded-md border-gray-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              onBlur={(e) => {
                                if (e.target.value !== selectedTicket.Assigned) {
                                  assignTicket(selectedTicket.id, e.target.value);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  assignTicket(selectedTicket.id, e.currentTarget.value);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}
    </div>
  );
};

export default TicketPage;
