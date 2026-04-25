import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Chrome, Ticket } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, completeTokenLogin, loading } = useAuth();
  const navigate = useNavigate();
  const googleAuthOrigin = useMemo(() => new URL(authAPI.googleAuthUrl).origin, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login({ email, password });
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  useEffect(() => {
    const handleGoogleAuthMessage = async (event) => {
      if (event.origin !== googleAuthOrigin || event.data?.type !== 'tickbook:google-auth') {
        return;
      }

      setGoogleLoading(false);

      if (event.data.status === 'error') {
        setError(event.data.error || 'Google login failed');
        return;
      }

      const result = await completeTokenLogin({
        token: event.data.accessToken,
        refreshToken: event.data.refreshToken,
      });

      if (result.success) {
        navigate('/');
        return;
      }

      setError(result.message);
    };

    window.addEventListener('message', handleGoogleAuthMessage);
    return () => window.removeEventListener('message', handleGoogleAuthMessage);
  }, [completeTokenLogin, googleAuthOrigin, navigate]);

  const handleGoogleLogin = () => {
    setError('');
    setGoogleLoading(true);

    const popup = window.open(
      authAPI.googleAuthUrl,
      'tickbook-google-auth',
      'width=520,height=720,menubar=no,toolbar=no,location=yes,status=no,resizable=yes,scrollbars=yes',
    );

    if (!popup) {
      window.location.href = authAPI.googleAuthUrl;
      return;
    }

    popup.focus();
  };

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hero-image hidden items-end p-10 text-white lg:flex">
        <div className="max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-white/75 backdrop-blur">
            <Ticket className="size-4 text-amber-300" />
            TickBook Access
          </div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight">Your tickets, seats, and events in one place.</h1>
          <p className="mt-4 text-white/72">
            Sign in to manage bookings, create events, and keep your digital tickets ready.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="mb-4 grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
              <Ticket className="size-5" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-muted-foreground">Sign in to continue to TickBook.</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-5">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>

            <Button type="submit" className="w-full rounded-full" size="lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium uppercase text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full"
            size="lg"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            <Chrome className="size-4" />
            {googleLoading ? 'Waiting for Google...' : 'Continue with Google'}
          </Button>

          <p className="mt-7 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Register
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
