import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // If already logged in, redirect to dashboard
  if (user) {
    navigate('/dashboard');
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setError('');
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name
        });
        
        // Force sync user to postgres immediately to close the loophole of missing user entries
        if (userCredential.user.email) {
          await syncUser(userCredential.user.email, name);
        }
      }
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create an account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setError('');
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      
      if (result.user && result.user.email) {
         await syncUser(result.user.email, result.user.displayName);
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 pt-12 pb-28 relative overflow-hidden min-h-screen bg-background">
      {/* Subtle Background Decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center">
        <div className="w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--color-surface-container),_var(--color-background))] opacity-60 rounded-full blur-3xl transform -translate-y-1/4"></div>
      </div>
      
      {/* Auth Card */}
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-lg border border-surface-container-low p-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-6">
          <h1 className="font-headline text-3xl font-extrabold text-on-surface mb-2 tracking-tight">Join Us</h1>
          <p className="font-body text-sm text-on-surface-variant leading-relaxed">Create an account to become a community hero</p>
        </div>

        {error && (
          <div className="mb-4 bg-error-container text-on-error-container p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
        
        {/* Social Sign In */}
        <button 
          onClick={handleGoogleSignup}
          type="button"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface font-label font-semibold text-sm hover:bg-surface-container-low transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 active:scale-95 disabled:opacity-50"
        >
          <svg height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" fill="#EA4335"></path>
            <path d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" fill="#4285F4"></path>
            <path d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" fill="#FBBC05"></path>
            <path d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" fill="#34A853"></path>
          </svg>
          Sign up with Google
        </button>
        
        {/* Separator */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-outline-variant"></div>
          <span className="mx-4 text-xs font-label text-outline uppercase tracking-wider">or sign up with email</span>
          <div className="flex-grow border-t border-outline-variant"></div>
        </div>
        
        {/* Email/Password Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block font-label text-sm font-medium text-on-surface" htmlFor="name">Full Name</label>
            <input 
              className="block w-full px-3 py-2.5 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface placeholder-outline focus:ring-2 focus:ring-primary focus:border-primary transition-shadow font-body text-sm sm:text-base outline-none" 
              id="name" 
              name="name" 
              placeholder="Jane Doe" 
              required 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block font-label text-sm font-medium text-on-surface" htmlFor="email">Email Address</label>
            <input 
              className="block w-full px-3 py-2.5 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface placeholder-outline focus:ring-2 focus:ring-primary focus:border-primary transition-shadow font-body text-sm sm:text-base outline-none" 
              id="email" 
              name="email" 
              placeholder="name@example.com" 
              required 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block font-label text-sm font-medium text-on-surface" htmlFor="password">Password</label>
            <input 
              className="block w-full px-3 py-2.5 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface placeholder-outline focus:ring-2 focus:ring-primary focus:border-primary transition-shadow font-body text-sm sm:text-base outline-none" 
              id="password" 
              name="password" 
              placeholder="Min. 6 characters" 
              required 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            disabled={isLoading}
            className="w-full flex items-center justify-center py-3 px-4 mt-4 rounded-xl bg-primary text-on-primary font-label font-bold text-base shadow-sm hover:bg-surface-tint hover:shadow transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50" 
            type="submit"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="font-body text-sm text-on-surface-variant">
            Already have an account? 
            <Link className="font-label font-semibold text-primary hover:text-surface-tint transition-colors ml-1" to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
