import { useState } from "react";
import { useChallengeStore } from "@/store/challengeStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, Eye, EyeOff } from "lucide-react";
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

import { useOverlaySettingsStore } from "@/store/overlaySettingsStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "../ui/switch";
import { Slider } from "../ui/slider";

interface ActionButtonProps {
  id: number;
}

export default function ActionButton({ id }: ActionButtonProps) {
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const { challenges, updateChallenge, deleteChallenge, setActiveChallenge } =
    useChallengeStore();
  const [isOverlaySettingsOpen, setIsOverlaySettingsOpen] = useState(false);
  const { settings, saveSettings, fetchSettingsAll } =
    useOverlaySettingsStore();
  const challenge = challenges.find((c) => c.id === id);

  if (!challenge) return null;

  const handleToggleActive = async () => {
    // If we're deactivating, just update this challenge
    // If we're activating, the store will handle deactivating others
    await updateChallenge(id, { is_active: !challenge.is_active });

    // If we're activating this challenge, also set it as the active challenge in the UI
    if (!challenge.is_active) {
      setActiveChallenge(challenge);
    }
  };

  const handleSetActive = () => {
    setActiveChallenge(challenge);
  };

  const handleUpdateOverlay = async (settingsData: any) => {
    // fetch all overlay setting
    const overlaySettings = await fetchSettingsAll();
    // Find the overlay for this challenge
    const overlay = overlaySettings.find((s) => s.challenge_id === id);

    try {
      await saveSettings({
        ...settingsData,
        challenge_id: id,
        id: overlay.id,
      });
      setIsOverlaySettingsOpen(false);
    } catch (error) {
      console.error("Error saving overlay settings:", error);
    }
  };

  const handleDelete = async () => {
    await deleteChallenge(id);
    setIsDeleteAlertOpen(false);
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
            onClick={handleSetActive}
            className="cursor-pointer"
          >
            <Eye className="mr-2 h-4 w-4" />
            <span>Set Active</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleToggleActive}
            className="cursor-pointer"
          >
            {challenge.is_active ? (
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
            onClick={() => setIsOverlaySettingsOpen(true)}
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
            >
              Delete
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
          </AlertDialogHeader>
          <div className="space-y-4">
            <OverlaySettingsModal
              initialSettings={settings}
              onSave={handleUpdateOverlay}
            />
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
const OverlaySettingsModal = ({
  initialSettings,
  onSave,
}: {
  initialSettings: any;
  onSave: (settings: any) => void;
}) => {
  const [localSettings, setLocalSettings] = useState(initialSettings || {});
  const [advancedPositioning, setAdvancedPositioning] = useState(false);

  return (
    <Tabs defaultValue="general">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-zinc-100">Position</Label>
              <div className="flex items-center space-x-2">
                <Label className="text-zinc-400 text-sm">Advanced</Label>
                <Switch
                  checked={advancedPositioning}
                  onCheckedChange={setAdvancedPositioning}
                  className="data-[state=checked]:bg-rose-500"
                />
              </div>
            </div>

            {!advancedPositioning ? (
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    "top-left",
                    "top-center",
                    "top-right",
                    "middle-left",
                    "middle-center",
                    "middle-right",
                    "bottom-left",
                    "bottom-center",
                    "bottom-right",
                  ].map((position, index) => {
                    const row = Math.floor(index / 3);
                    const col = index % 3;
                    const posX = col === 0 ? 5 : col === 1 ? 50 : 90;
                    const posY = row === 0 ? 5 : row === 1 ? 50 : 90;
                    const isSelected =
                      Math.abs(localSettings.position_x - posX) < 5 &&
                      Math.abs(localSettings.position_y - posY) < 5;

                    return (
                      <button
                        key={position}
                        type="button"
                        className={`flex items-center justify-center h-16 rounded-md transition-colors ${
                          isSelected
                            ? "bg-rose-500/30 border-2 border-rose-500"
                            : "bg-zinc-800 hover:bg-zinc-700"
                        }`}
                        onClick={() =>
                          setLocalSettings({
                            ...localSettings,
                            position_x: posX,
                            position_y: posY,
                          })
                        }
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isSelected ? "bg-rose-500" : "bg-zinc-500"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-100">X Position</Label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-sm">
                        {localSettings.position_x}%
                      </span>
                      <span className="text-zinc-400 text-sm">100%</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[localSettings.position_x || 0]}
                      onValueChange={(values) =>
                        setLocalSettings({
                          ...localSettings,
                          position_x: values[0],
                        })
                      }
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-100">Y Position</Label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-sm">
                        {localSettings.position_y}%
                      </span>
                      <span className="text-zinc-400 text-sm">100%</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[localSettings.position_y || 0]}
                      onValueChange={(values) =>
                        setLocalSettings({
                          ...localSettings,
                          position_y: values[0],
                        })
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="appearance">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-100">Width</Label>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-sm">
                    {localSettings.width}%
                  </span>
                  <span className="text-zinc-400 text-sm">100%</span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[localSettings.width || 0]}
                  onValueChange={(values) =>
                    setLocalSettings({ ...localSettings, width: values[0] })
                  }
                  className="w-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-100">Height</Label>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-sm">
                    {localSettings.height}%
                  </span>
                  <span className="text-zinc-400 text-sm">100%</span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[localSettings.height || 0]}
                  onValueChange={(values) =>
                    setLocalSettings({ ...localSettings, height: values[0] })
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <Button className="mt-4 w-full" onClick={() => onSave(localSettings)}>
        Save Settings
      </Button>
    </Tabs>
  );
};
