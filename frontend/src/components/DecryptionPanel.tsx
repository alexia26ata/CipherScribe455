
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { decrypt } from '@/utils/api';
import { Copy, Unlock, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const DecryptionPanel: React.FC = () => {
  const [ciphertext, setCiphertext] = useState<string>('');
  const [privateKeyD, setPrivateKeyD] = useState<string>('');
  const [privateKeyN, setPrivateKeyN] = useState<string>('');
  const [decryptedMessage, setDecryptedMessage] = useState<string>('');
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [keyWarning, setKeyWarning] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if there's a saved key pair in localStorage
    const savedKeyPair = localStorage.getItem('rsa_key_pair');
    if (savedKeyPair) {
      try {
        const keyPair = JSON.parse(savedKeyPair);
        setPrivateKeyD(keyPair.privateKey.d.toString());
        setPrivateKeyN(keyPair.privateKey.n.toString());
      } catch (error) {
        console.error('Error loading saved keys:', error);
      }
    }
  }, []);
  
  const handlePrivateKeyChange = (type: 'd' | 'n', value: string) => {
    if (type === 'd') {
      setPrivateKeyD(value);
    } else {
      setPrivateKeyN(value);
    }
    
    // Only validate if both values are present
    if (privateKeyD && privateKeyN) {
      try {
        const d = parseInt(privateKeyD);
        const n = parseInt(privateKeyN);
        
        if (isNaN(d) || isNaN(n)) {
          setKeyWarning("Keys must be valid numbers");
          return;
        }
        
        setKeyWarning(null);
      } catch (error) {
        setKeyWarning("Invalid key format.");
      }
    }
  };

  const handleDecrypt = async () => {
    const d = privateKeyD.trim();
const n = privateKeyN.trim();

try {
  setIsDecrypting(true);
  const res = await decrypt(ciphertext.trim(), d, n);
  setDecryptedMessage(res.message);

  toast({
    title: "Decryption Successful",
    description: "Your message has been decrypted.",
  });
} catch (error) {
  console.error("Decryption error:", error);
  toast({
    title: "Decryption Failed",
    description: "An error occurred during decryption.",
    variant: "destructive",
  });
} finally {
  setIsDecrypting(false);
}
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: "Decrypted message has been copied to your clipboard.",
      });
    }).catch(err => {
      console.error('Copy failed:', err);
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard. Please try again.",
        variant: "destructive",
      });
    });
  };

  return (
    <Card className="w-full animate-fade-in bg-gray-100">
      <CardHeader className="bg-gray-200 rounded-t-md">
        <CardTitle className="flex items-center gap-2 text-xl text-gray-700">
          <Unlock size={20} />
          Decrypt Message
        </CardTitle>
        <CardDescription className="text-gray-600">
          Enter an encrypted message and your private key to reveal the original content.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div>
          <Label htmlFor="ciphertext" className="text-base mb-2 block text-gray-700">Encrypted Message</Label>
          <Textarea 
            id="ciphertext" 
            placeholder="Paste the encrypted message here..." 
            value={ciphertext} 
            onChange={(e) => setCiphertext(e.target.value)}
            className="h-32 font-mono text-xs bg-white"
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <Label className="text-base text-gray-700">Your Private Key</Label>
            {keyWarning && (
              <div className="flex items-center text-amber-600 text-xs">
                <AlertTriangle size={12} className="mr-1" />
                {keyWarning}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="private-key-d" className="block text-sm font-medium text-gray-700 mb-1">D (Decryption Exponent)</Label>
              <Input
                id="private-key-d"
                placeholder="Enter D value"
                value={privateKeyD}
                onChange={(e) => handlePrivateKeyChange('d', e.target.value)}
                className="font-mono text-sm bg-white"
              />
            </div>
            <div>
              <Label htmlFor="private-key-n" className="block text-sm font-medium text-gray-700 mb-1">N (Modulus)</Label>
              <Input
                id="private-key-n"
                placeholder="Enter N value"
                value={privateKeyN}
                onChange={(e) => handlePrivateKeyChange('n', e.target.value)}
                className="font-mono text-sm bg-white"
              />
            </div>
          </div>
        </div>
        
        {decryptedMessage && (
          <div>
            <div className="flex justify-between mb-2">
              <Label htmlFor="decryptedMessage" className="text-base text-gray-700">Decrypted Message</Label>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 gap-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700"
                onClick={() => copyToClipboard(decryptedMessage)}
              >
                <Copy size={12} /> Copy
              </Button>
            </div>
            <Textarea 
              id="decryptedMessage" 
              value={decryptedMessage} 
              readOnly 
              className="h-32 bg-green-50"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-200 rounded-b-md">
        <Button 
          onClick={handleDecrypt} 
          className="w-full gap-2 bg-gray-600 hover:bg-gray-700 text-white"
          disabled={isDecrypting || !ciphertext.trim() || !privateKeyD.trim() || !privateKeyN.trim()}
        >
          {isDecrypting ? 'Decrypting...' : 'Decrypt Message'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DecryptionPanel;
