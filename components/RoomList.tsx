import type { Room } from '@/lib/queries/housing'

type Props = { rooms: Room[] }

export default function RoomList({ rooms }: Props) {
  if (rooms.length === 0) {
    return <p className="text-sm text-muted-foreground">No rooms listed.</p>
  }

  return (
    <div className="space-y-3">
      {rooms.map((room) => (
        <div
          key={room.room_id}
          className="border rounded-lg p-4 flex items-center justify-between gap-4"
        >
          <div className="space-y-0.5">
            <p className="font-medium text-sm">
              {room.room_number ? `Room ${room.room_number}` : 'Room'}
              <span className="ml-2 text-xs text-muted-foreground capitalize">
                {room.room_type}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              {room.available_slots} of {room.capacity} slot
              {room.capacity !== 1 ? 's' : ''} available
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-semibold text-sm">
              ₱{Number(room.monthly_price).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">/ month</p>
          </div>
        </div>
      ))}
    </div>
  )
}
