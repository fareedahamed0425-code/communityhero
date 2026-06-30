import React from 'react';
import { Phone, X, ShieldAlert, Heart, Siren, Baby, UserCircle, Laptop, Scale, ShoppingBag } from 'lucide-react';

interface HelplineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelplineModal: React.FC<HelplineModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const helplines = [
    { name: 'National Emergency', number: '112', icon: Siren, color: 'text-error', bg: 'bg-error-container' },
    { name: 'Police', number: '100', icon: ShieldAlert, color: 'text-primary', bg: 'bg-primary-container' },
    { name: 'Fire', number: '101', icon: Siren, color: 'text-error', bg: 'bg-error-container' },
    { name: 'Ambulance', number: '102', icon: Heart, color: 'text-tertiary', bg: 'bg-tertiary-container' },
    { name: 'Women Helpline', number: '1091', icon: UserCircle, color: 'text-secondary', bg: 'bg-secondary-container' },
    { name: 'Child Helpline', number: '1098', icon: Baby, color: 'text-primary', bg: 'bg-primary-container' },
    { name: 'Senior Citizen', number: '14567', icon: UserCircle, color: 'text-tertiary', bg: 'bg-tertiary-container' },
    { name: 'Cyber Crime', number: '1930', icon: Laptop, color: 'text-secondary', bg: 'bg-secondary-container' },
    { name: 'Anti-Corruption', number: '1064', icon: Scale, color: 'text-error', bg: 'bg-error-container' },
    { name: 'Consumer Helpline', number: '1915', icon: ShoppingBag, color: 'text-primary', bg: 'bg-primary-container' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="absolute inset-0 bg-scrim/40 backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      
      <div className="relative bg-surface-container-lowest border border-surface-container w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-surface-container-low/50 border-b border-surface-container">
          <div className="flex items-center gap-3">
            <div className="bg-primary-container p-2 rounded-xl text-on-primary-container">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-headline font-bold text-on-surface">Indian Helplines</h2>
              <p className="text-sm font-body text-on-surface-variant">Emergency complaint numbers</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container-highest text-on-surface-variant transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-3">
          {helplines.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index}
                className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-low hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-label font-bold text-on-surface">{item.name}</span>
                </div>
                <a 
                  href={`tel:${item.number}`}
                  className="px-4 py-2 bg-surface-container-low hover:bg-surface-container-highest text-on-surface font-label font-bold rounded-xl transition-colors active:scale-95"
                >
                  {item.number}
                </a>
              </div>
            );
          })}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-surface-container-low/50 border-t border-surface-container text-center">
          <p className="text-xs font-body text-on-surface-variant">
            Tap a number to call immediately from your device.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelplineModal;
