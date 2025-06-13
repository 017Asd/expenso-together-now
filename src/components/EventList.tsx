
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Trash2, ArrowRight } from 'lucide-react';
import { GroupEvent } from '@/types/expense';

interface EventListProps {
  events: GroupEvent[];
  onSelect: (event: GroupEvent) => void;
  onDelete: (id: string) => void;
}

const EventList: React.FC<EventListProps> = ({ events, onSelect, onDelete }) => {
  const calculateEventTotal = (event: GroupEvent) => {
    return event.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {events.map(event => {
        const totalAmount = calculateEventTotal(event);
        const createdDate = new Date(event.createdAt).toLocaleDateString();
        
        return (
          <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{event.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(event.id);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {event.description && (
                <p className="text-sm text-gray-600">{event.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{event.members.length} members</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{createdDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    ₹{totalAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {event.expenses.length} expenses
                  </div>
                </div>
                <Button onClick={() => onSelect(event)} className="ml-4">
                  View Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Member badges */}
              <div className="flex flex-wrap gap-1">
                {event.members.slice(0, 3).map(member => (
                  <Badge key={member.id} variant="secondary" className="text-xs">
                    {member.name}
                  </Badge>
                ))}
                {event.members.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{event.members.length - 3} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EventList;
