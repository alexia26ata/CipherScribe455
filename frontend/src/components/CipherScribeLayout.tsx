import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KeyGenerator from './KeyGenerator';
import EncryptionPanel from './EncryptionPanel';
import DecryptionPanel from './DecryptionPanel';
import HistoryPanel from './HistoryPanel';
import AuthScreen from './AuthScreen';
import { KeyRound, Lock, Unlock, History, BookOpen, LogOut } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CipherScribeLayoutProps {
  onAuthenticated: (user: { username: string }) => void;
}

const CipherScribeLayout: React.FC<CipherScribeLayoutProps> = ({ onAuthenticated }) => {
  const [activeTab, setActiveTab] = useState<string>("keys");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userData, setUserData] = useState<{ username: string } | null>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Check for existing session on mount
  useEffect(() => {
    const sessionData = sessionStorage.getItem('rsa_auth_session');
    if (sessionData) {
      try {
        const parsedData = JSON.parse(sessionData);
        setUserData(parsedData);
        setIsAuthenticated(true);
        onAuthenticated(parsedData); // 👈 propagate to App.tsx
      } catch (e) {
        console.error("Failed to restore session", e);
      }
    }
  }, []);

  const handleAuthenticated = (userData: { username: string }) => {
    setUserData(userData);
    setIsAuthenticated(true);
    sessionStorage.setItem('rsa_auth_session', JSON.stringify(userData));
    onAuthenticated(userData); // 👈 propagate to App.tsx
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    sessionStorage.removeItem('rsa_auth_session');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  if (!isAuthenticated) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-crypto-light/30 px-4 py-6">
      <header className="container mx-auto mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            CipherScribe
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 hidden md:inline-block">
              Logged in as <span className="font-medium">{userData?.username}</span>
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 bg-gray-200 hover:bg-gray-300"
              onClick={handleLogout}
            >
              <LogOut size={isMobile ? 16 : 18} />
              {!isMobile && "Logout"}
            </Button>
          </div>
        </div>
        <p className="text-lg text-gray-600 mb-6 text-center">
          RSA Encryption Made Simple
        </p>
      </header>

      <main className="container mx-auto pb-16">
        <Tabs 
          defaultValue="keys" 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="max-w-4xl mx-auto"
        >
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-8">
            <TabsTrigger value="keys" className="gap-2">
              <KeyRound size={isMobile ? 16 : 18} />
              {!isMobile && "Key Generator"}
            </TabsTrigger>
            <TabsTrigger value="encrypt" className="gap-2">
              <Lock size={isMobile ? 16 : 18} />
              {!isMobile && "Encrypt"}
            </TabsTrigger>
            <TabsTrigger value="decrypt" className="gap-2">
              <Unlock size={isMobile ? 16 : 18} />
              {!isMobile && "Decrypt"}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History size={isMobile ? 16 : 18} />
              {!isMobile && "History"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="keys">
            <KeyGenerator />
          </TabsContent>
          
          <TabsContent value="encrypt">
            <EncryptionPanel />
          </TabsContent>
          
          <TabsContent value="decrypt">
            <DecryptionPanel />
          </TabsContent>
          
          <TabsContent value="history">
            <HistoryPanel />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="container mx-auto text-center text-gray-500 text-sm py-4">
        <p>CipherScribe RSA Encryption Tool — Made with privacy in mind</p>
        <div className="flex justify-center mt-2 space-x-3">
          <a href="#about" className="hover:text-crypto-purple flex items-center gap-1">
            <BookOpen size={14} /> About RSA Encryption
          </a>
        </div>
      </footer>
    </div>
  );
};

export default CipherScribeLayout;
