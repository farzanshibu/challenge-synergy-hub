import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Info, UploadIcon } from "lucide-react";
import { format } from "date-fns";
import { useChallengeStore } from "@/store/challengeStore";
import { useOverlaySettingsStore } from "@/store/overlaySettingsStore";
import { formSchema, FormValues } from "@/schema/formSchema";
import {
  overlaySettingsSchema,
  OverlaySettingsFormValues,
} from "@/schema/overlaySettingsSchema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Slider } from "../ui/slider";
import { Textarea } from "../ui/textarea";

export default function ChallengeForm() {
  const { loading, addChallenge } = useChallengeStore();
  const { settings, saveSettings, uploadAudio, uploadConfetti } =
    useOverlaySettingsStore();

  const overlayForm = useForm<OverlaySettingsFormValues>({
    resolver: zodResolver(overlaySettingsSchema),
    defaultValues: {
      position_x: settings?.position_x ?? 10,
      position_y: settings?.position_y ?? 10,
      width: settings?.width ?? 20,
      height: settings?.height ?? 10,
      react_code: "",
      confetti_enabled: settings?.confetti_enabled ?? true,
      sound_enabled: settings?.sound_enabled ?? true,
      sound_type: settings?.sound_type || {
        increment_url: null,
        decrement_url: null,
        reset_url: null,
      },
      confetti_type: settings?.confetti_type || {
        increment_url: null,
        decrement_url: null,
        reset_url: null,
      },
      advanced_positioning: false,
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      currentValue: 0,
      maxValue: 100,
      is_active: true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (values.currentValue >= values.maxValue) {
      toast.info("Current value cannot be greater than max value");
      return;
    }

    if (values.maxValue < 0 || values.currentValue < 0) {
      toast.error("Values cannot be negative");
      return;
    }

    await toast.promise(
      (async () => {
        // Extract challenge form values for addChallenge
        const challengeValues: FormValues = {
          title: values.title,
          currentValue: values.currentValue,
          maxValue: values.maxValue,
          endDate: values.endDate,
          is_active: values.is_active,
        };

        const challenge = await addChallenge(challengeValues);

        // Get overlay settings values from the overlayForm
        const overlayValues = overlayForm.getValues();

        // Prepare sound_type and confetti_type as JSON objects for database
        const settingsToSave = {
          position_x: overlayValues.position_x,
          position_y: overlayValues.position_y,
          width: overlayValues.width,
          height: overlayValues.height,
          react_code: overlayValues.react_code,
          confetti_enabled: overlayValues.confetti_enabled,
          sound_enabled: overlayValues.sound_enabled,
          sound_type: {
            increment_url: overlayValues.sound_type?.increment_url ?? null,
            decrement_url: overlayValues.sound_type?.decrement_url ?? null,
            reset_url: overlayValues.sound_type?.reset_url ?? null,
          },
          confetti_type: {
            increment_url: overlayValues.confetti_type?.increment_url ?? null,
            decrement_url: overlayValues.confetti_type?.decrement_url ?? null,
            reset_url: overlayValues.confetti_type?.reset_url ?? null,
          },
          challenge_id: challenge,
        };

        // Save overlay settings
        await saveSettings(settingsToSave);

        form.reset();
        overlayForm.reset();
      })(),
      {
        loading: "Creating challenge...",
        success: "Challenge created successfully.",
        error: "There was a problem creating your challenge.",
      }
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="h-[600px] overflow-y-auto"
      >
        <Tabs defaultValue="challenge" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="challenge">Challenge Details</TabsTrigger>
            <TabsTrigger value="overlay">Overlay Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="challenge">
            <Card className="bg-zinc-800 border-zinc-900">
              <CardHeader className="flex justify-between flex-row items-center">
                <CardTitle className="text-zinc-100">
                  Challenge Details
                </CardTitle>
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-full border border-rose-300 bg-rose-200/20 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-transparent transition-all duration-300"
                >
                  {loading ? "Adding..." : "Add Challenge"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-100">Challenge</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                          placeholder="Enter challenge title"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-zinc-400">
                        Name of the Challenge
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="currentValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-100">
                          Current Value
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0"
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription className="text-zinc-400">
                          Starting value for the challenge
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-100">
                          Max Value
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="100"
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription className="text-zinc-400">
                          Target value to complete the challenge
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-zinc-100">
                          End Date
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal bg-zinc-900 border-zinc-700 text-zinc-100",
                                  !field.value && "text-zinc-500"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0 bg-zinc-900 border-zinc-700"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              className="rounded-md border border-zinc-700"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription className="text-zinc-400">
                          Optional deadline for the challenge
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 mt-5 rounded-md border border-zinc-700">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-accent"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-zinc-100">
                            Active Challenge
                          </FormLabel>
                          <FormDescription className="text-zinc-400">
                            Display this challenge in your overlay
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overlay">
            <Card className="bg-zinc-800 border-zinc-900">
              <CardHeader className="flex justify-between flex-row items-center">
                <CardTitle className="text-zinc-100">
                  Overlay Configuration
                </CardTitle>
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-full border border-rose-300 bg-rose-200/20 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-transparent transition-all duration-300"
                >
                  {loading ? "Adding..." : "Add Challenge"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={overlayForm.control}
                      name="width"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-100">Width</FormLabel>
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400 text-sm">
                                {field.value}%
                              </span>
                              <span className="text-zinc-400 text-sm">
                                100%
                              </span>
                            </div>
                            <FormControl>
                              <Slider
                                min={0}
                                max={100}
                                step={1}
                                value={[field.value]}
                                onValueChange={(values) =>
                                  field.onChange(values[0])
                                }
                                className="w-full"
                              />
                            </FormControl>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={overlayForm.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-100">
                            Height
                          </FormLabel>
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400 text-sm">
                                {field.value}%
                              </span>
                              <span className="text-zinc-400 text-sm">
                                100%
                              </span>
                            </div>
                            <FormControl>
                              <Slider
                                min={0}
                                max={100}
                                step={1}
                                value={[field.value]}
                                onValueChange={(values) =>
                                  field.onChange(values[0])
                                }
                                className="w-full"
                              />
                            </FormControl>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-zinc-100">Position</FormLabel>
                      <FormField
                        control={overlayForm.control}
                        name="advanced_positioning"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormLabel className="text-zinc-400 text-sm">
                              Advanced
                            </FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-rose-500"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Simple 3x3 Grid */}
                    {!overlayForm.watch("advanced_positioning") && (
                      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
                        <div className="grid grid-cols-3 gap-2">
                          {/* Top Row */}
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

                            // Check if this position is currently selected
                            const isSelected =
                              Math.abs(overlayForm.watch("position_x") - posX) <
                                5 &&
                              Math.abs(overlayForm.watch("position_y") - posY) <
                                5;

                            return (
                              <button
                                key={position}
                                type="button"
                                className={`flex items-center justify-center h-16 rounded-md transition-colors ${
                                  isSelected
                                    ? "bg-rose-500/30 border-2 border-rose-500"
                                    : "bg-zinc-800 hover:bg-zinc-700"
                                }`}
                                onClick={() => {
                                  overlayForm.setValue("position_x", posX);
                                  overlayForm.setValue("position_y", posY);
                                }}
                              >
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    isSelected ? "bg-rose-500" : "bg-zinc-500"
                                  }`}
                                ></div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Advanced positioning */}
                    {overlayForm.watch("advanced_positioning") && (
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={overlayForm.control}
                          name="position_x"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-zinc-100">
                                X Position
                              </FormLabel>
                              <div className="flex flex-col space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-zinc-400 text-sm">
                                    {field.value}%
                                  </span>
                                  <span className="text-zinc-400 text-sm">
                                    100%
                                  </span>
                                </div>
                                <FormControl>
                                  <Slider
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={[field.value]}
                                    onValueChange={(values) =>
                                      field.onChange(values[0])
                                    }
                                    className="w-full"
                                  />
                                </FormControl>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={overlayForm.control}
                          name="position_y"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-zinc-100">
                                Y Position
                              </FormLabel>
                              <div className="flex flex-col space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-zinc-400 text-sm">
                                    {field.value}%
                                  </span>
                                  <span className="text-zinc-400 text-sm">
                                    100%
                                  </span>
                                </div>
                                <FormControl>
                                  <Slider
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={[field.value]}
                                    onValueChange={(values) =>
                                      field.onChange(values[0])
                                    }
                                    className="w-full"
                                  />
                                </FormControl>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <FormField
                    control={overlayForm.control}
                    name="confetti_enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-700 p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-zinc-100">
                            Enable Confetti
                          </FormLabel>
                          <FormDescription className="text-zinc-400">
                            Show confetti animation on milestone achievements
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={overlayForm.control}
                    name="sound_enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-700 p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-zinc-100">
                            Enable Sounds
                          </FormLabel>
                          <FormDescription className="text-zinc-400">
                            Play sound effects on value changes
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-zinc-100">
                    Custom Sounds
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={overlayForm.control}
                      name="sound_type.increment_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-100">
                            Increment Sound
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                accept="audio/*"
                                className="bg-zinc-900 border-zinc-700 text-zinc-100"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = await uploadAudio(
                                      file,
                                      "increment"
                                    );
                                    field.onChange(url);
                                  }
                                }}
                              />
                              {field.value && (
                                <audio
                                  controls
                                  src={field.value}
                                  className="h-8"
                                />
                              )}
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={overlayForm.control}
                      name="sound_type.decrement_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-100">
                            Decrement Sound
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                accept="audio/*"
                                className="bg-zinc-900 border-zinc-700 text-zinc-100"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = await uploadAudio(
                                      file,
                                      "decrement"
                                    );
                                    field.onChange(url);
                                  }
                                }}
                              />
                              {field.value && (
                                <audio
                                  controls
                                  src={field.value}
                                  className="h-8"
                                />
                              )}
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={overlayForm.control}
                      name="sound_type.reset_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-100">
                            Reset Sound
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                accept="audio/*"
                                className="bg-zinc-900 border-zinc-700 text-zinc-100"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = await uploadAudio(
                                      file,
                                      "reset"
                                    );
                                    field.onChange(url);
                                  }
                                }}
                              />
                              {field.value && (
                                <audio
                                  controls
                                  src={field.value}
                                  className="h-8"
                                />
                              )}
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator className="my-4" />
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-zinc-100">
                      Custom Confetti
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-zinc-100 border-zinc-700"
                      onClick={() => {
                        // Add new custom confetti type
                        const currentTypes =
                          overlayForm.getValues("confetti_type");
                        const newTypes = currentTypes || {};
                        const newKey = `custom_${
                          Object.keys(newTypes).length + 1
                        }`;

                        overlayForm.setValue("confetti_type", {
                          ...newTypes,
                          [newKey]: {
                            name: "",
                            url: "",
                          },
                        });
                      }}
                    >
                      <UploadIcon className="h-4 w-4" />
                      Add Custom Type
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={overlayForm.control}
                      name="confetti_type.increment_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-100">
                            Increment Animation
                          </FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100">
                                  <SelectValue placeholder="Select animation" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-700">
                                  <SelectItem value="default">
                                    Default Confetti
                                  </SelectItem>
                                  <SelectItem value="fireworks">
                                    Fireworks
                                  </SelectItem>
                                  <SelectItem value="sparkles">
                                    Sparkles
                                  </SelectItem>
                                  <SelectItem value="custom">
                                    Custom Upload
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              {field.value === "custom" && (
                                <Input
                                  type="file"
                                  accept=".json"
                                  className="bg-zinc-900 border-zinc-700 text-zinc-100"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      // Handle custom confetti upload
                                      const url = await uploadConfetti(
                                        file,
                                        "increment"
                                      );
                                      field.onChange(url);
                                    }
                                  }}
                                />
                              )}
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={overlayForm.control}
                      name="confetti_type.decrement_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-100">
                            Decrement Animation
                          </FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100">
                                  <SelectValue placeholder="Select animation" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-700">
                                  <SelectItem value="default">
                                    Default Effect
                                  </SelectItem>
                                  <SelectItem value="rain">
                                    Rain Effect
                                  </SelectItem>
                                  <SelectItem value="fade">
                                    Fade Effect
                                  </SelectItem>
                                  <SelectItem value="custom">
                                    Custom Upload
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              {field.value === "custom" && (
                                <Input
                                  type="file"
                                  accept=".json"
                                  className="bg-zinc-900 border-zinc-700 text-zinc-100"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const url = await uploadConfetti(
                                        file,
                                        "decrement"
                                      );
                                      field.onChange(url);
                                    }
                                  }}
                                />
                              )}
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={overlayForm.control}
                      name="confetti_type.reset_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-100">
                            Reset Animation
                          </FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100">
                                  <SelectValue placeholder="Select animation" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-700">
                                  <SelectItem value="default">
                                    Default Reset
                                  </SelectItem>
                                  <SelectItem value="sweep">
                                    Sweep Effect
                                  </SelectItem>
                                  <SelectItem value="burst">
                                    Burst Effect
                                  </SelectItem>
                                  <SelectItem value="custom">
                                    Custom Upload
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              {field.value === "custom" && (
                                <Input
                                  type="file"
                                  accept=".json"
                                  className="bg-zinc-900 border-zinc-700 text-zinc-100"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const url = await uploadConfetti(
                                        file,
                                        "reset"
                                      );
                                      field.onChange(url);
                                    }
                                  }}
                                />
                              )}
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-zinc-100">
                    Custom Overlay Code
                  </h3>
                  <FormField
                    control={overlayForm.control}
                    name="react_code"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-zinc-100">
                            Custom React Code
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 p-0"
                              >
                                <Info className="h-4 w-4 text-zinc-400" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 h-60 overflow-scroll bg-zinc-900 border-zinc-700">
                              <div className="space-y-2">
                                <h4 className="font-medium text-zinc-100">
                                  Available Variables
                                </h4>
                                <p className="text-sm text-zinc-400">
                                  Use these variables in your custom React code:
                                </p>
                                <ul className="list-disc list-inside text-sm text-zinc-400">
                                  <li>
                                    <code>challenge</code>: {"{"} id, title,
                                    currentValue, maxValue, minValue, endDate{" "}
                                    {"}"}
                                  </li>
                                  <li>
                                    <code>settings</code>: {"{"} position_x,
                                    position_y, width, height, ... {"}"}
                                  </li>
                                </ul>
                                <p className="text-sm text-zinc-400">
                                  Example:
                                </p>
                                <pre className="bg-zinc-800 p-2 rounded text-sm text-zinc-300 overflow-scroll">
                                  {`
// Custom component for challenge display
const CustomComponent = ({ challenges, settings }) => {
  // Helper function to determine color based on progress
  const getProgressColor = (current, max) => {
    const percent = (current / max) * 100;
    if (percent < 30) return "#ef4444"; // Red
    if (percent < 70) return "#f59e0b"; // Amber
    return "#10b981"; // Green
  };

  // Calculate time remaining
  const getTimeRemaining = (endDate) => {
    if (!endDate) return null;
    
    const end = new Date(endDate);
    const now = new Date();
    const diff = end - now;
    
    if (diff <= 0) return "Expired";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return \`\${days}d \${hours}h\`;
    
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return \`\${hours}h \${minutes}m\`;
  };

  // Custom styling options from settings
  const theme = settings?.theme || "dark";
  const primaryColor = settings?.primary_color || "#3b82f6";
  const accentColor = settings?.accent_color || "#10b981";

  // Base theme styles
  const baseStyles = {
    dark: {
      background: "rgba(24, 24, 27, 0.85)",
      text: "#ffffff", 
      subtext: "#a1a1aa",
      border: "#3f3f46",
    },
    light: {
      background: "rgba(250, 250, 250, 0.85)",
      text: "#18181b",
      subtext: "#71717a", 
      border: "#e4e4e7",
    },
  };
  
  const styles = baseStyles[theme];

  return (
    <div style={{
      fontFamily: "monospace",
      height: "100%", 
      overflow: "auto",
      padding: "8px",
      backdropFilter: "blur(8px)"
    }}>
      {challenges.length === 0 ? (
        <div style={{
          padding: "12px",
          borderRadius: "8px", 
          background: styles.background,
          color: styles.text,
          border: \`1px solid \${styles.border}\`,
          textAlign: "center",
          fontFamily: "monospace"
        }}>
          No active challenges
        </div>
      ) : (
        challenges.map((challenge) => {
          const progressColor = getProgressColor(challenge.currentValue, challenge.maxValue);
          const percent = Math.min(100, Math.round((challenge.currentValue / challenge.maxValue) * 100));
          const timeLeft = getTimeRemaining(challenge.endDate);
          
          return (
            <div key={challenge.id} style={{
              marginBottom: "12px",
              padding: "12px",
              borderRadius: "8px",
              background: styles.background,
              border: \`1px solid \${styles.border}\`,
              color: styles.text,
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
              fontFamily: "monospace"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px"
              }}>
                <div style={{ fontWeight: "600", fontFamily: "monospace" }}>{challenge.title}</div>
                {timeLeft && (
                  <div style={{
                    fontSize: "12px",
                    color: styles.subtext,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    background: theme === "dark" ? "rgba(63, 63, 70, 0.5)" : "rgba(228, 228, 231, 0.5)",
                    fontFamily: "monospace"
                  }}>
                    {timeLeft}
                  </div>
                )}
              </div>
              
              <div style={{
                position: "relative",
                height: "8px",
                borderRadius: "4px",
                background: theme === "dark" ? "rgba(63, 63, 70, 0.5)" : "rgba(228, 228, 231, 0.5)",
                overflow: "hidden",
                marginBottom: "8px"
              }}>
                <div style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: \`\${percent}%\`,
                  backgroundColor: progressColor,
                  transition: "width 0.5s ease-out"
                }}></div>
              </div>
              
              <div style={{
                display: "flex",
                justifyContent: "space-between", 
                fontSize: "12px",
                color: styles.subtext,
                fontFamily: "monospace"
              }}>
                <div>{challenge.currentValue} / {challenge.maxValue}</div>
                <div>{percent}%</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
`}
                                </pre>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <FormControl>
                          <Textarea
                            className="bg-zinc-900 border-zinc-700 text-zinc-100 min-h-[200px]"
                            placeholder="Enter your custom React code here"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-zinc-400">
                          Write custom React code to render the overlay. Use the
                          info button to see available variables.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
