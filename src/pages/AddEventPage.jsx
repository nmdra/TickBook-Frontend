import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import EventForm from '@/components/events/EventForm';
import { eventsAPI } from '@/services/api';
import { CalendarPlus } from 'lucide-react';

export default function AddEventPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isAuthenticated) {
    navigate('/login', { state: { from: '/add-event' } });
    return null;
  }

  const handleSubmit = async (eventData) => {
    setIsLoading(true);
    setError(null);

    try {
      await eventsAPI.create({
        ...eventData,
        user_id: user?.id,
      });
      navigate('/my-events', { state: { success: 'Event created successfully!' } });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-background/80 text-sm text-muted-foreground mb-4">
            <CalendarPlus className="size-3.5 text-primary" />
            Create and manage your events
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Create a New <span className="text-primary">Event</span>
          </h1>
        </div>
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <EventForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          mode="create"
        />
      </div>
    </div>
  );
}
