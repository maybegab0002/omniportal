import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface PaymentContextType {
  pendingPaymentsCount: number;
  refreshPendingCount: () => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType>({ 
  pendingPaymentsCount: 0,
  refreshPendingCount: async () => {} 
});

export const usePayment = () => useContext(PaymentContext);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);

  const fetchPendingPaymentsCount = async () => {
    try {
      const { data, error } = await supabase
        .from('Payment')
        .select('id')
        .eq('Status', 'Pending');

      if (error) throw error;
      
      setPendingPaymentsCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
    }
  };

  useEffect(() => {
    // Fetch initial count
    fetchPendingPaymentsCount();

    // Set up real-time subscription
    const subscription = supabase
      .channel('payment-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Payment'
        },
        () => {
          fetchPendingPaymentsCount();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <PaymentContext.Provider value={{ 
      pendingPaymentsCount,
      refreshPendingCount: fetchPendingPaymentsCount
    }}>
      {children}
    </PaymentContext.Provider>
  );
};
