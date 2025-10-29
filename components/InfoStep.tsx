
import React, { useState } from 'react';
import { Demographics, Gender } from '../types';

interface InfoStepProps {
  onSubmit: (data: Demographics) => void;
}

const InfoStep: React.FC<InfoStepProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age || !gender) {
      setError('Harap isi semua kolom.');
      return;
    }
    if (age <= 0) {
      setError('Umur harus lebih dari 0.');
      return;
    }
    setError('');
    onSubmit({ name, age: Number(age), gender });
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700">
      <h2 className="text-3xl font-bold text-cyan-400 mb-6 text-center">Informasi Demografis</h2>
      <p className="text-gray-400 mb-8 text-center">Informasi ini akan digunakan secara anonim untuk melabeli data suara.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Nama (Inisial atau Nama Panggilan)</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Contoh: Budi"
          />
        </div>
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-2">Umur</label>
          <input
            type="number"
            id="age"
            value={age}
            onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Contoh: 25"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Jenis Kelamin</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(Object.values(Gender)).map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => setGender(g)}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                  gender === g 
                  ? 'bg-cyan-500 text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-cyan-500' 
                  : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-lg shadow-cyan-500/30 transform hover:scale-105"
          >
            Lanjut ke Perekaman
          </button>
        </div>
      </form>
    </div>
  );
};

export default InfoStep;
