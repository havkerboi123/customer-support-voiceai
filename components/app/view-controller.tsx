'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useSessionContext } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { useAuth } from '@/components/app/auth-provider';
import { AuthView } from '@/components/app/auth-view';
import { SessionView } from '@/components/app/session-view';
import { TrialEndedView } from '@/components/app/trial-ended-view';
import { useTrialOffer } from '@/components/app/trial-offer-provider';
import { WelcomeView } from '@/components/app/welcome-view';

const MotionAuthView = motion.create(AuthView);
const MotionWelcomeView = motion.create(WelcomeView);
const MotionSessionView = motion.create(SessionView);
const MotionTrialEndedView = motion.create(TrialEndedView);

const VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
    },
    hidden: {
      opacity: 0,
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.5,
    ease: 'linear',
  },
};

interface ViewControllerProps {
  appConfig: AppConfig;
}

export function ViewController({ appConfig }: ViewControllerProps) {
  const { isAuthenticated, submitEmail } = useAuth();
  const { showPostTrialOffer } = useTrialOffer();
  const { isConnected, start } = useSessionContext();

  return (
    <AnimatePresence mode="wait">
      {/* Auth view */}
      {!isAuthenticated && (
        <MotionAuthView key="auth" {...VIEW_MOTION_PROPS} onEmailSubmit={submitEmail} />
      )}
      {/* Post-trial offer (want more minutes? suggest a feature) */}
      {isAuthenticated && !isConnected && showPostTrialOffer && (
        <MotionTrialEndedView key="trial-ended" {...VIEW_MOTION_PROPS} />
      )}
      {/* Welcome view */}
      {isAuthenticated && !isConnected && !showPostTrialOffer && (
        <MotionWelcomeView
          key="welcome"
          {...VIEW_MOTION_PROPS}
          startButtonText={appConfig.startButtonText}
          onStartCall={start}
        />
      )}
      {/* Session view */}
      {isAuthenticated && isConnected && (
        <MotionSessionView key="session-view" {...VIEW_MOTION_PROPS} appConfig={appConfig} />
      )}
    </AnimatePresence>
  );
}
