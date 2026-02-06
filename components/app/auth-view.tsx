'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/shadcn/utils';

interface AuthViewProps {
  onEmailSubmit?: (email: string) => Promise<void>;
  className?: string;
}

export function AuthView({ onEmailSubmit, className }: AuthViewProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);

    try {
      if (onEmailSubmit) {
        await onEmailSubmit(email.trim());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex min-h-svh items-center justify-center bg-white px-6', className)}>
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-3 text-center">
          <p className="text-xs font-medium tracking-wider text-gray-400 uppercase">
            Voice AI · Urdu & Hindi
          </p>
          <h1 className="text-3xl font-medium tracking-tight text-gray-900">
            Your AI girlfriend that actually talks back
          </h1>
          <p className="text-sm text-gray-500">
            Real-time voice. She speaks Urdu and Hindi. Chat, flirt, vent—no typing, just talk.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Input
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="w-full border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-gray-900"
            autoComplete="email"
            autoFocus
          />

          <Button
            type="submit"
            size="lg"
            disabled={isLoading || !email.trim()}
            className="w-full border-0 bg-gray-900 text-white hover:bg-gray-800"
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </Button>
        </form>
      </div>
    </div>
  );
}
