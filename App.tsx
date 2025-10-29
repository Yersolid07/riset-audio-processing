import React, { useState, useCallback } from 'react';
import { AppStep, Demographics, Gender } from './types';
import WelcomeStep from './components/WelcomeStep';
import InfoStep from './components/InfoStep';
import RecordingStep from './components/RecordingStep';
import ThankYouStep from './components/ThankYouStep';
import { RECORDING_PHRASES } from './constants';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.Welcome);
  const [demographics, setDemographics] = useState<Demographics | null>(null);
  const [phraseIndex, setPhraseIndex] = useState(0);

  const handleStart = useCallback(() => {
    setCurrentStep(AppStep.Info);
  }, []);

  const handleInfoSubmit = useCallback((data: Demographics) => {
    setDemographics(data);
    setCurrentStep(AppStep.Recording);
  }, []);

  const handleRecordingSubmit = useCallback((audioBlob: Blob) => {
    if (!demographics) return;

    // In a real application, you would upload the blob and demographics data to a server.
    // For this demo, we'll just download it locally.
    const filename = `${demographics.name}_${demographics.age}_${demographics.gender}_phrase${phraseIndex + 1}.wav`;
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    
    if (phraseIndex < RECORDING_PHRASES.length - 1) {
      setPhraseIndex(prev => prev + 1);
    } else {
      setCurrentStep(AppStep.ThankYou);
    }
  }, [demographics, phraseIndex]);
  
  const handleStartOver = useCallback(() => {
    setCurrentStep(AppStep.Welcome);
    setDemographics(null);
    setPhraseIndex(0);
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case AppStep.Welcome:
        return <WelcomeStep onStart={handleStart} />;
      case AppStep.Info:
        return <InfoStep onSubmit={handleInfoSubmit} />;
      case AppStep.Recording:
        return <RecordingStep 
                  phrase={RECORDING_PHRASES[phraseIndex]} 
                  phraseNumber={phraseIndex + 1}
                  totalPhrases={RECORDING_PHRASES.length}
                  onSubmit={handleRecordingSubmit}
                  demographics={demographics}
               />;
      case AppStep.ThankYou:
        return <ThankYouStep onStartOver={handleStartOver} />;
      default:
        return <WelcomeStep onStart={handleStart} />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-slate-800 p-4">
      <div className="w-full max-w-2xl mx-auto">
        {renderStep()}
      </div>
    </div>
  );
};

export default App;