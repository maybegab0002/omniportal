import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface TicketContextType {
  newTicketsCount: number;
}

const TicketContext = createContext<TicketContextType>({ newTicketsCount: 0 });

export const useTicket = () => useContext(TicketContext);

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [newTicketsCount, setNewTicketsCount] = useState(0);

  useEffect(() => {
    fetchNewTicketsCount();
    setupRealtimeSubscription();
  }, []);

  const fetchNewTicketsCount = async () => {
    try {
      const { data, error } = await supabase
        .from('Tickets')
        .select('id', { count: 'exact' })
        .eq('Status', 'new');

      if (error) throw error;
      setNewTicketsCount(data.length);
    } catch (error) {
      console.error('Error fetching new tickets:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('ticket-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Tickets'
        },
        () => {
          fetchNewTicketsCount();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  return (
    <TicketContext.Provider value={{ newTicketsCount }}>
      {children}
    </TicketContext.Provider>
  );
};
