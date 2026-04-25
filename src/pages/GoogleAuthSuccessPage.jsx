import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '../hooks/useAuth';

export default function GoogleAuthSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeTokenLogin } = useAuth();
  const [error, setError] = useState(searchParams.get('error') || '');

  useEffect(() => {
    const token = searchParams.get('accessToken') || searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');

    if (error) {
      return;
    }

    let isMounted = true;

    completeTokenLogin({ token, refreshToken }).then((result) => {
      if (!isMounted) {
        return;
      }

      if (!result.success) {
        setError(result.message);
        return;
      }

      // Tokens saved, user set — go straight to home
      window.history.replaceState({}, document.title, '/');
      navigate('/', { replace: true });
    });

    return () => {
      isMounted = false;
    };
  }, [completeTokenLogin, error, navigate, searchParams]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-6 px-4 py-12">
      {error ? (
        <div className="w-full max-w-sm space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button type="button" className="w-full" onClick={() => navigate('/login')}>
            Back to Login
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm">Signing you in…</p>
        </div>
      )}
    </div>
  );
}
