import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { eventsAPI } from '@/services/api';
import { AlertCircle } from 'lucide-react';

const ROWS = 'ABCDEFGH'.split('');
const COLS = Array.from({ length: 10 }, (_, i) => i + 1);

function buildSeatLayout(event, availableCount) {
  const totalSeats = Math.max(1, Math.min(ROWS.length * COLS.length, Number(event?.total_tickets) || 60));
  const available = Math.max(0, Math.min(totalSeats, availableCount ?? (Number(event?.available_tickets) || 0)));
  const blockedSet = new Set(['A1', 'A10', 'H1', 'H10']);
  const blockedCount = Math.min(4, Math.max(0, totalSeats - available));
  const bookedCount = Math.max(0, totalSeats - available - blockedCount);

  const seats = [];
  let bookedAssigned = 0;
  let blockedAssigned = 0;

  for (const row of ROWS) {
    for (const col of COLS) {
      const label = `${row}${col}`;
      const index = seats.length;
      if (index >= totalSeats) break;

      const category = row <= 'C' ? 'VIP' : row <= 'F' ? 'Premium' : 'Standard';
      const multiplier = category === 'VIP' ? 1.7 : category === 'Premium' ? 1.25 : 1;
      const seatPrice = (parseFloat(event?.price) || 0) * multiplier;

      let status = 'available';
      if (blockedSet.has(label) && blockedAssigned < blockedCount) {
        status = 'blocked';
        blockedAssigned += 1;
      } else if (bookedAssigned < bookedCount) {
        status = 'booked';
        bookedAssigned += 1;
      }

      seats.push({ id: label, label, row, col, category, price: seatPrice, status });
    }
  }

  return seats;
}

export default function SeatMap({
  event,
  selectedSeats,
  onChange,
  highContrast = false,
}) {
  const [availableCount, setAvailableCount] = useState(Number(event?.available_tickets) || 0);
  const [refreshError, setRefreshError] = useState('');

  useEffect(() => {
    if (!event?.id) return undefined;
    const interval = setInterval(async () => {
      try {
        const { data } = await eventsAPI.checkAvailability(event.id);
        if (typeof data?.available_tickets === 'number') {
          setAvailableCount(data.available_tickets);
        }
      } catch {
        setRefreshError('Live seat updates are temporarily unavailable.');
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [event?.id]);

  const seats = useMemo(() => buildSeatLayout(event, availableCount), [event, availableCount]);

  useEffect(() => {
    const availableSeatIds = new Set(seats.filter((seat) => seat.status === 'available').map((seat) => seat.id));
    const stillValid = selectedSeats.filter((seatId) => availableSeatIds.has(seatId));
    if (stillValid.length !== selectedSeats.length) {
      onChange(stillValid);
    }
  }, [onChange, seats, selectedSeats]);

  const seatMeta = useMemo(() => {
    const byId = new Map(seats.map((seat) => [seat.id, seat]));
    return selectedSeats
      .map((id) => byId.get(id))
      .filter(Boolean);
  }, [seats, selectedSeats]);

  const toggleSeat = (seat) => {
    if (seat.status !== 'available') return;
    if (selectedSeats.includes(seat.id)) {
      onChange(selectedSeats.filter((id) => id !== seat.id));
      return;
    }
    onChange([...selectedSeats, seat.id]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">Available</Badge>
        <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">Booked</Badge>
        <Badge variant="secondary" className="bg-slate-200 text-slate-700 border-slate-300">Blocked</Badge>
        <Badge variant="outline">Selected: {selectedSeats.length}</Badge>
      </div>

      {refreshError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{refreshError}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border p-3 sm:p-4">
        <div className="mx-auto mb-4 max-w-sm rounded bg-muted px-3 py-1.5 text-center text-xs font-medium">
          Stage / Screen
        </div>
        <div className="grid grid-cols-10 gap-1.5 sm:gap-2" role="grid" aria-label="Seat map">
          {seats.map((seat) => {
            const selected = selectedSeats.includes(seat.id);
            const base = highContrast
              ? seat.status === 'available'
                ? 'bg-white text-black border-black'
                : seat.status === 'booked'
                  ? 'bg-black text-white border-black'
                  : 'bg-yellow-300 text-black border-black'
              : seat.status === 'available'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                : seat.status === 'booked'
                  ? 'bg-red-100 text-red-700 border-red-300 cursor-not-allowed'
                  : 'bg-slate-200 text-slate-600 border-slate-300 cursor-not-allowed';

            return (
              <Button
                key={seat.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toggleSeat(seat)}
                disabled={seat.status !== 'available'}
                title={`${seat.label} • ${seat.category} • $${seat.price.toFixed(2)}`}
                aria-label={`${seat.label} ${seat.category} seat, ${seat.status}, $${seat.price.toFixed(2)}`}
                className={`h-7 px-0 text-[10px] sm:h-8 sm:text-xs ${base} ${selected ? 'ring-2 ring-primary' : ''}`}
              >
                {seat.label}
              </Button>
            );
          })}
        </div>
      </div>

      {seatMeta.length > 0 && (
        <div className="rounded-lg border bg-muted/20 p-3">
          <p className="text-sm font-medium mb-2">Selected seats</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            {seatMeta.map((seat) => (
              <p key={seat.id}>
                {seat.label} — {seat.category} — ${seat.price.toFixed(2)}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
