
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PersonalTracker from '@/components/PersonalTracker';
import GroupSplitter from '@/components/GroupSplitter';
import { PlusCircle, Users, Receipt } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('personal');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Smart Expense Tracker
          </h1>
          <p className="text-lg text-gray-600">
            Track personal expenses and split bills with friends
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Personal Tracker
              </TabsTrigger>
              <TabsTrigger value="group" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Group Splitter
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <PersonalTracker />
            </TabsContent>

            <TabsContent value="group" className="space-y-6">
              <GroupSplitter />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
