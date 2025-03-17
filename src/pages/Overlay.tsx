import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useChallengeStore } from "@/store/challengeStore";
import {
  useOverlaySettingsStore,
  OverlaySettings,
} from "@/store/overlaySettingsStore";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import ProgressBar from "@/components/challenges/ProgressBar";
import { ScrollArea } from "@/components/ui/scroll-area";
import confetti from "canvas-confetti";

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

  // Get active challenges
  const activeChallenges = challenges.filter((c) => c.is_active);

  // Initial load for challenges and settings, and subscribe to challenge updates
  useEffect(() => {
    if (isAuthenticated) {
      fetchChallenges();
      fetchSettings();
    }

    let unsubscribe: (() => void) | undefined;
    if (isAuthenticated) {
      unsubscribe = subscribeToChanges();
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthenticated, fetchChallenges, fetchSettings, subscribeToChanges]);

  // Subscribe to overlay settings changes for realtime updates
  useEffect(() => {
    let unsubscribeOverlay: (() => void) | undefined;
    if (isAuthenticated) {
      unsubscribeOverlay = subscribeToOverlayChanges();
    }
    return () => {
      if (unsubscribeOverlay) unsubscribeOverlay();
    };
  }, [isAuthenticated, subscribeToOverlayChanges]);

  // Toggle controls visibility on key press
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

  // Setup audio players when settings load
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

    // Check for differences before updating previousValues
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

  // Play confetti animation
  const playConfetti = (type: "increment" | "decrement" | "reset") => {
    if (!settings?.confetti_enabled) return;

    const defaults = {
      origin: { y: 0.7 },
      zIndex: 1000,
    };

    if (settings?.confetti_type?.[`${type}_url`]) {
      confetti({
        ...defaults,
        particleCount: type === "increment" ? 60 : 40,
        spread: type === "increment" ? 55 : 45,
      });
      return;
    }

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

  // If loading, show nothing (transparent overlay)
  if (isLoading) {
    return null;
  }

  // If not authenticated, show message
  if (!isAuthenticated) {
    return (
      <div className="fixed top-4 left-4 p-4 bg-zinc-900/90 border border-zinc-700 rounded-lg text-white text-sm max-w-xs animate-fade-in backdrop-blur-md">
        <p>Please log in to view your challenges overlay.</p>
      </div>
    );
  }

  // If no active challenges, show message (only if controls are shown)
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

  // Use custom styles if available, with custom React code or default rendering
  if (settings) {
    let CustomComponent = null;
    if (settings.react_code) {
      try {
        CustomComponent = new Function('return ' + settings.react_code)();
      } catch (error) {
        console.error("Error evaluating react_code:", error);
        // Fallback to default rendering by keeping CustomComponent as null
      }
    }

    const widthPercent = settings?.width ?? 10;
    const heightPercent = settings?.height ?? 7;
    const posX = settings?.position_x ?? 0;
    const posY = settings?.position_y ?? 0;

    const adjustedLeft = Math.min(posX, 115 - widthPercent); // Ensure right edge stays within 100%
    const adjustedTop = Math.min(posY, 125 - heightPercent); // Ensure bottom edge stays within 100%

    return (
      <div
        className="fixed pointer-events-none"
        style={{
          top: `${adjustedTop}%`,
          left: `${adjustedLeft}%`,
          width: `${widthPercent}%`,
          height: `${heightPercent}%`,
        }}
      >
        {/* Controls */}
        {showControls && (
          <div className="fixed top-4 left-4 p-4 bg-zinc-900/90 border border-zinc-700 rounded-lg text-white text-sm max-w-xs animate-fade-in backdrop-blur-md pointer-events-auto">
            <p>
              Press{" "}
              <kbd className="px-2 py-1 bg-zinc-800 rounded">Ctrl + H</kbd> to
              hide controls
            </p>
          </div>
        )}

        {/* Active Challenges */}
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {CustomComponent ? (
              <CustomComponent
                challenges={activeChallenges}
                settings={settings}
              />
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

  // Fallback rendering if settings are not available
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
