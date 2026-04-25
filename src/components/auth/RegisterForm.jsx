import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Ticket } from 'lucide-react';

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const result = await register({ name, email, password });
    if (result.success) {
      setSuccess('Account created. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[0.95fr_1.05fr]">
      <section className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="mb-4 grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
              <Ticket className="size-5" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Create your account</h2>
            <p className="mt-2 text-muted-foreground">Start booking and managing events with TickBook.</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-5">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-5 border-emerald-200 bg-emerald-50 text-emerald-900">
              <CheckCircle2 className="size-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-email">Email address</Label>
              <Input id="register-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm"
                />
              </div>
            </div>

            <Button type="submit" className="w-full rounded-full" size="lg" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-7 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </section>

      <section className="hero-image hidden items-end p-10 text-white lg:flex">
        <div className="max-w-xl">
          <div className="mb-5 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-white/75 backdrop-blur">
            Professional ticketing starts here
          </div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight">Publish events and manage bookings with confidence.</h1>
          <p className="mt-4 text-white/72">
            Create a profile once, then keep every event, booking, and ticket in sync.
          </p>
        </div>
      </section>
    </div>
  );
}
