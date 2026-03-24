import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarDays, MapPin, Ticket, DollarSign, FileText, Loader2 } from 'lucide-react';

const initialFormState = {
  title: '',
  description: '',
  date: '',
  venue: '',
  price: '',
  total_tickets: '',
};

export default function EventForm({ event, onSubmit, isLoading, error, mode = 'create' }) {
  const [formData, setFormData] = useState(initialFormState);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (event && mode === 'edit') {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: event.date ? event.date.slice(0, 16) : '',
        venue: event.venue || '',
        price: event.price?.toString() || '',
        total_tickets: event.total_tickets?.toString() || '',
      });
    }
  }, [event, mode]);

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.date) {
      errors.date = 'Date and time are required';
    } else if (new Date(formData.date) < new Date()) {
      errors.date = 'Event date must be in the future';
    }

    if (!formData.venue.trim()) {
      errors.venue = 'Venue is required';
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      errors.price = 'Price must be a positive number';
    }

    if (!formData.total_tickets || parseInt(formData.total_tickets) <= 0) {
      errors.total_tickets = 'Total tickets must be at least 1';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const eventData = {
      ...formData,
      price: parseFloat(formData.price),
      total_tickets: parseInt(formData.total_tickets),
    };

    onSubmit(eventData);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">
          {mode === 'create' ? 'Create New Event' : 'Edit Event'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <FileText className="size-4" />
              Event Title
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              aria-invalid={!!validationErrors.title}
            />
            {validationErrors.title && (
              <p className="text-sm text-destructive">{validationErrors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your event..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <CalendarDays className="size-4" />
                Date & Time
              </Label>
              <Input
                id="date"
                name="date"
                type="datetime-local"
                value={formData.date}
                onChange={handleChange}
                aria-invalid={!!validationErrors.date}
              />
              {validationErrors.date && (
                <p className="text-sm text-destructive">{validationErrors.date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue" className="flex items-center gap-2">
                <MapPin className="size-4" />
                Venue
              </Label>
              <Input
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="Event location"
                aria-invalid={!!validationErrors.venue}
              />
              {validationErrors.venue && (
                <p className="text-sm text-destructive">{validationErrors.venue}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-2">
                <DollarSign className="size-4" />
                Ticket Price
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                aria-invalid={!!validationErrors.price}
              />
              {validationErrors.price && (
                <p className="text-sm text-destructive">{validationErrors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_tickets" className="flex items-center gap-2">
                <Ticket className="size-4" />
                Total Tickets
              </Label>
              <Input
                id="total_tickets"
                name="total_tickets"
                type="number"
                min="1"
                value={formData.total_tickets}
                onChange={handleChange}
                placeholder="100"
                aria-invalid={!!validationErrors.total_tickets}
              />
              {validationErrors.total_tickets && (
                <p className="text-sm text-destructive">{validationErrors.total_tickets}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
              {mode === 'create' ? 'Create Event' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
