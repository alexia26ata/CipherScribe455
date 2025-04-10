
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getKeySecurityLevel } from '@/utils/cryptoUtils';
import { encrypt } from '@/utils/api';
import { Copy, LockKeyhole, AlertTriangle, Mail, Download, Clipboard } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";


const EncryptionPanel: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [publicKeyE, setPublicKeyE] = useState<string>('');
  const [publicKeyN, setPublicKeyN] = useState<string>('');
  const [ciphertext, setCiphertext] = useState<string>('');
  const [isEncrypting, setIsEncrypting] = useState<boolean>(false);
  const [keyWarning, setKeyWarning] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePublicKeyChange = (type: 'e' | 'n', value: string) => {
    if (type === 'e') {
      setPublicKeyE(value);
    } else {
      setPublicKeyN(value);
    }
    
    // Only validate if both e and n have values
    if (publicKeyE && publicKeyN) {
      try {
        const e = parseInt(publicKeyE);
        const n = parseInt(publicKeyN);
        
        if (isNaN(e) || isNaN(n)) {
          setKeyWarning("Keys must be valid numbers");
          return;
        }
        
        const securityLevel = getKeySecurityLevel(n);
        
        if (securityLevel === "low") {
          setKeyWarning("Warning: This key has low security and is only suitable for educational purposes.");
        } else if (securityLevel === "medium") {
          setKeyWarning("Note: This key has medium security.");
        } else {
          setKeyWarning(null);
        }
      } catch (error) {
        setKeyWarning("Invalid key format.");
      }
    }
  };

  const handleEncrypt = async () => {
    if (!message.trim()) {
      toast({
        title: "Missing Message",
        description: "Please enter a message to encrypt.",
        variant: "destructive",
      });
      return;
    }
    
    if (!publicKeyE.trim() || !publicKeyN.trim()) {
      toast({
        title: "Missing Public Key",
        description: "Please enter both E and N values for encryption.",
        variant: "destructive",
      });
      return;
    }
    
    const e = parseInt(publicKeyE);
    const n = parseInt(publicKeyN);
    
    if (isNaN(e) || isNaN(n)) {
      toast({
        title: "Invalid Public Key",
        description: "E and N must be valid numbers.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsEncrypting(true);
      const res = await encrypt(message, e.toString(), n.toString());
      setCiphertext(res.ciphertext);
      
      
      toast({
        title: "Encryption Successful",
        description: "Your message has been encrypted.",
      });

    } catch (error) {
      console.error('Encryption error:', error);
      toast({
        title: "Encryption Failed",
        description: error instanceof Error ? error.message : "An error occurred during encryption.",
        variant: "destructive",
      });
    } finally {
      setIsEncrypting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: "Encrypted message has been copied to your clipboard.",
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

  const handleEmailCiphertext = () => {
    const subject = encodeURIComponent("Encrypted Message");
    const body = encodeURIComponent("Here is the encrypted message:\n\n" + ciphertext);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    
    toast({
      title: "Email Client Opened",
      description: "Your default email client should open with the encrypted message.",
    });
  };

  const handleDownloadPDF = () => {
    toast({
      title: "Download Started",
      description: "Your encrypted message has been prepared for download.",
    });
    
    // This would typically use a PDF generation library
    // For now, we'll just download a text file
    const element = document.createElement("a");
    const file = new Blob([ciphertext], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "encrypted_message.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  const handlePastePublicKey = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      
      // Try to extract E and N values from clipboard text
      const eMatch = clipboardText.match(/E:\s*(\d+)/i);
      const nMatch = clipboardText.match(/N:\s*(\d+)/i);
      
      if (eMatch && eMatch[1]) {
        setPublicKeyE(eMatch[1]);
      }
      
      if (nMatch && nMatch[1]) {
        setPublicKeyN(nMatch[1]);
      }
      
      if (eMatch && nMatch) {
        toast({
          title: "Public Key Pasted",
          description: "The recipient's public key has been filled in.",
        });
      } else {
        toast({
          title: "Invalid Format",
          description: "Could not extract E and N values from clipboard. Please paste them manually.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Paste failed:', error);
      toast({
        title: "Paste Failed",
        description: "Could not access clipboard. Please provide permission or paste manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full animate-fade-in bg-gray-100">
      <CardHeader className="bg-gray-200 rounded-t-md">
        <CardTitle className="flex items-center gap-2 text-xl text-gray-700">
          <LockKeyhole size={20} />
          Encrypt Message
        </CardTitle>
        <CardDescription className="text-gray-600">
          Enter your message and the recipient's public key to create an encrypted message that only they can read.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div>
          <Label htmlFor="message" className="text-base mb-2 block text-gray-700">Message to Encrypt</Label>
          <Textarea 
            id="message" 
            placeholder="Enter the message you want to encrypt..." 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            className="h-32 resize-none bg-white"
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <Label className="text-base text-gray-700">Recipient's Public Key</Label>
            {keyWarning && (
              <div className="flex items-center text-amber-600 text-xs">
                <AlertTriangle size={12} className="mr-1" />
                {keyWarning}
              </div>
            )}
          </div>
          
          <div className="mb-2 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 gap-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700"
              onClick={handlePastePublicKey}
            >
              <Clipboard size={12} /> Paste Public Key
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="public-key-e" className="block text-sm font-medium text-gray-700 mb-1">E (Encryption Exponent)</Label>
              <Input
                id="public-key-e"
                placeholder="Enter E value"
                value={publicKeyE}
                onChange={(e) => handlePublicKeyChange('e', e.target.value)}
                className="font-mono text-sm bg-white"
              />
            </div>
            <div>
              <Label htmlFor="public-key-n" className="block text-sm font-medium text-gray-700 mb-1">N (Modulus)</Label>
              <Input
                id="public-key-n"
                placeholder="Enter N value"
                value={publicKeyN}
                onChange={(e) => handlePublicKeyChange('n', e.target.value)}
                className="font-mono text-sm bg-white"
              />
            </div>
          </div>
        </div>
        
        {ciphertext && (
          <div>
            <div className="flex justify-between mb-2">
              <Label htmlFor="ciphertext" className="text-base text-gray-700">Encrypted Message</Label>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 gap-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700"
                  onClick={() => copyToClipboard(ciphertext)}
                >
                  <Copy size={12} /> Copy
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 gap-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700"
                  onClick={handleEmailCiphertext}
                >
                  <Mail size={12} /> Email
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 gap-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700"
                  onClick={handleDownloadPDF}
                >
                  <Download size={12} /> Download
                </Button>
              </div>
            </div>
            <Textarea 
              id="ciphertext" 
              value={ciphertext} 
              readOnly 
              className="h-32 bg-white font-mono text-xs"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-200 rounded-b-md">
        <Button 
          onClick={handleEncrypt} 
          className="w-full gap-2 bg-gray-600 hover:bg-gray-700 text-white"
          disabled={isEncrypting || !message.trim() || !publicKeyE.trim() || !publicKeyN.trim()}
        >
          {isEncrypting ? 'Encrypting...' : 'Encrypt Message'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EncryptionPanel;
