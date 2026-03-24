import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { eventsAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { formatEventDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircle,
  CalendarDays,
  MapPin,
  Ticket,
  Plus,
  Pencil,
  Trash2,
  DollarSign,
  CheckCircle,
} from 'lucide-react';

export default function MyEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.success) {
      setSuccessMessage(location.state.success);
      window.history.replaceState({}, document.title);
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [location.state]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/my-events' } });
      return;
    }

    if (!user?.id) {
      setLoading(false);
      setError('Unable to resolve your user session. Please log in again.');
      return;
    }

    const fetchMyEvents = async () => {
      try {
        const { data } = await eventsAPI.getMyEvents(user.id);
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.error || err.response?.data?.message || 'Failed to load your events');
      } finally {
        setLoading(false);
      }
    };
    fetchMyEvents();
  }, [user, isAuthenticated, navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await eventsAPI.delete(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setSuccessMessage('Event deleted successfully');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to delete event');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            My <span className="text-primary">Events</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your created events
          </p>
        </div>
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm text-muted-foreground">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </p>
          <Button asChild>
            <Link to="/add-event">
              <Plus className="size-4" />
              Create Event
            </Link>
          </Button>
        </div>

        {successMessage && (
          <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle className="size-4 text-green-600" />
            <AlertDescription className="text-green-700 dark:text-green-300">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {events.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center space-y-4">
              <CalendarDays className="size-12 mx-auto text-muted-foreground opacity-40" />
              <p className="text-lg font-medium">No events created yet</p>
              <p className="text-muted-foreground text-sm">
                Start by creating your first event and reach your audience!
              </p>
              <Button asChild>
                <Link to="/add-event">
                  <Plus className="size-4 mr-1" />
                  Create Your First Event
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const price = parseFloat(event.price) || 0;
              const isSoldOut = event.available_tickets != null && event.available_tickets <= 0;

              return (
                <Card key={event.id} className="py-0 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-32 h-24 sm:h-auto bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
                        <span className="text-3xl">🎭</span>
                      </div>
                      <div className="flex-1 p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="space-y-2 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-lg truncate">{event.title}</h3>
                              {isSoldOut ? (
                                <Badge variant="destructive">Sold Out</Badge>
                              ) : event.available_tickets != null && event.available_tickets <= 10 ? (
                                <Badge className="bg-amber-500 text-white border-0">
                                  {event.available_tickets} left
                                </Badge>
                              ) : null}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {event.description || 'No description'}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <CalendarDays className="size-3.5" />
                                {formatEventDate(event.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="size-3.5" />
                                {event.venue || 'Online'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Ticket className="size-3.5" />
                                {event.available_tickets ?? 0}/{event.total_tickets ?? 0} tickets
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="size-3.5" />
                                ${price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/edit-event/${event.id}`}>
                                <Pencil className="size-4" />
                                Edit
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(event.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="size-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
