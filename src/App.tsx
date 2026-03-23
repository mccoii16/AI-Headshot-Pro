/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
// Note: We removed the GoogleGenAI import here because the AI logic moves to the Netlify Function
import { 
  Upload, 
  Camera, 
  Briefcase, 
  Building2, 
  Sun, 
  Palette, 
  User, 
  CheckCircle2, 
  Loader2,
  Download,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STYLES = [
  { 
    id: 'corporate-grey', 
    name: 'Corporate Grey', 
    icon: Briefcase, 
    description: 'Classic professional studio look with a neutral grey backdrop.',
    prompt: 'Professional corporate headshot, suit and blazer, studio grey background, high-end studio lighting, sharp focus.'
  },
  { 
    id: 'tech-office', 
    name: 'Modern Tech Office', 
    icon: Building2, 
    description: 'Modern, approachable look with a blurred tech office background.',
    prompt: 'Professional tech industry headshot, business casual, modern office background with glass and plants, bright natural lighting.'
  },
  { 
    id: 'outdoor-natural', 
    name: 'Outdoor Natural', 
    icon: Sun, 
    description: 'Warm and friendly look with natural outdoor lighting.',
    prompt: 'Professional outdoor headshot, smart casual, blurred park background, natural golden hour lighting, friendly atmosphere.'
  },
  { 
    id: 'creative-studio', 
    name: 'Creative Studio', 
    icon: Palette, 
    description: 'Artistic and bold look with creative lighting.',
    prompt: 'Creative professional headshot, stylish attire, minimalist studio background, artistic directional lighting.'
  },
  { 
    id: 'executive-boardroom', 
    name: 'Executive Boardroom', 
    icon: User, 
    description: 'High-status look in a luxury boardroom setting.',
    prompt: 'Executive formal headshot, luxury boardroom background, wood paneling, authoritative lighting.'
  }
];

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState(STYLES);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.;
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size too large. Please upload an image under 5MB.");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
      setGeneratedImage(null);
    }
  };

  // Logic to call your Netlify Function
 const generateHeadshot = async () => {
    if (!selectedFile) return;

    setIsGenerating(true);
    setError(null);

    try {
      // 1. Convert the file to Base64 so we can send it to the function
      const base64Data = await fileToBase64(selectedFile);

      // 2. Call the Netlify function
      const response = await fetch('/.netlify/functions/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          base64Data: base64Data,
          mimeType: selectedFile.type,
          stylePrompt: selectedStyle.prompt 
        }),
      });

      const data = await response.json();

      if (data.url) {
        setGeneratedImage(data.url);
      } else {
        throw new Error(data.error || "Failed to generate image.");
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      setError("AI is busy or the image is too large. Please try again in a moment.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `headshot-${selectedStyle.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">AI Headshot Pro</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Upload & Options */}
          <div className="lg:col-span-5 space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">1</span>
                <h2 className="text-lg font-semibold">Upload your selfie</h2>
              </div>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative group cursor-pointer border-2 border-dashed rounded-2xl transition-all duration-300 aspect-square flex flex-col items-center justify-center overflow-hidden
                  ${previewUrl ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/10'}`}
              >
                {previewUrl ? (
                  <>
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-medium flex items-center gap-2">
                        <RefreshCw className="w-5 h-5" /> Change Photo
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Click to upload selfie</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">2</span>
                <h2 className="text-lg font-semibold">Choose a style</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style)}
                    className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all
                      ${selectedStyle.id === style.id 
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                  >
                    <div className={`p-2 rounded-lg ${selectedStyle.id === style.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <style.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm">{style.name}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{style.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <button
              onClick={generateHeadshot}
              disabled={!selectedFile || isGenerating}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg
                ${!selectedFile || isGenerating 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {isGenerating ? 'Generating...' : 'Generate Headshot'}
            </button>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Right Column: Result */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Your Professional Result</h3>
                {generatedImage && (
                  <button onClick={downloadImage} className="text-indigo-600 text-sm font-semibold flex items-center gap-1.5">
                    <Download className="w-4 h-4" /> Download
                  </button>
                )}
              </div>
              
              <div className="flex-1 bg-gray-50/50 flex items-center justify-center p-8 relative">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div key="loading" className="text-center space-y-4">
                      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="font-bold">Perfecting your lighting...</p>
                    </motion.div>
                  ) : generatedImage ? (
                    <motion.div key="result" className="w-full max-w-md">
                      <img src={generatedImage} alt="Result" className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/5]" />
                    </motion.div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <Camera className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>Your AI headshot will appear here.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
