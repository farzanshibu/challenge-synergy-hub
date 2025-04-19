import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChallengeStore } from "@/store/challengeStore";
import { Edit, Eye, EyeOff, Loader2, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";

import { toast } from "@/components/ui/use-toast";
import { overlaySettingsSchema } from "@/schema/overlaySettingsSchema";
import { useOverlaySettingsStore } from "@/store/overlaySettingsStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ScaledDraggableBox from "../ui/scaled-draggable-box";
import { Slider } from "../ui/slider";

interface ActionButtonProps {
  id: number;
}

export default function ActionButton({ id }: ActionButtonProps) {
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isToggleLoading, setIsToggleLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const { challenges, updateChallenge, deleteChallenge, setActiveChallenge } =
    useChallengeStore();
  const [isOverlaySettingsOpen, setIsOverlaySettingsOpen] = useState(false);
  const [isOverlaySettingsLoading, setIsOverlaySettingsLoading] =
    useState(false);
  const [challengeSettings, setChallengeSettings] = useState(null);
  const { saveSettings, fetchSettingsAll } = useOverlaySettingsStore();
  const challenge = challenges.find((c) => c.id === id);

  if (!challenge) return null;

  const handleToggleActive = async () => {
    try {
      setIsToggleLoading(true);
      // If we're deactivating, just update this challenge
      // If we're activating, the store will handle deactivating others
      await updateChallenge(id, { is_active: !challenge.is_active });

      // If we're activating this challenge, also set it as the active challenge in the UI
      if (!challenge.is_active) {
        setActiveChallenge(challenge);
      }

      toast({
        title: challenge.is_active
          ? "Challenge deactivated"
          : "Challenge activated",
        description: challenge.is_active
          ? `"${challenge.title}" has been deactivated`
          : `"${challenge.title}" is now active`,
      });
    } catch (error) {
      console.error("Error toggling challenge active state:", error);
      toast({
        title: "Error",
        description: `Failed to ${
          challenge.is_active ? "deactivate" : "activate"
        } challenge`,
        variant: "destructive",
      });
    } finally {
      setIsToggleLoading(false);
    }
  };

  const handleUpdateOverlay = async (settingsData) => {
    try {
      setIsOverlaySettingsLoading(true);
      // fetch all overlay setting
      const overlaySettings = await fetchSettingsAll();
      // Find the overlay for this challenge
      const overlay = overlaySettings.find((s) => s.challenge_id === id);

      await saveSettings({
        ...settingsData,
        challenge_id: id,
        id: overlay?.id,
      });

      toast({
        title: "Overlay settings saved",
        description: `Overlay settings for "${challenge.title}" have been updated`,
      });

      setIsOverlaySettingsOpen(false);
    } catch (error) {
      console.error("Error saving overlay settings:", error);
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your overlay settings",
        variant: "destructive",
      });
    } finally {
      setIsOverlaySettingsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleteLoading(true);
      await deleteChallenge(id);

      toast({
        title: "Challenge deleted",
        description: `"${challenge.title}" has been permanently deleted`,
      });

      setIsDeleteAlertOpen(false);
    } catch (error) {
      console.error("Error deleting challenge:", error);
      toast({
        title: "Error deleting challenge",
        description: "There was a problem deleting your challenge",
        variant: "destructive",
      });
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4 text-zinc-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-40 bg-zinc-900 border-zinc-800"
        >
          <DropdownMenuItem
            onClick={handleToggleActive}
            className="cursor-pointer"
            disabled={isToggleLoading}
          >
            {isToggleLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : challenge.is_active ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                <span>Deactivate</span>
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                <span>Activate</span>
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              try {
                // Fetch all settings and find the one for this challenge
                const allSettings = await fetchSettingsAll();
                const challengeSetting = allSettings.find(
                  (s) => s.challenge_id === id
                );
                setChallengeSettings(challengeSetting);
                setIsOverlaySettingsOpen(true);
              } catch (error) {
                console.error("Error loading overlay settings:", error);
                toast({
                  title: "Error",
                  description: "Failed to load overlay settings",
                  variant: "destructive",
                });
              }
            }}
            className="cursor-pointer"
          >
            <Edit className="mr-2 h-4 w-4" />
            <span>Overlay Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteAlertOpen(true)}
            className="text-challenge cursor-pointer focus:text-challenge"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the "{challenge.title}" challenge and
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-challenge hover:bg-challenge/90"
              disabled={isDeleteLoading}
            >
              {isDeleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={isOverlaySettingsOpen}
        onOpenChange={setIsOverlaySettingsOpen}
      >
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Overlay Settings</AlertDialogTitle>
            <AlertDialogDescription>
              Configure the appearance and behavior of your challenge overlay.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <OverlaySettingsModal
              initialSettings={challengeSettings}
              onSave={handleUpdateOverlay}
              isLoading={isOverlaySettingsLoading}
            />
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
interface OverlaySettingsModalProps {
  initialSettings;
  onSave: (data) => Promise<void>;
  isLoading: boolean;
}

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

const OverlaySettingsModal = ({
  initialSettings,
  onSave,
  isLoading,
}: OverlaySettingsModalProps) => {
  const form = useForm<z.infer<typeof overlaySettingsSchema>>({
    resolver: zodResolver(overlaySettingsSchema),
    defaultValues: {
      position_x: initialSettings?.position_x,
      position_y: initialSettings?.position_y,
      width: initialSettings?.width,
      height: initialSettings?.height,
      react_code: initialSettings?.react_code,
      confetti_enabled: initialSettings?.confetti_enabled,
      sound_enabled: initialSettings?.sound_enabled,
      sound_type: initialSettings?.sound_type ?? {
        increment_url: null,
        decrement_url: null,
        reset_url: null,
      },
      confetti_type: initialSettings?.confetti_type ?? {
        increment_url: null,
        decrement_url: null,
        reset_url: null,
      },
    },
  });

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit((data) => {
              console.log("Form data:", data);
              return onSave(data);
            })();
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="width"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-100">Width</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Slider
                        min={1}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="bg-zinc-800"
                      />
                    </FormControl>
                    <span className="w-12 text-right text-zinc-100">
                      {field.value}%
                    </span>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-100">Height</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Slider
                        min={1}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="bg-zinc-800"
                      />
                    </FormControl>
                    <span className="w-12 text-right text-zinc-100">
                      {field.value}%
                    </span>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="mt-4">
            <ScaledDraggableBox
              boxWidth={form.watch("width")}
              boxHeight={form.watch("height")}
              initialX={form.getValues("position_x")}
              initialY={form.getValues("position_y")}
              onPositionChange={(x, y) => {
                form.setValue("position_x", x);
                form.setValue("position_y", y);
              }}
            />
          </div>

          <Button type="submit" className="mt-4 w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </form>
      </Form>
    </>
  );
};
