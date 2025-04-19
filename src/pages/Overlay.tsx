import ProgressBar from "@/components/challenges/ProgressBar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/lib/supabase";
import { useChallengeStore } from "@/store/challengeStore";
import { useOverlaySettingsStore } from "@/store/overlaySettingsStore";
import confetti from "canvas-confetti";
import React, { useCallback, useEffect, useRef, useState } from "react";

// Helper function to map scale values to Tailwind scale classes
const getScaleClass = (scale: number): string => {
  // Map the scale value (50-200) to appropriate Tailwind class
  if (scale <= 50) return "scale-50";
  if (scale <= 60) return "scale-[0.6]";
  if (scale <= 70) return "scale-[0.7]";
  if (scale <= 75) return "scale-75";
  if (scale <= 80) return "scale-[0.8]";
  if (scale <= 90) return "scale-90";
  if (scale <= 100) return "scale-100";
  if (scale <= 110) return "scale-110";
  if (scale <= 125) return "scale-125";
  if (scale <= 140) return "scale-140"; // Custom scale class
  if (scale <= 150) return "scale-150";
  if (scale <= 175) return "scale-[1.75]";
  if (scale >= 200) return "scale-[2.0]";
  return "scale-100"; // Default
};

// ErrorBoundary Component to handle errors gracefully
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-500">Error: {this.state.error.message}</div>
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
      className="w-full h-full animate-fade-in border-0"
      title="Sandboxed Custom Component"
    />
  );
};

