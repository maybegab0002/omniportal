import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Define Ticket interface based on your Supabase table structure
interface Ticket {
  id: number;
  Name: string;
  Subject: string;
  Description: string;
  Status: string;
  Priority: string;
  Assigned: string | null;
  created_at?: string;
}

const TicketPage: React.FC = () => {
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
        let query = supabase.from('Tickets').select('*');
        
        // Apply status filter if not 'all'
        if (statusFilter !== 'all') {
          query = query.eq('Status', statusFilter);
        }
        
        // Order by id (descending)
        query = query.order('id', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setTickets(data || []);
      } catch (err: any) {
        console.error('Error fetching tickets:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [statusFilter]);

  // Function to update ticket status
  const updateTicketStatus = async (ticketId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('Tickets')
        .update({ Status: newStatus })
        .eq('id', ticketId);

      if (error) throw error;

      // Update local state
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId ? { ...ticket, Status: newStatus } : ticket
      ));
      
      // Close modal if open
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, Status: newStatus });
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
    <div className="px-4 sm:px-6 lg:px-8 py-8">
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
                  <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                      <button
                        type="button"
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={closeTicketModal}
                      >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                    
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 pr-6"
                    >
                      Ticket #{selectedTicket.id}: {selectedTicket.Subject}
                    </Dialog.Title>
                    
                    <div className="mt-4 space-y-6">
                      <div className="flex flex-wrap gap-4">
                        <div className="bg-gray-50 px-4 py-2 rounded-md">
                          <p className="text-xs text-gray-500">Client</p>
                          <p className="text-sm font-medium">{selectedTicket.Name}</p>
                        </div>
                        <div className="bg-gray-50 px-4 py-2 rounded-md">
                          <p className="text-xs text-gray-500">Status</p>
                          <p className={`text-sm font-medium ${getStatusBadgeColor(selectedTicket.Status)}`}>
                            {selectedTicket.Status}
                          </p>
                        </div>
                        <div className="bg-gray-50 px-4 py-2 rounded-md">
                          <p className="text-xs text-gray-500">Priority</p>
                          <p className={`text-sm font-medium ${getPriorityBadgeColor(selectedTicket.Priority)}`}>
                            {selectedTicket.Priority}
                          </p>
                        </div>
                        <div className="bg-gray-50 px-4 py-2 rounded-md">
                          <p className="text-xs text-gray-500">Assigned To</p>
                          <p className="text-sm font-medium">{selectedTicket.Assigned || 'Unassigned'}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Description</h4>
                        <div className="mt-2 rounded-md bg-gray-50 p-4">
                          <p className="whitespace-pre-wrap text-sm text-gray-700">{selectedTicket.Description}</p>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-900">Update Ticket</h4>
                        <div className="mt-2 flex flex-col sm:flex-row gap-4">
                          <div>
                            <label htmlFor="update-status" className="block text-xs text-gray-500">
                              Status
                            </label>
                            <select
                              id="update-status"
                              value={selectedTicket.Status}
                              onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="new">New</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="assign-to" className="block text-xs text-gray-500">
                              Assign To
                            </label>
                            <input
                              type="text"
                              id="assign-to"
                              value={selectedTicket.Assigned || ''}
                              onChange={(e) => assignTicket(selectedTicket.id, e.target.value)}
                              placeholder="Enter name"
                              className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
