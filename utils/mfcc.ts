// A collection of functions to perform MFCC extraction.
// This is a simplified implementation for demonstration purposes.

// Helper to convert from frequency to Mel scale
const freqToMel = (freq: number): number => 1127 * Math.log(1 + freq / 700);

// Helper to convert from Mel scale to frequency
const melToFreq = (mel: number): number => 700 * (Math.exp(mel / 1127) - 1);

// Basic resampling function (nearest neighbor)
const resample = (audioData: Float32Array, inputSampleRate: number, outputSampleRate: number): Float32Array => {
    if (inputSampleRate === outputSampleRate) {
        return audioData;
    }
    const ratio = inputSampleRate / outputSampleRate;
    const newLength = Math.round(audioData.length / ratio);
    const result = new Float32Array(newLength);
    for (let i = 0; i < newLength; i++) {
        result[i] = audioData[Math.floor(i * ratio)];
    }
    return result;
};


// Fast Fourier Transform (FFT) implementation
// Using a basic Cooley-Tukey Radix-2 FFT with zero-padding
const fft = (input: Float32Array): [Float32Array, Float32Array] => {
    let n = input.length;
    // Check if n is a power of 2, if not, pad with zeros
    if ((n & (n - 1)) !== 0) {
        const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(n)));
        const paddedInput = new Float32Array(nextPowerOf2);
        paddedInput.set(input);
        input = paddedInput;
        n = nextPowerOf2;
    }

    if (n === 1) {
        return [new Float32Array([input[0]]), new Float32Array([0])];
    }

    const evens = new Float32Array(n / 2);
    const odds = new Float32Array(n / 2);
    for (let i = 0; i < n / 2; i++) {
        evens[i] = input[2 * i];
        odds[i] = input[2 * i + 1];
    }

    const [evenReal, evenImag] = fft(evens);
    const [oddReal, oddImag] = fft(odds);

    const real = new Float32Array(n);
    const imag = new Float32Array(n);

    for (let k = 0; k < n / 2; k++) {
        const angle = -2 * Math.PI * k / n;
        const tReal = Math.cos(angle) * oddReal[k] - Math.sin(angle) * oddImag[k];
        const tImag = Math.cos(angle) * oddImag[k] + Math.sin(angle) * oddReal[k];

        real[k] = evenReal[k] + tReal;
        imag[k] = evenImag[k] + tImag;
        real[k + n / 2] = evenReal[k] - tReal;
        imag[k + n / 2] = evenImag[k] - tImag;
    }
    return [real, imag];
};

// Discrete Cosine Transform (DCT)
const dct = (input: Float32Array, numCoeffs: number): Float32Array => {
    const N = input.length;
    const output = new Float32Array(numCoeffs);
    for (let k = 0; k < numCoeffs; k++) {
        let sum = 0;
        for (let n = 0; n < N; n++) {
            sum += input[n] * Math.cos(Math.PI * (n + 0.5) * k / N);
        }
        output[k] = sum;
    }
    return output;
};


export const extractMFCC = (
    audioBuffer: AudioBuffer,
    options: {
        numCoeffs?: number;
        numMelFilters?: number;
        fftSize?: number;
        hopSize?: number;
        targetSampleRate?: number;
    } = {}
): number[][] => {
    const {
        numCoeffs = 13,
        numMelFilters = 26,
        fftSize = 512,
        hopSize = 160, // 10ms for 16kHz
        targetSampleRate = 16000,
    } = options;

    const pcmData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;

    const resampledData = resample(pcmData, sampleRate, targetSampleRate);

    // Create Mel filterbank
    const lowMel = freqToMel(0);
    const highMel = freqToMel(targetSampleRate / 2);
    const melPoints = new Float32Array(numMelFilters + 2);
    for (let i = 0; i < melPoints.length; i++) {
        melPoints[i] = lowMel + i * (highMel - lowMel) / (numMelFilters + 1);
    }
    const freqPoints = melPoints.map(melToFreq);
    const binPoints = freqPoints.map(f => Math.floor((fftSize + 1) * f / targetSampleRate));

    const mfccs: number[][] = [];

    // Framing and processing
    for (let i = 0; i + fftSize <= resampledData.length; i += hopSize) {
        const frame = resampledData.slice(i, i + fftSize);

        // Apply Hamming window
        for (let j = 0; j < frame.length; j++) {
            frame[j] *= 0.54 - 0.46 * Math.cos(2 * Math.PI * j / (fftSize - 1));
        }

        const [real, imag] = fft(frame);
        const powerSpectrum = new Float32Array(fftSize / 2 + 1);
        for(let k = 0; k < powerSpectrum.length; k++) {
            powerSpectrum[k] = (real[k] * real[k] + imag[k] * imag[k]) / fftSize;
        }

        // Apply Mel filterbank
        const melEnergies = new Float32Array(numMelFilters);
        for (let m = 1; m <= numMelFilters; m++) {
            let sum = 0;
            const startBin = binPoints[m - 1];
            const centerBin = binPoints[m];
            const endBin = binPoints[m + 1];

            for (let k = startBin; k <= centerBin; k++) {
                const weight = (k - startBin) / (centerBin - startBin || 1);
                sum += powerSpectrum[k] * weight;
            }

            for (let k = centerBin + 1; k <= endBin; k++) {
                const weight = (endBin - k) / (endBin - centerBin || 1);
                sum += powerSpectrum[k] * weight;
            }
            melEnergies[m-1] = sum;
        }

        // Log and DCT
        const logMelEnergies = melEnergies.map(e => e > 0 ? Math.log(e) : 1e-12);
        const frameMfccs = dct(logMelEnergies, numCoeffs);
        mfccs.push(Array.from(frameMfccs));
    }

    return mfccs;
};