// Main Overlay Component
export default function Overlay() {
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  const { challenges, fetchChallenges, subscribeToChanges } =
    useChallengeStore();
  const { settings, fetchSettings, subscribeToOverlayChanges, saveSettings } =
    useOverlaySettingsStore();
  const [showControls, setShowControls] = useState(false);
  const [previousValues, setPreviousValues] = useState<Record<number, number>>(
    {}
  );
  const [audioPlayers, setAudioPlayers] = useState<
    Record<string, HTMLAudioElement>
  >({});
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [isPositionAdjustMode, setIsPositionAdjustMode] = useState(false);
  const [isScalingMode, setIsScalingMode] = useState(false);
  // Flag to control whether subscription updates should affect position/scale
  const [ignoreSubscriptionUpdates, setIgnoreSubscriptionUpdates] =
    useState(false);

  // Local state for optimistic position updates
  const [localPosition, setLocalPosition] = useState({
    x: settings?.position_x || 0,
    y: settings?.position_y || 0,
  });
  // Local state for optimistic size updates
  const [localSize, setLocalSize] = useState({
    width: settings?.width || 10,
    height: settings?.height || 7,
    scale: settings?.scale || 100,
  });

  // Ref to track the save timeout
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced save settings function wrapped in useCallback
  const debouncedSaveSettings = useCallback(
    (updatedSettings: typeof settings, delay = 200) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveSettings(updatedSettings);
        saveTimeoutRef.current = null;
      }, delay);
    },
    [saveSettings]
  );

  // Update local position and size when settings change
  useEffect(() => {
    if (settings && !ignoreSubscriptionUpdates) {
      setLocalPosition({ x: settings.position_x, y: settings.position_y });
      setLocalSize({
        width: settings.width,
        height: settings.height,
        scale: settings.scale || 100,
      });
    }
  }, [settings, ignoreSubscriptionUpdates]);

  // Confetti Animation Function
  const playConfetti = React.useCallback(
    (type) => {
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
    },
    [settings?.confetti_enabled]
  );

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

  // Optimized position adjustment with arrow keys using requestAnimationFrame
  useEffect(() => {
    if (!isPositionAdjustMode || !settings) return;

    const handlePositionKeyDown = (e) => {
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key))
        return;

      // Prevent default arrow key behavior when in position adjust mode
      e.preventDefault();

      // Larger movement step when shift is pressed
      const moveStep = e.shiftKey ? 20 : 5;

      // Update local position immediately for smooth animation
      setLocalPosition((prev) => {
        let newPosX = prev.x;
        let newPosY = prev.y;

        switch (e.key) {
          case "ArrowUp":
            newPosY = Math.max(0, prev.y - moveStep);
            break;
          case "ArrowDown":
            newPosY = prev.y + moveStep;
            break;
          case "ArrowLeft":
            newPosX = Math.max(0, prev.x - moveStep);
            break;
          case "ArrowRight":
            newPosX = prev.x + moveStep;
            break;
        }

        return { x: newPosX, y: newPosY };
      });
    };

    // For continuous movement when key is held down
    const pressedKeys = new Set();

    const handleKeyDown = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        pressedKeys.add(e.key);
        handlePositionKeyDown(e);
      }
    };

    const handleKeyUp = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        pressedKeys.delete(e.key);

        // Save position to database when done moving
        if (pressedKeys.size === 0 && settings) {
          // Update the settings state immediately to match local position
          // This prevents the jump back to previous position
          saveSettings({
            ...settings,
            position_x: localPosition.x,
            position_y: localPosition.y,
          });
        }
      }
    };

    // Animation loop for smooth movement when keys are held down
    let animationFrameId;
    const updatePosition = () => {
      if (pressedKeys.size > 0) {
        const moveStep = pressedKeys.has("Shift") ? 20 : 5;

        setLocalPosition((prev) => {
          let newPosX = prev.x;
          let newPosY = prev.y;

          if (pressedKeys.has("ArrowUp")) {
            newPosY = Math.max(0, prev.y - moveStep);
          }
          if (pressedKeys.has("ArrowDown")) {
            newPosY = prev.y + moveStep;
          }
          if (pressedKeys.has("ArrowLeft")) {
            newPosX = Math.max(0, prev.x - moveStep);
          }
          if (pressedKeys.has("ArrowRight")) {
            newPosX = prev.x + moveStep;
          }

          return { x: newPosX, y: newPosY };
        });
      }

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    animationFrameId = requestAnimationFrame(updatePosition);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationFrameId);

      // Final save on unmount if needed
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        if (
          settings &&
          (localPosition.x !== settings.position_x ||
            localPosition.y !== settings.position_y)
        ) {
          saveSettings({
            ...settings,
            position_x: localPosition.x,
            position_y: localPosition.y,
          });
        }
      }
    };
  }, [isPositionAdjustMode, settings, saveSettings, localPosition]);

  // Scaling functionality with +/- keys and W/H modifiers
  useEffect(() => {
    if (!isScalingMode || !settings) return;

    const pressedKeys = new Set();

    const handleKeyDown = (e) => {
      // Add key to set of pressed keys
      pressedKeys.add(e.key);

      // Handle scaling only with + and - keys (Equal and Minus on keyboard)
      if ((e.key === "+" || e.key === "=" || e.key === "-") && isScalingMode) {
        e.preventDefault();

        // Determine scaling increment/decrement
        const scaleStep = pressedKeys.has("Shift") ? 5 : 1; // Larger steps with Shift
        const isIncrement = e.key === "+" || e.key === "=";
        const delta = isIncrement ? scaleStep : -scaleStep;

        // Only apply changes if one of the modifier keys (W, H, S) is pressed
        if (
          pressedKeys.has("w") ||
          pressedKeys.has("W") ||
          pressedKeys.has("h") ||
          pressedKeys.has("H") ||
          pressedKeys.has("s") ||
          pressedKeys.has("S")
        ) {
          setLocalSize((prev) => {
            let newWidth = prev.width;
            let newHeight = prev.height;
            let newScale = prev.scale;

            // If S key is pressed, only adjust scale
            if (pressedKeys.has("s") || pressedKeys.has("S")) {
              newScale = Math.max(50, Math.min(200, prev.scale + delta));
              return { width: newWidth, height: newHeight, scale: newScale };
            }

            // If W key is pressed, only adjust width
            if (pressedKeys.has("w") || pressedKeys.has("W")) {
              newWidth = Math.max(5, Math.min(100, prev.width + delta));
              return { width: newWidth, height: newHeight, scale: newScale };
            }

            // If H key is pressed, only adjust height
            if (pressedKeys.has("h") || pressedKeys.has("H")) {
              newHeight = Math.max(5, Math.min(100, prev.height + delta));
              return { width: newWidth, height: newHeight, scale: newScale };
            }

            return { width: newWidth, height: newHeight, scale: newScale };
          });
        }
      }
    };

    const handleKeyUp = (e) => {
      // Remove key from pressed keys
      pressedKeys.delete(e.key);

      // When releasing a scaling key, save settings
      if ((e.key === "+" || e.key === "=" || e.key === "-") && settings) {
        debouncedSaveSettings({
          ...settings,
          width: localSize.width,
          height: localSize.height,
          scale: localSize.scale,
        });
      }
    };

    // Animation loop for smooth scaling when keys are held down
    let animationFrameId;
    const updateScaling = () => {
      if (
        (pressedKeys.has("+") ||
          pressedKeys.has("=") ||
          pressedKeys.has("-")) &&
        isScalingMode
      ) {
        const scaleStep = pressedKeys.has("Shift") ? 5 : 1; // Larger steps with Shift
        const isIncrement = pressedKeys.has("+") || pressedKeys.has("=");
        const delta = isIncrement ? scaleStep : -scaleStep;

        // Only apply changes if one of the modifier keys (W, H, S) is pressed
        if (
          pressedKeys.has("w") ||
          pressedKeys.has("W") ||
          pressedKeys.has("h") ||
          pressedKeys.has("H") ||
          pressedKeys.has("s") ||
          pressedKeys.has("S")
        ) {
          setLocalSize((prev) => {
            let newWidth = prev.width;
            let newHeight = prev.height;
            let newScale = prev.scale;

            // If S key is pressed, only adjust scale
            if (pressedKeys.has("s") || pressedKeys.has("S")) {
              newScale = Math.max(50, Math.min(200, prev.scale + delta));
              return { width: newWidth, height: newHeight, scale: newScale };
            }

            // If W key is pressed, only adjust width
            if (pressedKeys.has("w") || pressedKeys.has("W")) {
              newWidth = Math.max(5, Math.min(100, prev.width + delta));
              return { width: newWidth, height: newHeight, scale: newScale };
            }

            // If H key is pressed, only adjust height
            if (pressedKeys.has("h") || pressedKeys.has("H")) {
              newHeight = Math.max(5, Math.min(100, prev.height + delta));
              return { width: newWidth, height: newHeight, scale: newScale };
            }

            return { width: newWidth, height: newHeight, scale: newScale };
          });
        }
      }

      animationFrameId = requestAnimationFrame(updateScaling);
    };

    animationFrameId = requestAnimationFrame(updateScaling);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationFrameId);

      // Final save on unmount if needed
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        if (
          settings &&
          (localSize.width !== settings.width ||
            localSize.height !== settings.height)
        ) {
          saveSettings({
            ...settings,
            width: localSize.width,
            height: localSize.height,
          });
        }
      }
    };
  }, [
    isScalingMode,
    settings,
    saveSettings,
    debouncedSaveSettings,
    localPosition,
    localSize,
  ]);

  // Toggle Controls Visibility and Modes with Shift + key combinations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "H") {
        setShowControls((prev) => !prev);
      } else if (e.shiftKey && e.key === "P") {
        // Toggle position adjustment mode with Shift + P
        setIsPositionAdjustMode((prev) => {
          const newValue = !prev;
          if (newValue) {
            // If turning on position mode, turn off scaling mode
            setIsScalingMode(false);
          }
          return newValue;
        });
        setShowControls(true); // Always show controls when in position adjust mode
      } else if (e.shiftKey && e.key === "S") {
        // Toggle scaling mode with Shift + S
        setIsScalingMode((prev) => {
          const newValue = !prev;
          if (newValue) {
            // If turning on scaling mode, turn off position mode
            setIsPositionAdjustMode(false);
          }
          return newValue;
        });
        setShowControls(true); // Always show controls when in scaling mode
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Update mode flags and prevent subscription updates during active editing
  useEffect(() => {
    setIgnoreSubscriptionUpdates(isPositionAdjustMode || isScalingMode);
  }, [isPositionAdjustMode, isScalingMode]);

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
  }, [challenges, settings, audioPlayers, previousValues, playConfetti]);

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
            Shift+H
          </kbd>{" "}
          to toggle this message.
        </p>
      </div>
    ) : null;
  }

  if (settings) {
    // Use local state for rendering dimensions
    const widthPercent = localSize.width;
    const heightPercent = localSize.height;
    const posX = localPosition.x;
    const posY = localPosition.y;

    // Determine transitions based on adjustment modes
    const useTransitions = !isPositionAdjustMode && !isScalingMode;

    return (
      <>
        <div
          className={`fixed pointer-events-none ${
            isPositionAdjustMode
              ? "border-2 border-blue-500"
              : isScalingMode
              ? "border-2 border-green-500"
              : ""
          } ${getScaleClass(localSize.scale)}`}
          style={{
            top: `${posY}px`,
            left: `${posX}px`,
            width: `${widthPercent}%`,
            height: `${heightPercent}%`,
            transition: useTransitions
              ? "top 0.1s ease-out, left 0.1s ease-out, width 0.1s ease-out, height 0.1s ease-out"
              : "none",
          }}
        >
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

        {showControls && (
          <div className="fixed top-4 left-4 p-4 bg-zinc-900/90 border border-zinc-700 rounded-lg text-white text-sm max-w-xs animate-fade-in backdrop-blur-md pointer-events-auto">
            <div className="space-y-2">
              <p>
                Press{" "}
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-xs">
                  Shift+H
                </kbd>{" "}
                to hide controls
              </p>
              <p>
                Press{" "}
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-xs">
                  Shift+P
                </kbd>{" "}
                to {isPositionAdjustMode ? "exit" : "enter"} position adjustment
                mode
              </p>
              <p>
                Press{" "}
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-xs">
                  Shift+S
                </kbd>{" "}
                to {isScalingMode ? "exit" : "enter"} scaling mode
              </p>

              {isPositionAdjustMode && (
                <div className="mt-2 space-y-1 text-xs">
                  <p className="font-semibold text-blue-400">
                    Position Adjustment Mode Active
                  </p>
                  <p>Use arrow keys to move the overlay</p>
                  <p>Hold Shift + arrow keys for larger movements</p>
                  <p>
                    Current position: X:{posX} Y:{posY}
                  </p>
                </div>
              )}

              {isScalingMode && (
                <div className="mt-2 space-y-1 text-xs">
                  <p className="font-semibold text-green-400">
                    Scaling Mode Active
                  </p>
                  <p>Press +/- keys while holding:</p>
                  <p>W to adjust width</p>
                  <p>H to adjust height</p>
                  <p>S to adjust widget scale</p>
                  <p>Hold Shift for larger increments</p>
                  <p>
                    Current size: {widthPercent}% × {heightPercent}%
                  </p>
                  <p>Current scale: {localSize.scale}%</p>
                </div>
              )}
            </div>
          </div>
        )}
      </>
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
