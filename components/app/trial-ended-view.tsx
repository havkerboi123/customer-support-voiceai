'use client';

import { useState } from 'react';
import { useAuth } from '@/components/app/auth-provider';
import { useTrialOffer } from '@/components/app/trial-offer-provider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shadcn/utils';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';

type Step = 'offer' | 'suggest' | 'thanks';

export function TrialEndedView() {
  const { email } = useAuth();
  const { setShowPostTrialOffer } = useTrialOffer();
  const [step, setStep] = useState<Step>('offer');
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNoThanks = () => {
    setShowPostTrialOffer(false);
  };

  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!suggestion.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      if (isSupabaseConfigured) {
        const { error: err } = await supabase.from('feature_suggestions').insert([
          {
            email: email || 'unknown',
            suggestion: suggestion.trim(),
            created_at: new Date().toISOString(),
          },
        ]);
        if (err) throw err;
      }
      setStep('thanks');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseThanks = () => {
    setShowPostTrialOffer(false);
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-white px-6">
      <div className="w-full max-w-md space-y-6">
        {step === 'offer' && (
          <>
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-medium tracking-tight text-gray-900">
                Your free minute is up
              </h1>
              <p className="text-sm text-gray-500">Want more free minutes?</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={handleNoThanks}
              >
                No thanks
              </Button>
              <Button
                className="flex-1 border-0 bg-gray-900 text-white hover:bg-gray-800"
                onClick={() => setStep('suggest')}
              >
                Yes
              </Button>
            </div>
          </>
        )}

        {step === 'suggest' && (
          <>
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-medium tracking-tight text-gray-900">
                Suggest one feature
              </h1>
              <p className="text-sm text-gray-500">
                What would you like to see? We’ll use your idea to improve.
              </p>
            </div>
            <form onSubmit={handleSubmitSuggestion} className="space-y-4">
              {error && (
                <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-600">
                  {error}
                </div>
              )}
              <textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="e.g. More languages, different voice..."
                className={cn(
                  'flex min-h-[100px] w-full rounded border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 ring-1 placeholder:text-gray-400',
                  'focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
                required
                disabled={isSubmitting}
                maxLength={500}
                rows={4}
              />
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || !suggestion.trim()}
                className="w-full border-0 bg-gray-900 text-white hover:bg-gray-800"
              >
                {isSubmitting ? 'Saving...' : 'Submit'}
              </Button>
            </form>
          </>
        )}

        {step === 'thanks' && (
          <>
            <div className="space-y-3 text-center">
              <h1 className="text-2xl font-medium tracking-tight text-gray-900">
                Thanks for your idea
              </h1>
              <p className="text-sm text-gray-500">
                We’ll get back to you in 60 min. More free minutes will be given to you.
              </p>
            </div>
            <Button
              size="lg"
              className="w-full border-0 bg-gray-900 text-white hover:bg-gray-800"
              onClick={handleCloseThanks}
            >
              Continue
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
