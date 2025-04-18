import ProgressBar from "@/components/challenges/ProgressBar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/lib/supabase";
import { useChallengeStore } from "@/store/challengeStore";
import { useOverlaySettingsStore } from "@/store/overlaySettingsStore";
import confetti from "canvas-confetti";
import React, { useEffect, useRef, useState } from "react";

// ErrorBoundary Component to handle errors gracefully
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: "red" }}>Error: {this.state.error.message}</div>
      );
    }
    return (this.props as { children: React.ReactNode }).children;
  }
}

// IframeSandbox Component for Secure Custom React Code Execution
const IframeSandbox = ({ code, data }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
          <script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    zinc: {
                      700: '#3f3f46',
                      800: '#27272a',
                      900: '#18181b'
                    }
                  },
                  animation: {
                    'fade-in': 'fadeIn 0.3s ease-in-out'
                  },
                  keyframes: {
                    fadeIn: {
                      '0%': { opacity: '0' },
                      '100%': { opacity: '1' }
                    }
                  }
                }
              }
            }
          </script>
          <style>
            body { margin: 0; padding: 0; font-family: sans-serif; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            try {
              window.sandboxData = ${JSON.stringify(data)};
              ${code}
              ReactDOM.render(
                React.createElement(CustomComponent, window.sandboxData),
                document.getElementById('root')
              );
            } catch (error) {
              console.error('Error in custom component:', error);
              document.getElementById('root').innerHTML = '<div style="color: red;">Error: ' + error.message + '</div>';
            }
          </script>
        </body>
      </html>
    `;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
  }, [code, data]);

  return (
    <iframe
      ref={iframeRef}
      sandbox="allow-scripts allow-same-origin"
      style={{ border: "none", width: "100%", height: "100%" }}
      title="Sandboxed Custom Component"
    />
  );
};

// Main Overlay Component
export default function Overlay() {
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  const { challenges, fetchChallenges, subscribeToChanges } =
    useChallengeStore();
  const { settings, fetchSettings, subscribeToOverlayChanges } =
    useOverlaySettingsStore();
  const [showControls, setShowControls] = useState(false);
  const [previousValues, setPreviousValues] = useState<Record<number, number>>(
    {}
  );
  const [audioPlayers, setAudioPlayers] = useState<
    Record<string, HTMLAudioElement>
  >({});
  const [isSessionReady, setIsSessionReady] = useState(false);

  // On mount, check for token in URL and set session if present
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const encodedAuth = params.get("auth");

      if (encodedAuth) {
        // Decode the base64 encoded token data
        const tokenData = JSON.parse(atob(encodedAuth));

        supabase.auth
          .setSession({
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token || "",
          })
          .then(() => {
            console.log("Session set successfully");
            setIsSessionReady(true);
          })
          .catch((error) => {
            console.error("Error setting session:", error);
            setIsSessionReady(true);
          });
      } else {
        setIsSessionReady(true);
      }
    } catch (error) {
      console.error("Error processing auth data:", error);
      setIsSessionReady(true);
    }
  }, []);

  // Prevent auth hooks from redirecting or showing "Please sign in" toast on this page
  // by faking isAuthenticated if token is present or session is ready
  const isOverlayAccessible = isAuthenticated || isSessionReady;

  // Only fetch data if overlay is accessible
  useEffect(() => {
    if (isOverlayAccessible) {
      fetchChallenges();
      fetchSettings();
    }
  }, [isOverlayAccessible, fetchChallenges, fetchSettings]);

  // Subscribe to Challenge Changes
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (isOverlayAccessible) {
      unsubscribe = subscribeToChanges();
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isOverlayAccessible, subscribeToChanges]);

  // Subscribe to Overlay Settings Changes
  useEffect(() => {
    let unsubscribeOverlay: (() => void) | undefined;
    if (isOverlayAccessible) {
      unsubscribeOverlay = subscribeToOverlayChanges();
    }
    return () => {
      if (unsubscribeOverlay) unsubscribeOverlay();
    };
  }, [isOverlayAccessible, subscribeToOverlayChanges]);

  // Toggle Controls Visibility with Ctrl + H
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "h") {
        setShowControls((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Setup Audio Players Based on Settings
  useEffect(() => {
    if (settings && settings.sound_enabled && settings.sound_type) {
      const players: Record<string, HTMLAudioElement> = {};
      if (settings.sound_type.increment_url) {
        players.increment = new Audio(settings.sound_type.increment_url);
      }
      if (settings.sound_type.decrement_url) {
        players.decrement = new Audio(settings.sound_type.decrement_url);
      }
      if (settings.sound_type.reset_url) {
        players.reset = new Audio(settings.sound_type.reset_url);
      }
      setAudioPlayers(players);
    }
  }, [settings]);

  // Handle Confetti and Sound Effects on Challenge Updates
  useEffect(() => {
    if (!settings || challenges.length === 0) return;

    const updatedValues: Record<number, number> = {};
    let valueChanged = false;
    let actionType: "increment" | "decrement" | "reset" | null = null;

    challenges.forEach((challenge) => {
      updatedValues[challenge.id] = challenge.currentValue;
      if (
        previousValues[challenge.id] !== undefined &&
        previousValues[challenge.id] !== challenge.currentValue
      ) {
        valueChanged = true;
        if (challenge.currentValue > previousValues[challenge.id]) {
          actionType = "increment";
        } else if (challenge.currentValue < previousValues[challenge.id]) {
          actionType = challenge.currentValue === 0 ? "reset" : "decrement";
        }

        if (settings.confetti_enabled) {
          const milestone = Math.ceil(challenge.maxValue / 10);
          if (
            actionType === "increment" &&
            challenge.currentValue % milestone === 0
          ) {
            playConfetti("increment");
          } else if (
            actionType === "decrement" &&
            (challenge.maxValue - challenge.currentValue) % milestone === 0
          ) {
            playConfetti("decrement");
          } else if (actionType === "reset") {
            playConfetti("reset");
          }
        }
      }
    });

    if (valueChanged && actionType && settings.sound_enabled) {
      const player = audioPlayers[actionType];
      if (player) {
        player.currentTime = 0;
        player
          .play()
          .catch((err) => console.error("Error playing sound:", err));
      }
    }

    const isEqual =
      Object.keys(updatedValues).length ===
        Object.keys(previousValues).length &&
      Object.keys(updatedValues).every(
        (key) => updatedValues[Number(key)] === previousValues[Number(key)]
      );

    if (!isEqual) {
      setPreviousValues(updatedValues);
    }
  }, [challenges, settings, audioPlayers, previousValues]);

  // Confetti Animation Function
  const playConfetti = (type) => {
    if (!settings?.confetti_enabled) return;

    const defaults = {
      origin: { y: 0.7 },
      zIndex: 1000,
    };

    switch (type) {
      case "increment":
        confetti({
          ...defaults,
          particleCount: 80,
          spread: 60,
          colors: ["#00ff00", "#4CAF50", "#45B649"],
        });
        break;
      case "decrement":
        confetti({
          ...defaults,
          particleCount: 40,
          spread: 45,
          colors: ["#ff9800", "#f44336", "#ffeb3b"],
        });
        break;
      case "reset":
        confetti({
          ...defaults,
          particleCount: 100,
          spread: 70,
          origin: { y: 0.9 },
        });
        setTimeout(() => {
          confetti({
            ...defaults,
            particleCount: 100,
            spread: 100,
            origin: { y: 0.8, x: 0.3 },
          });
        }, 250);
        setTimeout(() => {
          confetti({
            ...defaults,
            particleCount: 100,
            spread: 100,
            origin: { y: 0.8, x: 0.7 },
          });
        }, 400);
        break;
    }
  };

  // Only render after session is ready or authenticated
  if (!isOverlayAccessible) return null;

  // Render Logic
  if (isLoading) return null;

  const activeChallenges = challenges.filter((c) => c.is_active);

  if (activeChallenges.length === 0) {
    return showControls ? (
      <div className="fixed top-4 left-4 p-4 bg-zinc-900/90 border border-zinc-700 rounded-lg text-white text-sm max-w-xs animate-fade-in backdrop-blur-md">
        <p>No active challenges to display.</p>
        <p className="text-xs text-zinc-400 mt-2">
          Press{" "}
          <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-xs">
            Ctrl+H
          </kbd>{" "}
          to toggle this message.
        </p>
      </div>
    ) : null;
  }

  if (settings) {
    console.log(settings);
    const widthPercent = settings.width;
    const heightPercent = settings.height;
    const posX = settings.position_x;
    const posY = settings.position_y;

    return (
      <div
        className="fixed pointer-events-none"
        style={{
          top: `${posY}px`,
          left: `${posX}px`,
          width: `${widthPercent}%`,
          height: `${heightPercent}%`,
        }}
      >
        {showControls && (
          <div className="fixed top-4 left-4 p-4 bg-transparent border border-zinc-700 rounded-lg text-white text-sm max-w-xs animate-fade-in backdrop-blur-md pointer-events-auto">
            <p>
              Press{" "}
              <kbd className="px-2 py-1 bg-zinc-800 rounded">Ctrl + H</kbd> to
              hide controls
            </p>
          </div>
        )}

        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {settings.react_code ? (
              <ErrorBoundary>
                <IframeSandbox
                  code={settings.react_code}
                  data={{ challenges: activeChallenges, settings }}
                />
              </ErrorBoundary>
            ) : (
              activeChallenges.map((challenge) => (
                <ProgressBar
                  key={challenge.id}
                  title={challenge.title}
                  maxValue={challenge.maxValue}
                  minValue={0}
                  currentValue={challenge.currentValue}
                  endDate={challenge.endDate}
                  className="w-full max-w-lg"
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="fixed pointer-events-none top-0 left-0 w-[10%] h-[7%]">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {activeChallenges.map((challenge) => (
            <ProgressBar
              key={challenge.id}
              title={challenge.title}
              maxValue={challenge.maxValue}
              minValue={0}
              currentValue={challenge.currentValue}
              endDate={challenge.endDate}
              className="w-full max-w-lg"
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
