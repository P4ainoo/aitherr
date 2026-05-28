import React, { useState, useRef } from 'react';
import { CameraIcon, SparklesIcon, ArrowPathIcon, VideoCameraIcon } from './icons/Icons';
import { analyzeAndReconstruct, generateHistoricalImage, generateHistoricalVideo } from '../services/geminiService';
import { AitherLogo } from './AitherLogo';

const TimeTravel: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [result, setResult] = useState<{
    placeName: string;
    description: string;
    historicalEra: string;
    generatedImage: string;
    videoPrompt: string;
    generatedVideo?: string;
  } | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String);
        setResult(null);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError('');

    try {
      // Step 1: Analyze the image to get place details and prompt
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = selectedImage.split(',')[1];
      const analysis = await analyzeAndReconstruct(base64Data);

      setIsAnalyzing(false);
      setIsGenerating(true);

      // Step 2: Generate the historical image
      const generatedImageBase64 = await generateHistoricalImage(analysis.imagePrompt);

      setResult({
        placeName: analysis.placeName,
        description: analysis.description,
        historicalEra: analysis.historicalEra,
        generatedImage: generatedImageBase64,
        videoPrompt: analysis.videoPrompt,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to process the image. Please try again.");
    } finally {
      setIsAnalyzing(false);
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!result?.videoPrompt) return;

    setIsGeneratingVideo(true);
    setError('');

    try {
      const videoUrl = await generateHistoricalVideo(result.videoPrompt);
      setResult(prev => prev ? { ...prev, generatedVideo: videoUrl } : null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate video. Please try again.");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 md:py-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        ref={fileInputRef}
      />

      {!selectedImage ? (
        /* Setup matching the exact responsive mobile design mockup */
        <div className="space-y-6 flex flex-col items-center">
          {/* Hero Section */}
          <div className="text-center flex flex-col items-center max-w-lg mb-2">
            <AitherLogo className="w-24 h-24 mb-4" />
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight flex items-center justify-center gap-2">
              <AitherLogo className="w-8 h-8 inline-block animate-[spin_40s_linear_infinite]" />
              Time Travel
            </h2>
            <p className="text-white/70 font-light text-sm md:text-base leading-relaxed max-w-sm">
              Upload a photo of a landmark to see how it looked in its prime. Experience history through AI reconstruction.
            </p>
          </div>

          {/* Card 1: Sleek glassmorphic card containing "Ready to travel back in time?" */}
          <div className="w-full bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 p-6 flex items-center gap-5 shadow-2xl">
            <div className="w-16 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
              <AitherLogo className="w-10 h-10" />
            </div>
            <div className="text-left">
              <h4 className="text-white font-bold text-base leading-tight">Ready to travel back in time?</h4>
              <p className="text-white/50 text-xs mt-1 leading-normal">Upload a photo to see the magic happen.</p>
            </div>
          </div>

          {/* Card 2: Upload Zone Card with dashed border */}
          <div className="w-full">
            <div 
              onClick={triggerFileInput}
              className="w-full bg-white/5 backdrop-blur-xl border-2 border-dashed border-white/15 hover:border-white/35 rounded-[2rem] p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all select-none group min-h-[200px]"
            >
              <CameraIcon className="w-12 h-12 text-white/40 mb-3 group-hover:text-[#FFCC00] group-hover:scale-105 transition-all" />
              <p className="text-white/80 font-bold text-base text-center">Click to upload or take a photo</p>
              <p className="text-white/40 text-xs mt-1.5">Supports JPG, PNG</p>
            </div>
          </div>
          
          {error && (
            <p className="text-red-400 mt-4 text-center bg-red-500/10 py-2.5 px-4 rounded-xl border border-red-500/20 w-full text-xs">
              {error}
            </p>
          )}
        </div>
      ) : (
        /* Split view when an image is uploaded to perform real processing/render results */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          {/* Card left: uploaded image and triggers */}
          <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] shadow-2xl p-6 border border-white/10 flex flex-col justify-between">
            <div>
              <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <CameraIcon className="w-5 h-5 text-[#FFCC00]" />
                Your Selected Photo
              </h4>
              <img 
                src={selectedImage} 
                alt="Uploaded" 
                className="w-full h-64 object-cover rounded-2xl mb-6 shadow-lg border border-white/10"
              />
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={triggerFileInput}
                className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all border border-white/10 text-sm"
              >
                Change Photo
              </button>
              <button 
                onClick={handleProcessImage}
                disabled={isAnalyzing || isGenerating || isGeneratingVideo}
                className="w-full py-3.5 px-4 rounded-xl bg-[#FFCC00] hover:bg-yellow-400 text-black font-extrabold transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
              >
                {isAnalyzing ? 'Analyzing...' : isGenerating ? 'Reconstructing...' : 'Travel in Time'}
                {!isAnalyzing && !isGenerating && <SparklesIcon className="w-4 h-4 ml-2" />}
              </button>
            </div>

            {error && (
              <p className="text-red-400 mt-4 text-center bg-red-500/10 py-2 px-4 rounded-lg border border-red-500/20 w-full text-xs">
                {error}
              </p>
            )}
          </div>

          {/* Card right: reconstructed output past photo */}
          <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] shadow-2xl p-6 border border-white/10 flex flex-col justify-center min-h-[300px]">
            {(isAnalyzing || isGenerating) ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-[#FFCC00] border-t-transparent rounded-full animate-spin"></div>
                  <AitherLogo className="absolute inset-0 m-auto w-12 h-12" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {isAnalyzing ? 'Identifying Place...' : 'Reconstructing History...'}
                  </h3>
                  <p className="text-white/60 text-xs">
                    {isAnalyzing 
                      ? 'Our AI is analyzing architectural details...' 
                      : 'Generating a photorealistic view of the past...'}
                  </p>
                </div>
              </div>
            ) : result ? (
              <div className="flex flex-col h-full animate-in fade-in duration-700">
                <div className="relative group mb-4">
                  <img 
                    src={result.generatedImage} 
                    alt={`Historical view of ${result.placeName}`} 
                    className="w-full h-60 object-cover rounded-2xl shadow-lg border border-white/10 transition-transform duration-500 group-hover:scale-[1.01]"
                  />
                  <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <span className="text-[#FFCC00] text-[10px] font-black uppercase tracking-widest">
                      {result.historicalEra}
                    </span>
                  </div>
                </div>
                
                <div className="flex-grow">
                  <h3 className="text-xl font-extrabold text-white mb-1.5">{result.placeName}</h3>
                  <div className="h-0.5 w-12 bg-[#FFCC00] rounded-full mb-3"></div>
                  <p className="text-white/70 leading-relaxed font-light text-xs md:text-sm mb-4">
                    {result.description}
                  </p>

                  {/* Video Generation Section */}
                  {result.generatedVideo ? (
                    <div className="mt-3">
                      <h4 className="text-sm font-bold text-white mb-2 flex items-center">
                        <VideoCameraIcon className="w-4 h-4 mr-1.5 text-[#FFCC00]" />
                        Historical Footage
                      </h4>
                      <video 
                        src={result.generatedVideo} 
                        controls 
                        autoPlay 
                        loop 
                        className="w-full rounded-xl border border-white/10 shadow-lg"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={handleGenerateVideo}
                      disabled={isGeneratingVideo}
                      className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all border border-white/10 flex items-center justify-center group"
                    >
                      {isGeneratingVideo ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2"></div>
                          Generating Video...
                        </>
                      ) : (
                        <>
                          <VideoCameraIcon className="w-4 h-4 mr-1.5 text-[#FFCC00] group-hover:scale-115 transition-transform" />
                          Generate Historical Video
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-40 py-12">
                <ArrowPathIcon className="w-16 h-16 mb-3 text-white" />
                <p className="text-lg font-bold text-white">Reconstruction space</p>
                <p className="text-xs text-white/80 max-w-xs mt-1.5 mx-auto">Click "Travel in Time" on the left model cards to reconstruct past glory state.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTravel;
