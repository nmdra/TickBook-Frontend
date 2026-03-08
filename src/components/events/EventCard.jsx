export default function EventCard({ event, onBook }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-36 flex items-center justify-center">
        <span className="text-5xl">🎭</span>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {event.name || event.title}
        </h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {event.description || 'No description available.'}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span>📅 {event.date ? new Date(event.date).toLocaleDateString() : 'TBA'}</span>
          <span>📍 {event.venue || event.location || 'Online'}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-indigo-600">
            ${event.price ?? '0.00'}
          </span>
          <button
            onClick={() => onBook(event)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
