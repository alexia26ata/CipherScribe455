
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { generateKeyPair, IntegerKeyPair, getKeySecurityLevel } from '@/utils/cryptoUtils';
import { Copy, RefreshCw, Info, Share2, Download, Shield, AlertTriangle, Zap } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const KeyGenerator: React.FC = () => {
  const [keySize, setKeySize] = useState<"small" | "large">("large");
  const [keyPair, setKeyPair] = useState<IntegerKeyPair | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedKeyPair = localStorage.getItem('rsa_key_pair');
    if (savedKeyPair) {
      try {
        setKeyPair(JSON.parse(savedKeyPair));
        toast({
          title: "Keys Loaded",
          description: "Your saved RSA key pair has been loaded.",
        });
      } catch (error) {
        console.error('Error loading saved keys:', error);
      }
    }
  }, []);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      // Slight delay to ensure UI updates before the CPU-intensive operation
      setTimeout(() => {
        const newKeyPair = generateKeyPair(keySize);
        setKeyPair(newKeyPair);
        
        localStorage.setItem('rsa_key_pair', JSON.stringify(newKeyPair));
        
        toast({
          title: "Keys Generated Successfully",
          description: `Your RSA key pair has been generated and saved locally.`,
        });
        setIsGenerating(false);
      }, 10);
    } catch (error) {
      console.error('Key generation error:', error);
      toast({
        title: "Error Generating Keys",
        description: "An error occurred while generating keys. Please try again.",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, keyType: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: `${keyType} has been copied to your clipboard.`,
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

  const handleSharePublicKey = () => {
    if (!keyPair) return;
    
    const subject = encodeURIComponent("My RSA Public Key");
    const body = encodeURIComponent(`Here is my RSA public key:\n\nE: ${keyPair.publicKey.e}\nN: ${keyPair.publicKey.n}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    
    toast({
      title: "Email Client Opened",
      description: "Your default email client should open with your public key.",
    });
  };

  const handleDownloadPrivateKey = () => {
    if (!keyPair) return;
    
    const privateKeyText = `RSA PRIVATE KEY\n\nD: ${keyPair.privateKey.d}\nN: ${keyPair.privateKey.n}`;
    const element = document.createElement("a");
    const file = new Blob([privateKeyText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "rsa_private_key.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Private Key Downloaded",
      description: "Your private key has been downloaded as a text file.",
    });
  };

  const getSecurityIndicator = () => {
    if (!keyPair) return null;
    
    const level = getKeySecurityLevel(keyPair.publicKey.n);
    let color = "";
    let text = "";
    
    switch (level) {
      case "low":
        color = "bg-red-500";
        text = "Low Security";
        break;
      case "medium":
        color = "bg-yellow-500";
        text = "Medium Security";
        break;
      case "high":
        color = "bg-green-500";
        text = "High Security";
        break;
    }
    
    return (
      <div className="mt-2 flex items-center text-sm">
        <div className={`w-3 h-3 rounded-full ${color} mr-2`}></div>
        {text}
      </div>
    );
  };

  return (
    <Card className="w-full animate-fade-in bg-gray-100">
      <CardHeader className="bg-gray-200 rounded-t-md">
        <CardTitle className="flex items-center gap-2 text-xl text-gray-700">
          <Shield size={20} />
          Generate RSA Key Pair
          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Zap size={12} /> Fast Mode
          </span>
        </CardTitle>
        <CardDescription className="text-gray-600">
          Create a new RSA public/private key pair for encryption. The public key can be shared with others, 
          but keep your private key secret.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6">
          <Label className="text-base mb-2 block text-gray-700">Select Key Size</Label>
          <RadioGroup 
            value={keySize} 
            onValueChange={(value) => setKeySize(value as "small" | "large")}
            className="flex flex-col space-y-2 sm:flex-row sm:space-x-6 sm:space-y-0"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="small" id="r1" />
              <Label htmlFor="r1" className="text-gray-700">1024 bit</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={16} className="text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-80">
                    1024-bit keys are smaller and faster to generate, useful for understanding RSA basics.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="large" id="r2" />
              <Label htmlFor="r2" className="text-gray-700">2048 bit</Label>
              <span className="text-xs text-gray-500">(Recommended)</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={16} className="text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-80">
                    2048-bit keys provide better security and are recommended for most use cases.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </RadioGroup>
        </div>

        {!keyPair && !isGenerating && (
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-md mb-6">
            <div className="flex items-start">
              <Info className="text-blue-500 mr-3 mt-0.5" size={18} />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Optimized for Speed</p>
                <p>This version uses an optimized key generation algorithm to create keys much faster than standard implementations.</p>
              </div>
            </div>
          </div>
        )}

        {keyPair && (
          <div className="space-y-6">
            {getSecurityIndicator()}
            
            <div className="border rounded-md p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-700">Public Key</h3>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 gap-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700"
                    onClick={() => copyToClipboard(`E: ${keyPair.publicKey.e}, N: ${keyPair.publicKey.n}`, 'Public key')}
                  >
                    <Copy size={12} /> Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 gap-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700"
                    onClick={handleSharePublicKey}
                  >
                    <Share2 size={12} /> Share
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="public-e" className="block text-sm font-medium text-gray-700 mb-1">E (Encryption Exponent)</Label>
                  <Input
                    id="public-e"
                    value={keyPair.publicKey.e}
                    readOnly
                    className="font-mono text-sm bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="public-n" className="block text-sm font-medium text-gray-700 mb-1">N (Modulus)</Label>
                  <Input
                    id="public-n"
                    value={keyPair.publicKey.n}
                    readOnly
                    className="font-mono text-sm bg-white"
                  />
                </div>
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                The public key is used for encryption and can be shared with anyone.
              </div>
            </div>
            
            <div className="border border-red-100 rounded-md p-4 bg-red-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium flex items-center text-gray-700">
                  Private Key
                  <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-800 rounded text-xs">Keep Secret</span>
                </h3>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 gap-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700"
                    onClick={() => copyToClipboard(`D: ${keyPair.privateKey.d}, N: ${keyPair.privateKey.n}`, 'Private key')}
                  >
                    <Copy size={12} /> Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 gap-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700"
                    onClick={handleDownloadPrivateKey}
                  >
                    <Download size={12} /> Download
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="private-d" className="block text-sm font-medium text-gray-700 mb-1">D (Decryption Exponent)</Label>
                  <Input
                    id="private-d"
                    value={keyPair.privateKey.d}
                    readOnly
                    className="font-mono text-sm bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="private-n" className="block text-sm font-medium text-gray-700 mb-1">N (Modulus)</Label>
                  <Input
                    id="private-n"
                    value={keyPair.privateKey.n}
                    readOnly
                    className="font-mono text-sm bg-white"
                  />
                </div>
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                The private key is used for decryption and must be kept secret.
              </div>
            </div>
            
            <div className="bg-gray-200 border border-gray-300 rounded-md p-4">
              <h3 className="text-sm font-medium mb-2 text-gray-700">How This Works</h3>
              <p className="text-xs text-gray-600">
                <strong>Encryption:</strong> c = (message^e) mod n<br/>
                <strong>Decryption:</strong> message = (c^d) mod n<br/>
                <br/>
                The security of RSA relies on the difficulty of factoring the product of two large prime numbers (n = p × q).
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-200 rounded-b-md">
        <Button 
          onClick={handleGenerate} 
          className="w-full gap-2 bg-gray-600 hover:bg-gray-700 text-white"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Generating Keys...
            </>
          ) : (
            <>
              <Zap size={16} />
              Generate New Key Pair
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default KeyGenerator;
