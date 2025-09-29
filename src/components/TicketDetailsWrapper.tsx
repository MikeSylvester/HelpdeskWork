import { useParams } from 'react-router-dom';
import { TicketDetails } from '../features/tickets/TicketDetails';

export function TicketDetailsWrapper() {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <div>Ticket ID not found</div>;
  }
  
  return <TicketDetails ticketId={id} />;
}


