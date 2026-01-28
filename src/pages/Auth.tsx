import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';
import { Truck, Users } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  location: z.string().min(2, 'Location must be at least 2 characters')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type UserType = 'renter' | 'host';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("login");
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [userType, setUserType] = useState<UserType>('host');
  const [resetEmail, setResetEmail] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Check for renter flow and mode from URL params
  useEffect(() => {
    const type = searchParams.get('type');
    const mode = searchParams.get('mode');

    if (type === 'renter') {
      setUserType('renter');
      setActiveTab('register'); // Auto-switch to register for new renters
    }

    const email = searchParams.get('email');
    const name = searchParams.get('name');

    if (email) setRegisterEmail(decodeURIComponent(email));
    if (name) setBusinessName(decodeURIComponent(name));

    if (mode === 'register') {
      setActiveTab('register');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      loginSchema.parse({ email: loginEmail, password: loginPassword });
      setLoading(true);

      const { error } = await signIn(loginEmail, loginPassword);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please confirm your email before logging in');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Logged in successfully');
        const returnUrl = searchParams.get('returnUrl');
        navigate(returnUrl ? decodeURIComponent(returnUrl) : '/dashboard');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      registerSchema.parse({
        email: registerEmail,
        password: registerPassword,
        confirmPassword,
        businessName,
        location
      });

      setLoading(true);

      // Capture signup source from URL
      const signupSource = searchParams.get('utm_source') || searchParams.get('ref') || 'direct';

      const { error } = await signUp(registerEmail, registerPassword, businessName, location, userType, signupSource);

      if (error) {
        if (error.message.includes('User already registered')) {
          toast.error('An account with this email already exists');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Account created successfully!');

        // Attempt auto-login
        const { error: loginError } = await signIn(registerEmail, registerPassword);

        if (loginError) {
          // If auto-login fails (likely due to email confirmation needed), switch to login tab
          toast.info('Please log in with your new credentials.');
          setLoginEmail(registerEmail);
          setLoginPassword(registerPassword);
          setActiveTab('login');
        } else {
          const returnUrl = searchParams.get('returnUrl');
          navigate(returnUrl ? decodeURIComponent(returnUrl) : '/dashboard');
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      z.string().email().parse(resetEmail);
      setLoading(true);

      const { error } = await resetPassword(resetEmail);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password reset email sent! Check your inbox.');
        setShowReset(false);
        setResetEmail('');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error('Please enter a valid email address');
      }
    } finally {
      setLoading(false);
    }
  };

  if (showReset) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0A0F1C]">
        {/* Header */}
        <header className="bg-[#0A0F1C] border-b border-white/5">
          <div className="container mx-auto px-4 py-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex flex-col">
                <span className="font-display font-black text-2xl tracking-tighter text-white uppercase italic leading-none relative z-10 group-hover:text-gray-200 transition-colors">
                  PATRIOT HAULS
                </span>
                <div className="h-1.5 w-full bg-red-600 mt-1 -skew-x-12 origin-left transform" />
              </div>
            </Link>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-[#1A1F2C] border-white/10 text-white">
            <CardHeader>
              <CardTitle className="font-display">Reset Password</CardTitle>
              <CardDescription className="text-gray-400">Enter your email to receive a password reset link</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-gray-200">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="bg-[#0A0F1C] border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowReset(false)} className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0F1C]">
      {/* Header */}
      <header className="bg-[#0A0F1C] border-b border-white/5">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex flex-col">
              <span className="font-display font-black text-2xl tracking-tighter text-white uppercase italic leading-none relative z-10 group-hover:text-gray-200 transition-colors">
                PATRIOT HAULS
              </span>
              <div className="h-1.5 w-full bg-red-600 mt-1 -skew-x-12 origin-left transform" />
            </div>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl font-bold text-white uppercase tracking-wide italic">
              {userType === 'host' ? 'Operator Dashboard' : 'Renter Access'}
            </h1>
            <p className="text-gray-400">
              {userType === 'host' ? 'Manage your fleet and operations' : 'Find and rent equipment'}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#1A1F2C] border border-white/10">
              <TabsTrigger value="login" className="data-[state=active]:bg-[#0A0F1C] data-[state=active]:text-white text-gray-400">Login</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-[#0A0F1C] data-[state=active]:text-white text-gray-400">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="bg-[#1A1F2C] border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="font-display">Login</CardTitle>
                  <CardDescription className="text-gray-400">Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-gray-200">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        className="bg-[#0A0F1C] border-white/10 text-white placeholder:text-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-gray-200">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="bg-[#0A0F1C] border-white/10 text-white placeholder:text-gray-500"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Logging in...' : 'Login'}
                    </Button>
                    <Button
                      type="button"
                      variant="link"
                      className="w-full text-gray-400 hover:text-white"
                      onClick={() => setShowReset(true)}
                    >
                      Forgot password?
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="bg-[#1A1F2C] border-white/10 text-white">
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription className="text-gray-400">
                    {userType === 'host'
                      ? 'Register to list your rental business'
                      : 'Create an account to save favorites and track inquiries'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    {/* User Type Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-200">I am a...</Label>
                      <RadioGroup
                        value={userType}
                        onValueChange={(v) => setUserType(v as UserType)}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div>
                          <RadioGroupItem value="host" id="host" className="peer sr-only" />
                          <Label
                            htmlFor="host"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-white/10 bg-[#0A0F1C] p-4 hover:bg-white/5 hover:text-white hover:border-white/20 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-[#0A0F1C] cursor-pointer text-gray-300"
                          >
                            <Truck className="mb-3 h-6 w-6 text-primary" />
                            <span className="font-semibold">Business Owner</span>
                            <span className="text-xs text-gray-500">List my rentals</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="renter" id="renter" className="peer sr-only" />
                          <Label
                            htmlFor="renter"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-white/10 bg-[#0A0F1C] p-4 hover:bg-white/5 hover:text-white hover:border-white/20 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-[#0A0F1C] cursor-pointer text-gray-300"
                          >
                            <Users className="mb-3 h-6 w-6 text-primary" />
                            <span className="font-semibold">Renter</span>
                            <span className="text-xs text-gray-500">Looking to rent</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-gray-200">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                        className="bg-[#0A0F1C] border-white/10 text-white placeholder:text-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business-name" className="text-gray-200">
                        {userType === 'host' ? 'Business Name' : 'Full Name'}
                      </Label>
                      <Input
                        id="business-name"
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        required
                        className="bg-[#0A0F1C] border-white/10 text-white placeholder:text-gray-500"
                        placeholder={userType === 'host' ? "Your entity name" : "Your full name"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-gray-200">Location</Label>
                      <Input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        className="bg-[#0A0F1C] border-white/10 text-white placeholder:text-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-gray-200">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                        className="bg-[#0A0F1C] border-white/10 text-white placeholder:text-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-gray-200">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="bg-[#0A0F1C] border-white/10 text-white placeholder:text-gray-500"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Button variant="outline" className="w-full bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white" onClick={() => navigate('/')}>
            Back to Directory
          </Button>
        </div>
      </div>
    </div>
  );
}
