
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users, Share2 } from 'lucide-react';
import CreateEventModal from './CreateEventModal';
import EventList from './EventList';
import EventDetail from './EventDetail';
import { GroupEvent } from '@/types/expense';

const GroupSplitter = () => {
  const [events, setEvents] = useState<GroupEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<GroupEvent | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Load events from localStorage on component mount
  useEffect(() => {
    const storedEvents = localStorage.getItem('group-events');
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem('group-events', JSON.stringify(events));
  }, [events]);

  const createEvent = (eventData: Omit<GroupEvent, 'id' | 'expenses' | 'createdAt'>) => {
    const newEvent: GroupEvent = {
      ...eventData,
      id: Date.now().toString(),
      expenses: [],
      createdAt: new Date().toISOString(),
    };
    setEvents(prev => [newEvent, ...prev]);
    setSelectedEvent(newEvent);
  };

  const updateEvent = (updatedEvent: GroupEvent) => {
    setEvents(prev => prev.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ));
    setSelectedEvent(updatedEvent);
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
    if (selectedEvent?.id === id) {
      setSelectedEvent(null);
    }
  };

  if (selectedEvent) {
    return (
      <EventDetail 
        event={selectedEvent}
        onUpdate={updateEvent}
        onBack={() => setSelectedEvent(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Group Events
            </span>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Create events like trips, parties, or dinners and split expenses with friends.
          </p>
        </CardContent>
      </Card>

      {/* Events List */}
      {events.length > 0 ? (
        <EventList 
          events={events}
          onSelect={setSelectedEvent}
          onDelete={deleteEvent}
        />
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No events yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first group event to start splitting expenses with friends.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)} size="lg">
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Your First Event
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={createEvent}
      />
    </div>
  );
};

export default GroupSplitter;
