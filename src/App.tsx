/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
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
    prompt: 'Transform this person into a professional corporate headshot. They should be wearing professional business attire (suit or blazer). The background should be a clean, slightly textured studio grey backdrop. High-end lighting, sharp focus, professional photography style.'
  },
  { 
    id: 'tech-office', 
    name: 'Modern Tech Office', 
    icon: Building2, 
    description: 'Modern, approachable look with a blurred tech office background.',
    prompt: 'Transform this person into a professional headshot for a tech company. They should be wearing business casual attire. The background should be a modern, bright, slightly out-of-focus tech office with glass and plants. Natural but professional lighting.'
  },
  { 
    id: 'outdoor-natural', 
    name: 'Outdoor Natural', 
    icon: Sun, 
    description: 'Warm and friendly look with natural outdoor lighting.',
    prompt: 'Transform this person into a professional headshot with an outdoor setting. They should be wearing smart casual attire. The background should be a beautiful, softly blurred park or urban greenery with natural golden hour lighting. Friendly and professional.'
  },
  { 
    id: 'creative-studio', 
    name: 'Creative Studio', 
    icon: Palette, 
    description: 'Artistic and bold look with creative lighting.',
    prompt: 'Transform this person into a creative professional headshot. They should be wearing stylish, modern attire. The background should be a minimalist studio with artistic, directional lighting and a subtle pop of color. Bold and professional.'
  },
  { 
    id: 'executive-boardroom', 
    name: 'Executive Boardroom', 
    icon: User, 
    description: 'High-status look in a luxury boardroom setting.',
    prompt: 'Transform this person into an executive headshot. They should be wearing formal business attire. The background should be a luxury boardroom or high-end office with wood paneling and city views through windows, softly blurred. Authoritative and professional.'
  }
];

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const generateHeadshot = async () => {
    if (!selectedFile) return;

    setIsGenerating(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const base64Data = await fileToBase64(selectedFile);

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: selectedFile.type,
              },
            },
            {
              text: selectedStyle.prompt,
            },
          ],
        },
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setGeneratedImage(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        throw new Error("No image was generated. Please try again.");
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "An error occurred during generation. Please try again.");
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
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-indigo-600 transition-colors">How it works</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Styles</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Pricing</a>
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
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-medium flex items-center gap-2">
                        <RefreshCw className="w-5 h-5" /> Change Photo
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-gray-400 group-hover:text-indigo-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
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
                    className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200
                      ${selectedStyle.id === style.id 
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                  >
                    <div className={`p-2 rounded-lg ${selectedStyle.id === style.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <style.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{style.name}</span>
                        {selectedStyle.id === style.id && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{style.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <button
              onClick={generateHeadshot}
              disabled={!selectedFile || isGenerating}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-indigo-200
                ${!selectedFile || isGenerating 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]'}`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Headshot
                </>
              )}
            </button>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-3"
              >
                <div className="mt-0.5">⚠️</div>
                <p>{error}</p>
              </motion.div>
            )}
          </div>

          {/* Right Column: Result */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Your Professional Result</h3>
                {generatedImage && (
                  <button 
                    onClick={downloadImage}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                )}
              </div>
              
              <div className="flex-1 bg-gray-50/50 flex items-center justify-center p-8 relative">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center space-y-6 max-w-xs"
                    >
                      <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="font-bold text-gray-900">Creating your masterpiece...</p>
                        <p className="text-sm text-gray-500">Our AI is adjusting lighting, wardrobe, and background for the perfect professional look.</p>
                      </div>
                    </motion.div>
                  ) : generatedImage ? (
                    <motion.div 
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full h-full flex flex-col items-center"
                    >
                      <div className="relative group rounded-2xl overflow-hidden shadow-2xl shadow-indigo-100 max-w-md w-full aspect-[4/5]">
                        <img 
                          src={generatedImage} 
                          alt="Generated Headshot" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      <p className="mt-6 text-sm text-gray-500 italic">Generated with {selectedStyle.name} style</p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-gray-400 max-w-xs"
                    >
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Camera className="w-10 h-10 text-gray-200" />
                      </div>
                      <p className="text-sm">Upload a photo and select a style to see your professional headshot here.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Tips Section */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Pro Tip #1</p>
                <p className="text-sm text-gray-600">Use a high-quality selfie with good lighting for best results.</p>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Pro Tip #2</p>
                <p className="text-sm text-gray-600">Look directly at the camera with a natural smile.</p>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Pro Tip #3</p>
                <p className="text-sm text-gray-600">Avoid busy backgrounds in your original photo if possible.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-gray-100 py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Camera className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-gray-900">AI Headshot Pro</span>
          </div>
          <p className="text-sm text-gray-500">© 2026 AI Headshot Pro. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
}
