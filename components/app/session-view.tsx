'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useSessionContext, useSessionMessages } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import {
  AgentControlBar,
  type AgentControlBarControls,
} from '@/components/agents-ui/agent-control-bar';
import { ChatTranscript } from '@/components/app/chat-transcript';
import { TileLayout } from '@/components/app/tile-layout';
import { useTrialOffer } from '@/components/app/trial-offer-provider';
import { cn } from '@/lib/shadcn/utils';
import { Shimmer } from '../ai-elements/shimmer';

const INIT_DELAY_SECONDS = 25; // Give agent time to finish initializing (models, etc.)
const FREE_TRIAL_SECONDS = 60; // Then 1-min trial starts

const MotionBottom = motion.create('div');

const MotionMessage = motion.create(Shimmer);

const BOTTOM_VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
      translateY: '0%',
    },
    hidden: {
      opacity: 0,
      translateY: '100%',
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.3,
    delay: 0.5,
    ease: 'easeOut',
  },
};

const SHIMMER_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
      transition: {
        ease: 'easeIn',
        duration: 0.5,
        delay: 0.8,
      },
    },
    hidden: {
      opacity: 0,
      transition: {
        ease: 'easeIn',
        duration: 0.5,
        delay: 0,
      },
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
};

interface FadeProps {
  top?: boolean;
  bottom?: boolean;
  className?: string;
}

export function Fade({ top = false, bottom = false, className }: FadeProps) {
  return (
    <div
      className={cn(
        'from-background pointer-events-none h-4 bg-gradient-to-b to-transparent',
        top && 'bg-gradient-to-b',
        bottom && 'bg-gradient-to-t',
        className
      )}
    />
  );
}

interface SessionViewProps {
  appConfig: AppConfig;
}

export const SessionView = ({
  appConfig,
  ...props
}: React.ComponentProps<'section'> & SessionViewProps) => {
  const session = useSessionContext();
  const { setShowPostTrialOffer } = useTrialOffer();
  const { messages } = useSessionMessages(session);
  const [chatOpen, setChatOpen] = useState(false);
  const [phase, setPhase] = useState<'init' | 'trial'>('init');
  const [secondsLeft, setSecondsLeft] = useState(INIT_DELAY_SECONDS);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const trialEndedRef = useRef(false);

  // 10s init, then 1-min trial: end session when trial time runs out
  useEffect(() => {
    if (!session.isConnected || trialEndedRef.current) return;

    const startedAt = Date.now();
    const trialStartsAt = startedAt + INIT_DELAY_SECONDS * 1000;
    const sessionEndsAt = trialStartsAt + FREE_TRIAL_SECONDS * 1000;

    const tick = () => {
      const now = Date.now();
      if (now < trialStartsAt) {
        setPhase('init');
        setSecondsLeft(Math.max(0, Math.ceil((trialStartsAt - now) / 1000)));
        return;
      }
      setPhase('trial');
      const trialRemaining = Math.max(0, Math.ceil((sessionEndsAt - now) / 1000));
      setSecondsLeft(trialRemaining);
      if (trialRemaining <= 0) {
        trialEndedRef.current = true;
        setShowPostTrialOffer(true);
        session.end();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only start timer when connected
  }, [session.isConnected]);

  const controls: AgentControlBarControls = {
    leave: true,
    microphone: true,
    chat: appConfig.supportsChatInput,
    camera: appConfig.supportsVideoInput,
    screenShare: appConfig.supportsScreenShare,
  };

  useEffect(() => {
    const lastMessage = messages.at(-1);
    const lastMessageIsLocal = lastMessage?.from?.isLocal === true;

    if (scrollAreaRef.current && lastMessageIsLocal) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <section className="bg-background relative z-10 h-svh w-svw overflow-hidden" {...props}>
      {/* Init / free trial countdown */}
      <div className="absolute top-4 right-4 left-4 z-20 flex justify-center">
        <span className="rounded bg-gray-900 px-3 py-1.5 text-xs font-medium text-white">
          {phase === 'init'
            ? `Initializing... ${secondsLeft}s`
            : `Free trial: ${secondsLeft}s left`}
        </span>
      </div>
      <Fade top className="absolute inset-x-4 top-0 z-10 h-40" />
      {/* transcript */}
      <ChatTranscript
        hidden={!chatOpen}
        messages={messages}
        className="space-y-3 transition-opacity duration-300 ease-out"
      />
      {/* Tile layout */}
      <TileLayout chatOpen={chatOpen} />
      {/* Bottom */}
      <MotionBottom
        {...BOTTOM_VIEW_MOTION_PROPS}
        className="fixed inset-x-3 bottom-0 z-50 md:inset-x-12"
      >
        {/* Pre-connect message */}
        {appConfig.isPreConnectBufferEnabled && (
          <AnimatePresence>
            {messages.length === 0 && (
              <MotionMessage
                key="pre-connect-message"
                duration={2}
                aria-hidden={messages.length > 0}
                {...SHIMMER_MOTION_PROPS}
                className="pointer-events-none mx-auto block w-full max-w-2xl pb-4 text-center text-sm font-semibold"
              >
                Agent is listening, ask it a question
              </MotionMessage>
            )}
          </AnimatePresence>
        )}
        <div className="bg-background relative mx-auto max-w-2xl pb-3 md:pb-12">
          <Fade bottom className="absolute inset-x-0 top-0 h-4 -translate-y-full" />
          <AgentControlBar
            variant="livekit"
            controls={controls}
            isChatOpen={chatOpen}
            isConnected={session.isConnected}
            onDisconnect={session.end}
            onIsChatOpenChange={setChatOpen}
          />
        </div>
      </MotionBottom>
    </section>
  );
};
