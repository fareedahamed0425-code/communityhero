import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { type AISuggestion } from '../../services/aiService';

interface Props {
  onSubmit: (details: { title: string; description: string; issue_type: string; severity: string }) => void;
  onBack: () => void;
  isSubmitting: boolean;
  aiSuggestion: AISuggestion | null;
  isAiLoading: boolean;
}

const IssueDetails: React.FC<Props> = ({ onSubmit, onBack, isSubmitting, aiSuggestion, isAiLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    issue_type: 'pothole',
    severity: 'medium',
  });
  
  const [autoFilled, setAutoFilled] = useState(false);

  // Apply AI suggestion when it arrives
  useEffect(() => {
    if (aiSuggestion && !autoFilled) {
      setFormData({
        title: aiSuggestion.title,
        description: aiSuggestion.description,
        issue_type: aiSuggestion.issue_type.toLowerCase(),
        severity: aiSuggestion.severity.toLowerCase(),
      });
      setAutoFilled(true);
    }
  }, [aiSuggestion, autoFilled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-md mx-auto w-full animate-fade-in-up">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-headline font-bold text-gray-900 mb-2">Issue Details</h2>
        <p className="text-gray-500 font-body">Review and confirm the details.</p>
      </div>

      {isAiLoading && !autoFilled && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex flex-col items-center justify-center text-center animate-pulse">
          <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
          <p className="text-sm font-label font-bold text-primary">Gemini AI is analyzing your photo...</p>
        </div>
      )}

      {autoFilled && (
        <div className="bg-tertiary-container/30 border border-tertiary/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-tertiary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-label font-bold text-on-surface">Auto-filled by Gemini AI</p>
            <p className="text-xs font-body text-on-surface-variant mt-1">We've categorized the issue based on your photo. You can edit the details below if needed.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 font-body">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            required
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            placeholder="E.g., Large pothole on main road"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            value={formData.issue_type}
            onChange={(e) => setFormData({...formData, issue_type: e.target.value})}
          >
            <option value="pothole">Pothole</option>
            <option value="water_leakage">Water Leakage</option>
            <option value="garbage">Garbage Overflow</option>
            <option value="streetlight">Broken Streetlight</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            value={formData.severity}
            onChange={(e) => setFormData({...formData, severity: e.target.value})}
          >
            <option value="low">Low (Cosmetic/Minor)</option>
            <option value="medium">Medium (Annoyance)</option>
            <option value="high">High (Property risk)</option>
            <option value="critical">Critical (Safety hazard)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            rows={3}
            placeholder="Add any additional context..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="button"
            onClick={onBack}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Back
          </button>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium disabled:opacity-70 flex justify-center items-center"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IssueDetails;
