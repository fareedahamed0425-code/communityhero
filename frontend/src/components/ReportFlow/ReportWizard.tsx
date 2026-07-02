import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageCapture from './ImageCapture';
import LocationPicker from './LocationPicker';
import IssueDetails from './IssueDetails';
import DuplicateCheckStep from './DuplicateCheckStep';
import { createIssue, checkDuplicate, type IssueData } from '../../services/issueService';
import { analyzeIssueImage, type AISuggestion } from '../../services/aiService';

const ReportWizard = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Collected Data
  const [imageUrl, setImageUrl] = useState<string>('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

  const handleImageCaptured = (url: string) => {
    setImageUrl(url);
    setStep(2);
    
    // Trigger AI analysis in the background
    if (url.startsWith('data:image')) {
      setIsAiLoading(true);
      analyzeIssueImage(url).then(suggestion => {
        if (suggestion) setAiSuggestion(suggestion);
        setIsAiLoading(false);
      });
    }
  };

  const handleLocationConfirmed = async (lat: number, lng: number) => {
    setLocation({ lat, lng });
    
    // Check for duplicates
    setIsCheckingDuplicates(true);
    // If AI suggestion is ready, use its issue_type, else default to pothole for checking
    const issueType = aiSuggestion ? aiSuggestion.issue_type : 'pothole';
    const foundDuplicates = await checkDuplicate(lat, lng, issueType);
    setIsCheckingDuplicates(false);
    
    if (foundDuplicates && foundDuplicates.length > 0) {
      setDuplicates(foundDuplicates);
      setStep(3); // Duplicate Check step
    } else {
      setStep(4); // Issue Details step
    }
  };

  const handleSubmit = async (details: {title: string, description: string, issue_type: string, severity: string}) => {
    setIsSubmitting(true);
    
    const issueData: IssueData = {
      ...details,
      image_url: imageUrl,
      latitude: location?.lat || null,
      longitude: location?.lng || null,
      status: 'reported'
    };

    try {
      await createIssue(issueData);
      alert('Issue reported successfully!');
      navigate('/admin'); // Redirect to admin panel to see open issues
    } catch (e) {
      alert('Failed to report issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-10 min-h-[50vh] sm:min-h-[60vh] flex flex-col justify-center mx-2 sm:mx-0 relative">
      {isCheckingDuplicates && (
        <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center rounded-2xl">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
           <p className="text-gray-600 font-medium">Checking for similar reports nearby...</p>
        </div>
      )}

      {step === 1 && <ImageCapture onNext={handleImageCaptured} />}
      {step === 2 && <LocationPicker onNext={handleLocationConfirmed} onBack={() => setStep(1)} />}
      {step === 3 && (
        <DuplicateCheckStep 
          duplicates={duplicates} 
          onContinue={() => setStep(4)} 
          onBack={() => setStep(2)} 
        />
      )}
      {step === 4 && (
        <IssueDetails 
          onSubmit={handleSubmit} 
          onBack={() => setStep(duplicates.length > 0 ? 3 : 2)} 
          isSubmitting={isSubmitting} 
          aiSuggestion={aiSuggestion}
          isAiLoading={isAiLoading}
        />
      )}
      
      <div className="mt-8 flex justify-center gap-2">
        <div className={`h-2 w-12 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-gray-200'}`} />
        <div className={`h-2 w-12 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
        <div className={`h-2 w-12 rounded-full ${step >= 3 && step !== 4 ? 'bg-orange-400' : step >= 4 ? 'bg-primary' : 'bg-gray-200'}`} />
      </div>
    </div>
  );
};

export default ReportWizard;
