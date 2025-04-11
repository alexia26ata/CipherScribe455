import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { getHistory } from '@/utils/api';
import { Copy, History, Trash2, Search, X, Clock, Key } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

const API = import.meta.env.VITE_API_URL;

const HistoryPanel: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const historyItems = await getHistory();
      setHistory(historyItems);
    } catch (error) {
      toast({
        title: "Error Loading History",
        description: "Could not load history from the server.",
        variant: "destructive",
      });
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
      try {
        await fetch(`${API}/api/history`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setHistory([]);
        setSelectedItem(null);
        toast({
          title: "History Cleared",
          description: "All encryption history has been deleted.",
        });
      } catch (err) {
        toast({
          title: "Failed to Clear History",
          description: "There was a problem clearing history.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await fetch(`${API}/api/history/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (selectedItem && selectedItem._id === id) {
        setSelectedItem(null);
      }
      await loadHistory();
      toast({
        title: "Item Deleted",
        description: "The history item has been removed.",
      });
    } catch (err) {
      toast({
        title: "Failed to Delete",
        description: "There was a problem deleting the item.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to Clipboard",
        description,
      });
    }).catch(err => {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard. Please try again.",
        variant: "destructive",
      });
    });
  };

  const filteredHistory = history.filter(item =>
    item.input.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.output.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-gray-700">
          <History size={20} />
          Encryption History
        </CardTitle>
        <CardDescription>
          View your past encryption/decryption activities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          {/* History List */}
          <div className="w-full md:w-1/3 space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search history..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="border rounded-md overflow-hidden">
              {filteredHistory.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {history.length === 0 ? 'No encryption history yet' : 'No results found'}
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {filteredHistory.map(item => (
                    <div 
                      key={item._id}
                      className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                        selectedItem?._id === item._id ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-medium truncate w-4/5">
                          {item.input.length > 30 
                            ? `${item.input.substring(0, 30)}...` 
                            : item.input}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(item._id);
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Clock size={12} className="mr-1" />
                        {format(new Date(item.createdAt), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {history.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={handleClearHistory}
              >
                <Trash2 size={14} className="mr-2" />
                Clear All History
              </Button>
            )}
          </div>

          {/* Selected Item Details */}
          <div className="w-full md:w-2/3">
            {selectedItem ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-base">Input</Label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 gap-1 text-xs"
                      onClick={() => copyToClipboard(selectedItem.input, "Original input copied")}
                    >
                      <Copy size={12} /> Copy
                    </Button>
                  </div>
                  <Textarea 
                    value={selectedItem.input} 
                    readOnly 
                    className="h-24"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-base">Output</Label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 gap-1 text-xs"
                      onClick={() => copyToClipboard(selectedItem.output, "Encrypted or decrypted output copied")}
                    >
                      <Copy size={12} /> Copy
                    </Button>
                  </div>
                  <Textarea 
                    value={selectedItem.output} 
                    readOnly 
                    className="h-24 font-mono text-xs"
                  />
                </div>

                <div className="flex items-center text-sm text-gray-600 gap-1">
                  <Key size={14} />
                  <span>Type: {selectedItem.direction}</span>
                </div>

                <div className="text-xs text-gray-500">
                  Created on {format(new Date(selectedItem.createdAt), 'MMMM d, yyyy h:mm:ss a')}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-center text-gray-500 border-2 border-dashed rounded-md">
                <div>
                  <History size={40} className="mx-auto mb-2 text-gray-400" />
                  <p>Select an item from the history to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoryPanel;
