import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageCapture from './ImageCapture';
import LocationPicker from './LocationPicker';
import IssueDetails from './IssueDetails';
import { createIssue, type IssueData } from '../../services/issueService';
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

  const handleLocationConfirmed = (lat: number, lng: number) => {
    setLocation({ lat, lng });
    setStep(3);
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-10 min-h-[50vh] sm:min-h-[60vh] flex flex-col justify-center mx-2 sm:mx-0">
      {step === 1 && <ImageCapture onNext={handleImageCaptured} />}
      {step === 2 && <LocationPicker onNext={handleLocationConfirmed} onBack={() => setStep(1)} />}
      {step === 3 && (
        <IssueDetails 
          onSubmit={handleSubmit} 
          onBack={() => setStep(2)} 
          isSubmitting={isSubmitting} 
          aiSuggestion={aiSuggestion}
          isAiLoading={isAiLoading}
        />
      )}
      
      <div className="mt-8 flex justify-center gap-2">
        <div className={`h-2 w-12 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-gray-200'}`} />
        <div className={`h-2 w-12 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
        <div className={`h-2 w-12 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`} />
      </div>
    </div>
  );
};

export default ReportWizard;
