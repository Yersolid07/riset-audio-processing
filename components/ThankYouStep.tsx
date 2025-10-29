
import React from 'react';

interface ThankYouStepProps {
  onStartOver: () => void;
}

const ThankYouStep: React.FC<ThankYouStepProps> = ({ onStartOver }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center border border-gray-700">
      <h1 className="text-4xl font-bold text-cyan-400 mb-4">Terima Kasih!</h1>
      <p className="text-gray-300 mb-8 max-w-lg mx-auto">
        Anda telah berhasil menyelesaikan sesi perekaman. Kontribusi Anda sangat berarti bagi penelitian kami. Sampel suara Anda akan membantu meningkatkan akurasi teknologi pengenalan suara.
      </p>
      <button
        onClick={onStartOver}
        className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg shadow-cyan-500/30 transform hover:scale-105"
      >
        Kontribusi Lagi
      </button>
    </div>
  );
};

export default ThankYouStep;
