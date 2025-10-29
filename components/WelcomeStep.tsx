
import React from 'react';

interface WelcomeStepProps {
  onStart: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onStart }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center border border-gray-700">
      <h1 className="text-4xl font-bold text-cyan-400 mb-4">Selamat Datang di Proyek Riset Suara</h1>
      <p className="text-gray-300 mb-8 max-w-lg mx-auto">
        Terima kasih telah berpartisipasi. Kami sedang mengumpulkan sampel suara untuk melatih model AI dalam memahami ucapan bahasa Indonesia dan mengenali pembicara. Partisipasi Anda sangat berharga untuk kemajuan teknologi ini.
      </p>
      <button
        onClick={onStart}
        className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg shadow-cyan-500/30 transform hover:scale-105"
      >
        Mulai Partisipasi
      </button>
    </div>
  );
};

export default WelcomeStep;
