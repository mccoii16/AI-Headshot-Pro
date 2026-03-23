import React, { useState, useRef } from 'react';
import { 
  Upload, Camera, Briefcase, Building2, Sun, Palette, 
  User, CheckCircle2, Loader2, Download, RefreshCw, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STYLES = [
  { 
    id: 'corporate-grey', 
    name: 'Corporate Grey', 
    icon: Briefcase, 
    description: 'Classic professional studio look.',
    prompt: 'Professional corporate headshot, suit and blazer, studio grey background, high-end lighting.'
  },
  { 
    id: 'tech-office', 
    name: 'Tech Office', 
    icon: Building2, 
    description: 'Approachable tech industry look.',
    prompt: 'Professional tech headshot, business casual, blurred office background, bright natural lighting.'
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
    const file = e.target.files?.; // Fixed the typo here
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
      setGeneratedImage(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(','));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const generateHeadshot = async () => {
    if (!selectedFile) return;
    setIsGenerating(true);
    setError(null);

    try {
      const base64Data = await fileToBase64(selectedFile);
      const response = await fetch('/.netlify/functions/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          base64Data, 
          mimeType: selectedFile.type, 
          stylePrompt: selectedStyle.prompt 
        }),
      });

      const data = await response.json();
      if (data.url) setGeneratedImage(data.url);
      else throw new Error(data.error || "Generation failed");
    } catch (err: any) {
      setError("AI is warming up. Please try again in 10 seconds.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
