import { useAuth } from '@/components/app/auth-provider';
import { Button } from '@/components/ui/button';

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  const { email } = useAuth();

  return (
    <div ref={ref} className="flex min-h-svh items-center justify-center bg-white px-6">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-medium tracking-tight text-gray-900">Ready to talk</h1>
          <p className="text-sm text-gray-500">
            Voice AI girlfriend · Urdu & Hindi · 1-min free trial
          </p>
          {email && <p className="text-xs text-gray-400">{email}</p>}
        </div>

        <Button
          size="lg"
          onClick={onStartCall}
          className="w-full border-0 bg-gray-900 text-white hover:bg-gray-800"
        >
          {startButtonText || 'Start'}
        </Button>
      </div>
    </div>
  );
};
