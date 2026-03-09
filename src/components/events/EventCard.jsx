export default function EventCard({ event, onBook }) {
  const price = parseFloat(event.price) || 0;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-36 flex items-center justify-center">
        <span className="text-5xl">🎭</span>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {event.title}
        </h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {event.description || 'No description available.'}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
          <span>📅 {event.date ? new Date(event.date).toLocaleDateString() : 'TBA'}</span>
          <span>📍 {event.venue || 'Online'}</span>
        </div>

        {event.available_tickets != null && (
          <p className="text-xs text-gray-400 mb-3">
            {event.available_tickets}{event.total_tickets != null ? ` / ${event.total_tickets}` : ''} tickets available
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-indigo-600">
            ${price.toFixed(2)}
          </span>
          <button
            onClick={() => onBook(event)}
            disabled={event.available_tickets != null && event.available_tickets <= 0}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {event.available_tickets != null && event.available_tickets <= 0 ? 'Sold Out' : 'Book Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
