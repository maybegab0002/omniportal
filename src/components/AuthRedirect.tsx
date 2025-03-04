import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export const AuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle URL parameters for email confirmation
    const handleEmailConfirmation = () => {
      const hash = window.location.hash;
      if (hash.includes('access_token') || hash.includes('error')) {
        navigate('/login');
      }
    };

    handleEmailConfirmation();

    // Handle auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Check if user is admin or client
        const checkUserRole = async () => {
          if (!session?.user) return;

          const { data: clientData } = await supabase
            .from('Clients')
            .select('id')
            .eq('auth_id', session.user.id)
            .single();

          if (clientData) {
            navigate('/client-dashboard');
          } else {
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('id', session.user.id)
              .single();

            if (!profile?.display_name) {
              navigate('/admin');
            } else {
              navigate('/dashboard');
            }
          }
        };

        checkUserRole();
      } else if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return null;
};

export default AuthRedirect;
