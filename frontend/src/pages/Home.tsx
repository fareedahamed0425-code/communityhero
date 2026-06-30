
import { Camera, Map as MapIcon, ShieldAlert, ArrowRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const isAdmin = user?.email === 'admin@gmail.com';

  return (
    <div className="flex flex-col items-center justify-center w-full pb-20 pt-10">
      
      {/* Hero Section */}
      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center min-h-[60vh] rounded-[3rem] overflow-hidden bg-surface-container-lowest border border-surface-container-low shadow-sm mb-16">
        
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center">
          <div className="w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_var(--color-surface-container),_var(--color-background))] opacity-70 rounded-full blur-3xl transform -translate-y-1/4"></div>
        </div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-container/30 text-primary font-label font-bold text-sm mb-8 border border-primary/20 shadow-sm animate-fade-in-up">
            <Activity className="h-4 w-4" />
            <span>Empowering Your Neighborhood</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-headline font-extrabold text-on-surface tracking-tight leading-tight mb-6">
            Report. Verify. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-fixed-dim">
              Resolve Together.
            </span>
          </h1>
          
          <p className="mt-4 text-lg sm:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed mb-10 font-body">
            Join your community in identifying and resolving civic issues quickly and transparently. A modern platform for modern citizens.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/report" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-on-primary font-label font-bold text-base px-8 py-4 rounded-2xl hover:bg-surface-tint hover:-translate-y-1 hover:shadow-lg transition-all duration-300 active:scale-95"
            >
              Report an Issue
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              to={isAdmin ? "/admin" : "/dashboard"} 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-surface-container-low text-on-surface font-label font-bold text-base px-8 py-4 rounded-2xl hover:bg-surface-container hover:-translate-y-1 hover:shadow-md transition-all duration-300 border border-outline-variant/30 active:scale-95"
            >
              {isAdmin ? "Admin Panel" : "Dashboard"}
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-headline font-extrabold text-on-surface mb-4">How it works</h2>
          <p className="text-on-surface-variant font-body">Three simple steps to a better community.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative z-10">
          
          <div className="group bg-surface-container-lowest rounded-[2rem] shadow-sm hover:shadow-xl p-8 border border-surface-container-low transition-all duration-500 hover:-translate-y-2 flex flex-col items-start relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="bg-primary-container p-4 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-primary/20">
              <Camera className="h-8 w-8 text-on-primary-container" />
            </div>
            <h3 className="text-2xl font-headline font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">Snap a Photo</h3>
            <p className="text-on-surface-variant font-body leading-relaxed mb-8 flex-1">
              See a pothole, broken streetlight, or leak? Just take a picture. Our AI categorizes and routes it automatically.
            </p>
            <Link to="/report" className="mt-auto inline-flex items-center gap-2 font-label font-bold text-primary group-hover:gap-3 transition-all">
              Start Reporting <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="group bg-surface-container-lowest rounded-[2rem] shadow-sm hover:shadow-xl p-8 border border-surface-container-low transition-all duration-500 hover:-translate-y-2 flex flex-col items-start relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-[100px] -z-10 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="bg-secondary-container p-4 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-secondary/20">
              <MapIcon className="h-8 w-8 text-on-secondary-container" />
            </div>
            <h3 className="text-2xl font-headline font-bold text-on-surface mb-3 group-hover:text-secondary transition-colors">View Map</h3>
            <p className="text-on-surface-variant font-body leading-relaxed mb-8 flex-1">
              Check existing issues in your ward on an interactive map. Verify them to raise their priority for the municipality.
            </p>
            <Link to="/map" className="mt-auto inline-flex items-center gap-2 font-label font-bold text-secondary group-hover:gap-3 transition-all outline-none">
              Explore Map <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="group bg-surface-container-lowest rounded-[2rem] shadow-sm hover:shadow-xl p-8 border border-surface-container-low transition-all duration-500 hover:-translate-y-2 flex flex-col items-start relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-error/5 rounded-bl-[100px] -z-10 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="bg-error-container p-4 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-error/20">
              <ShieldAlert className="h-8 w-8 text-on-error-container" />
            </div>
            <h3 className="text-2xl font-headline font-bold text-on-surface mb-3 group-hover:text-error transition-colors">Track Progress</h3>
            <p className="text-on-surface-variant font-body leading-relaxed mb-8 flex-1">
              Follow the status from report to resolution with full transparency. Hold your local representatives accountable.
            </p>
            <Link to={isAdmin ? "/admin" : "/dashboard"} className="mt-auto inline-flex items-center gap-2 font-label font-bold text-error group-hover:gap-3 transition-all">
              {isAdmin ? "Admin Panel" : "Dashboard"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
