'use client';

import { useMemo } from 'react';
import { TokenSource } from 'livekit-client';
import { useSession } from '@livekit/components-react';
import { WarningIcon } from '@phosphor-icons/react/dist/ssr';
import type { AppConfig } from '@/app-config';
import { AgentSessionProvider } from '@/components/agents-ui/agent-session-provider';
import { StartAudioButton } from '@/components/agents-ui/start-audio-button';
import { AuthProvider } from '@/components/app/auth-provider';
import { TrialOfferProvider } from '@/components/app/trial-offer-provider';
import { ViewController } from '@/components/app/view-controller';
import { Toaster } from '@/components/ui/sonner';
import { useAgentErrors } from '@/hooks/useAgentErrors';
import { useDebugMode } from '@/hooks/useDebug';
import { getSandboxTokenSource } from '@/lib/utils';

const IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';

function AppSetup() {
  useDebugMode({ enabled: IN_DEVELOPMENT });
  useAgentErrors();

  return null;
}

interface AppProps {
  appConfig: AppConfig;
}

export function App({ appConfig }: AppProps) {
  const tokenSource = useMemo(() => {
    return typeof process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT === 'string'
      ? getSandboxTokenSource(appConfig)
      : TokenSource.endpoint('/api/connection-details');
  }, [appConfig]);

  const session = useSession(tokenSource, {
    ...(appConfig.agentName ? { agentName: appConfig.agentName } : {}),
    // Give the agent up to 45s to finish initializing (load models, etc.) before showing "did not complete initializing"
    agentConnectTimeoutMilliseconds: 45_000,
  });

  return (
    <AuthProvider>
      <AgentSessionProvider session={session}>
        <TrialOfferProvider>
          <AppSetup />
          <main className="min-h-svh bg-white">
            <ViewController appConfig={appConfig} />
          </main>
          <StartAudioButton label="Start Audio" />
          <Toaster
            icons={{
              warning: <WarningIcon weight="bold" />,
            }}
            position="top-center"
            className="toaster group"
            style={
              {
                '--normal-bg': 'var(--popover)',
                '--normal-text': 'var(--popover-foreground)',
                '--normal-border': 'var(--border)',
              } as React.CSSProperties
            }
          />
        </TrialOfferProvider>
      </AgentSessionProvider>
    </AuthProvider>
  );
}
