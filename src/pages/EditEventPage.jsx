import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import EventForm from '@/components/events/EventForm';
import { eventsAPI } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Pencil, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/edit-event/${id}` } });
      return;
    }

    const fetchEvent = async () => {
      try {
        const { data } = await eventsAPI.getById(id);
        setEvent(data);
      } catch (err) {
        setFetchError(err.response?.data?.error || err.response?.data?.message || 'Event not found');
      } finally {
        setIsFetching(false);
      }
    };

    fetchEvent();
  }, [id, isAuthenticated, navigate]);

  const handleSubmit = async (eventData) => {
    setIsLoading(true);
    setError(null);

    try {
      await eventsAPI.update(id, eventData);
      navigate('/my-events', { state: { success: 'Event updated successfully!' } });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to update event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-[calc(100vh-4rem)]">
        <div className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 to-background">
          <div className="max-w-7xl mx-auto px-4 py-12 text-center">
            <Skeleton className="h-10 w-64 mx-auto" />
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-10">
          <Skeleton className="h-[500px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-[calc(100vh-4rem)]">
        <div className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 to-background">
          <div className="max-w-7xl mx-auto px-4 py-12 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Edit <span className="text-primary">Event</span>
            </h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-10">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="size-4" />
            <AlertDescription>{fetchError}</AlertDescription>
          </Alert>
          <Button variant="outline" asChild>
            <Link to="/my-events">
              <ArrowLeft className="size-4" />
              Back to My Events
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-background/80 text-sm text-muted-foreground mb-4">
            <Pencil className="size-3.5 text-primary" />
            Modify your event details
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Edit <span className="text-primary">Event</span>
          </h1>
        </div>
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/my-events">
              <ArrowLeft className="size-4" />
              Back to My Events
            </Link>
          </Button>
        </div>
        <EventForm
          event={event}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          mode="edit"
        />
      </div>
    </div>
  );
}
