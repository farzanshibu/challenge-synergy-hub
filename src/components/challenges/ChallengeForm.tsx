
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useChallengeStore } from "@/store/challengeStore";
import { formSchema, FormValues } from "@/schema/formSchema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

export default function ChallengeForm() {
  const { loading, addChallenge } = useChallengeStore();
  
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
      await addChallenge(values);
      form.reset();
    } catch (error) {
      console.error("Error adding challenge:", error);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="h-[400px] overflow-y-auto">
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
      </form>
    </Form>
  );
}
