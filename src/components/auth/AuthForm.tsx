
import { useState } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const authFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useSupabaseAuth();
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof authFormSchema>>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = async (values: z.infer<typeof authFormSchema>) => {
    setIsLoading(true);
    try {
      if (mode === 'login') {
        await signIn({
          email: values.email,
          password: values.password,
        });
        navigate('/home');
      } else {
        await signUp({
          email: values.email,
          password: values.password,
        });
        // On signup, we don't navigate as they should verify their email
      }
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">
          {mode === 'login' ? 'Sign In' : 'Create an Account'}
        </CardTitle>
        <CardDescription>
          {mode === 'login' 
            ? 'Enter your credentials to access your account' 
            : 'Enter your details to create a new account'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="your@email.com" 
                      autoComplete="email"
                      className="bg-zinc-800 border-zinc-700"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      className="bg-zinc-800 border-zinc-700"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full mt-6 bg-accent hover:bg-accent/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-zinc-800 pt-4">
        <p className="text-sm text-zinc-400">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <Button 
            variant="link" 
            onClick={() => navigate(mode === 'login' ? '/register' : '/login')}
            className="p-0 h-auto text-accent hover:text-accent/90"
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
