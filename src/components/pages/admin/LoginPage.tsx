import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../api/authService';
import { useToast } from '../../ui/Toaster';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import { Hexagon, AlertCircle, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // FIXED: State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const toast = useToast();
  const currentYear = new Date().getFullYear();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await authService.login({ 
        username: formData.username, 
        password: formData.password 
      });
      
     const token = response.data.access || response.data.token || response.data.access_token;
      
      if (token) {
        localStorage.setItem('token', token);
      } else {
        console.warn("Could not find exact token key in response:", response.data);
        localStorage.setItem('token', JSON.stringify(response.data)); 
      }
      
      // FIXED: Grab userType from the nested 'user' object shown in your network tab
      if (response.data.user && response.data.user.userType) {
        localStorage.setItem('userType', response.data.user.userType);
      }

      toast.success("Welcome back, Admin");
      navigate('/admin');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FCFBF9] relative overflow-hidden transition-colors duration-300">
      
      {/* FIXED: Removed 'animate-pulse' to stop the breathing gradient effect */}
      <div
        className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-green rounded-full mix-blend-multiply filter blur-[100px] opacity-20"
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-green rounded-full mix-blend-multiply filter blur-[100px] opacity-20"
      />

      <div className="w-full max-w-md p-8 bg-white rounded-[2.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.08)] border border-gray-100 z-10 relative mx-4">
        
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green shadow-sm">
               <Hexagon size={32} fill="currentColor" strokeWidth={2.5} />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 relative z-10 tracking-tight">
            Admin Login
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Enter your credentials to access your account
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          
          {errorMessage && (
            <div className="flex items-start p-4 text-sm bg-red-50 border border-red-200 rounded-xl animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-red-800">
                  Login Failed
                </h3>
                <p className="mt-1 text-red-700">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Username"
              type="text"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />

            <div>
              {/* FIXED: Wrapped the strict Input component to add the absolute eye button over it */}
              <div className="relative w-full">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-green transition-colors z-20 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  className="text-xs font-bold text-brand-green hover:underline transition-colors focus:outline-none"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            fullWidth
            className="py-3 text-base font-semibold transition-all duration-200 shadow-[0_8px_20px_-6px_rgba(74,222,128,0.5)]"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 font-medium uppercase">
            © {currentYear} Admin Portal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;