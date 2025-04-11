import CipherScribeLayout from '@/components/CipherScribeLayout';

interface IndexProps {
  onAuthenticated: (user: { username: string }) => void;
}

const Index = ({ onAuthenticated }: IndexProps) => {
  return <CipherScribeLayout onAuthenticated={onAuthenticated} />;
};

export default Index;
