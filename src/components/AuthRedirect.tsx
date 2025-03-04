import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export const AuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
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

    // Handle initial URL params
    const handleRedirect = async () => {
      const { error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
        navigate('/login');
      }
    };

    handleRedirect();
  }, [navigate]);

  return null;
};

export default AuthRedirect;
