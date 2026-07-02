import React from 'react';
import { AlertCircle, ThumbsUp } from 'lucide-react';
import { upvoteIssue } from '../../services/issueService';
import { useNavigate } from 'react-router-dom';

interface DuplicateCheckStepProps {
  duplicates: any[];
  onContinue: () => void;
  onBack: () => void;
}

const DuplicateCheckStep: React.FC<DuplicateCheckStepProps> = ({ duplicates, onContinue, onBack }) => {
  const navigate = useNavigate();
  const topDuplicate = duplicates[0];

  const handleSupport = async () => {
    try {
      await upvoteIssue(topDuplicate.issue_id || topDuplicate.id);
      alert('Thanks for supporting this issue! Your upvote has been counted.');
      navigate('/admin');
    } catch (e) {
      alert('Failed to support issue. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto w-full animate-fade-in-up">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-headline font-bold text-gray-900 mb-2">Similar Issue Found</h2>
        <p className="text-gray-500 font-body">Someone else may have already reported this.</p>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3 mb-3">
          <AlertCircle className="h-6 w-6 text-orange-500 shrink-0" />
          <div>
            <h3 className="font-bold text-gray-900">{topDuplicate.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{topDuplicate.description || "No description provided."}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="px-2 py-1 bg-white rounded text-xs font-semibold text-gray-700 border border-gray-200">
                {topDuplicate.status}
              </span>
              <span className="text-xs text-gray-500">Reported nearby</span>
            </div>
          </div>
        </div>
        
        {topDuplicate.image_url && (
          <div className="mt-3 rounded-lg overflow-hidden h-32 w-full">
            <img src={topDuplicate.image_url} alt="Duplicate issue" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="space-y-3 font-body">
        <button 
          onClick={handleSupport}
          className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium flex justify-center items-center gap-2 shadow-sm"
        >
          <ThumbsUp className="h-5 w-5" />
          Yes, this is the same issue (Support it)
        </button>
        
        <button 
          onClick={onContinue}
          className="w-full py-3 px-4 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          No, this is a different issue
        </button>
      </div>
      
      <div className="mt-4 flex justify-center">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">
          Go back to location picker
        </button>
      </div>
    </div>
  );
};

export default DuplicateCheckStep;
