
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Upload } from "lucide-react";
import { format } from "date-fns";
import { useChallengeStore } from "@/store/challengeStore";
import { useOverlaySettingsStore } from "@/store/overlaySettingsStore";
import { formSchema, FormValues } from "@/schema/formSchema";
import { overlaySettingsSchema, OverlaySettingsFormValues } from "@/schema/overlaySettingsSchema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export default function ChallengeForm() {
  const { loading, addChallenge } = useChallengeStore();
  const { settings, saveSettings, uploadAudio, uploadConfetti } = useOverlaySettingsStore();
  
  const overlayForm = useForm<OverlaySettingsFormValues>({
    resolver: zodResolver(overlaySettingsSchema),
    defaultValues: {
      position_x: settings?.position_x ?? 10,
      position_y: settings?.position_y ?? 10,
      width: settings?.width ?? 300,
      height: settings?.height ?? 200,
      confetti_enabled: settings?.confetti_enabled ?? true,
      sound_enabled: settings?.sound_enabled ?? true,
      sound_type: settings?.sound_type ?? null,
      confetti_type: settings?.confetti_type ?? null
    }
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
  
  const onSubmit = async (values: FormValues & OverlaySettingsFormValues) => {
    if (values.currentValue >= values.maxValue) {
      toast({
        title: "Invalid values",
        description: "Current value cannot be greater than max value",
        variant: "destructive",
      });
      return;
    }
    
    if (values.maxValue < 0 || values.currentValue < 0) {
      toast({
        title: "Invalid values",
        description: "Values cannot be negative",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Extract challenge form values for addChallenge
      const challengeValues: FormValues = {
        title: values.title,
        currentValue: values.currentValue,
        maxValue: values.maxValue,
        endDate: values.endDate,
        is_active: values.is_active
      };
      
      const challenge = await addChallenge(challengeValues);
      
      // Prepare sound_type and confetti_type as JSON objects for database
      const settingsToSave = {
        position_x: values.position_x,
        position_y: values.position_y,
        width: values.width,
        height: values.height,
        confetti_enabled: values.confetti_enabled,
        sound_enabled: values.sound_enabled,
        sound_type: {
          increment_url: values.sound_type?.increment_url ?? null,
          decrement_url: values.sound_type?.decrement_url ?? null,
          reset_url: values.sound_type?.reset_url ?? null
        },
        confetti_type: {
          increment_url: values.confetti_type?.increment_url ?? null,
          decrement_url: values.confetti_type?.decrement_url ?? null,
          reset_url: values.confetti_type?.reset_url ?? null
        },
        challenge_id: challenge
      };
      
      // Save overlay settings
      await saveSettings(settingsToSave);
      
      form.reset();
      overlayForm.reset();
      
      toast({
        title: "Challenge created",
        description: "Your challenge has been created successfully"
      });
    } catch (error) {
      console.error("Error adding challenge:", error);
      toast({
        title: "Error creating challenge",
        description: "There was a problem creating your challenge",
        variant: "destructive"
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="h-[600px] overflow-y-auto">
        <Tabs defaultValue="challenge" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="challenge">Challenge Details</TabsTrigger>
            <TabsTrigger value="overlay">Overlay Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="challenge">
        <Card className="bg-zinc-800 border-zinc-900">
          <CardHeader className="flex justify-between flex-row items-center">
            <CardTitle className="text-zinc-100">Challenge Details</CardTitle>
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
                    <FormLabel className="text-zinc-100">Current Value</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                        placeholder="0"
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                    <FormLabel className="text-zinc-100">Max Value</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                        placeholder="100"
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                    <FormLabel className="text-zinc-100">End Date</FormLabel>
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
                      <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-700">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="bg-zinc-900 text-zinc-100 p-3 pointer-events-auto"
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
                      <FormLabel className="text-zinc-100">Active Challenge</FormLabel>
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
            <CardHeader>
              <CardTitle className="text-zinc-100">Overlay Customization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={overlayForm.control}
                  name="position_x"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-100">X Position</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="bg-zinc-900 border-zinc-700 text-zinc-100"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={overlayForm.control}
                  name="position_y"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-100">Y Position</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="bg-zinc-900 border-zinc-700 text-zinc-100"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={overlayForm.control}
                  name="width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-100">Width</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="bg-zinc-900 border-zinc-700 text-zinc-100"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={overlayForm.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-100">Height</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="bg-zinc-900 border-zinc-700 text-zinc-100"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <FormField
                  control={overlayForm.control}
                  name="confetti_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-700 p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-zinc-100">Enable Confetti</FormLabel>
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
                        <FormLabel className="text-zinc-100">Enable Sounds</FormLabel>
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
                <h3 className="text-lg font-medium text-zinc-100">Custom Sounds</h3>
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={overlayForm.control}
                    name="sound_type.increment_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-100">Increment Sound</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="audio/*"
                              className="bg-zinc-900 border-zinc-700 text-zinc-100"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = await uploadAudio(file, 'increment');
                                  field.onChange(url);
                                }
                              }}
                            />
                            {field.value && (
                              <audio controls src={field.value} className="h-8" />
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
                        <FormLabel className="text-zinc-100">Decrement Sound</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="audio/*"
                              className="bg-zinc-900 border-zinc-700 text-zinc-100"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = await uploadAudio(file, 'decrement');
                                  field.onChange(url);
                                }
                              }}
                            />
                            {field.value && (
                              <audio controls src={field.value} className="h-8" />
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
                        <FormLabel className="text-zinc-100">Reset Sound</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="audio/*"
                              className="bg-zinc-900 border-zinc-700 text-zinc-100"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = await uploadAudio(file, 'reset');
                                  field.onChange(url);
                                }
                              }}
                            />
                            {field.value && (
                              <audio controls src={field.value} className="h-8" />
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
                  <h3 className="text-lg font-medium text-zinc-100">Custom Confetti</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-zinc-100 border-zinc-700"
                    onClick={() => {
                      // Add new custom confetti type
                      const currentTypes = overlayForm.getValues("confetti_type");
                      const newTypes = currentTypes || {};
                      const newKey = `custom_${Object.keys(newTypes).length + 1}`;
                      
                      overlayForm.setValue("confetti_type", {
                        ...newTypes,
                        [newKey]: {
                          name: "",
                          url: ""
                        }
                      });
                    }}
                  >
                    Add Custom Type
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={overlayForm.control}
                    name="confetti_type.increment_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-100">Increment Animation</FormLabel>
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
                                <SelectItem value="default">Default Confetti</SelectItem>
                                <SelectItem value="fireworks">Fireworks</SelectItem>
                                <SelectItem value="sparkles">Sparkles</SelectItem>
                                <SelectItem value="custom">Custom Upload</SelectItem>
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
                                    const url = await uploadConfetti(file, 'increment');
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
                        <FormLabel className="text-zinc-100">Decrement Animation</FormLabel>
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
                                <SelectItem value="default">Default Effect</SelectItem>
                                <SelectItem value="rain">Rain Effect</SelectItem>
                                <SelectItem value="fade">Fade Effect</SelectItem>
                                <SelectItem value="custom">Custom Upload</SelectItem>
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
                                    const url = await uploadConfetti(file, 'decrement');
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
                        <FormLabel className="text-zinc-100">Reset Animation</FormLabel>
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
                                <SelectItem value="default">Default Reset</SelectItem>
                                <SelectItem value="sweep">Sweep Effect</SelectItem>
                                <SelectItem value="burst">Burst Effect</SelectItem>
                                <SelectItem value="custom">Custom Upload</SelectItem>
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
                                    const url = await uploadConfetti(file, 'reset');
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
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
