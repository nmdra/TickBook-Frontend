import { useState } from 'react';
import EventList from '../components/events/EventList';
import BookingModal from '../components/booking/BookingModal';

export default function HomePage() {
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Discover &amp; Book Events
          </h1>
          <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
            Find the best events near you and book your tickets instantly.
          </p>
        </div>
      </div>

      {/* Event grid */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
        <EventList onBook={setSelectedEvent} />
      </div>

      {/* Booking modal */}
      {selectedEvent && (
        <BookingModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
