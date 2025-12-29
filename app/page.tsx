"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, ChevronRight, Zap } from "lucide-react";

interface MnemonicResult {
  mnemonic: string;
  explanation: string;
}

export default function Home() {
  const [terms, setTerms] = useState("");
  const [type, setType] = useState<"Acronym" | "Acrostic">("Acronym");
  const [style, setStyle] = useState<"Funny" | "Academic" | "Weird">("Funny");
  const [result, setResult] = useState<MnemonicResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!terms.trim()) {
      setError("Please enter some terms");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          terms,
          type,
          style,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate mnemonic");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      const textToCopy = `${result.mnemonic}\n\n${result.explanation}`;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
      <div className="fixed top-40 right-10 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15" style={{animation: "blob 8s infinite 3s"}}></div>
      <div className="fixed -bottom-32 left-1/3 w-96 h-96 bg-gradient-to-br from-blue-100 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10" style={{animation: "blob 7s infinite 5s"}}></div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Main Card with glass effect */}
        <div className="backdrop-blur-2xl bg-white/95 rounded-3xl shadow-2xl overflow-hidden border border-white/40 transition-all duration-300 hover:shadow-3xl hover:bg-white/97 group">
          
          {/* Header - Premium feel */}
          <div className="px-6 sm:px-12 pt-10 sm:pt-16 pb-8 border-b border-gradient-to-r from-blue-200/50 to-purple-200/50">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                    <Sparkles size={24} className="text-white" />
                  </div>
                  <h1 className="text-5xl sm:text-6xl font-light text-gray-900 tracking-tight">
                    Mnemonica
                  </h1>
                </div>
                <p className="text-gray-500 text-base sm:text-lg font-light">
                  Transform information into unforgettable memory aids
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-6 sm:px-12 py-8 sm:py-12 space-y-8">
            
            {/* Terms Input - Enhanced */}
            <div className="space-y-3 animate-fadeIn">
              <label className="block text-xs sm:text-sm font-light text-gray-700 uppercase tracking-widest">
                What do you want to remember?
              </label>
              <div className="relative">
                <textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Mitochondria, Photosynthesis, DNA..."
                  className="w-full h-28 sm:h-32 px-5 sm:px-6 py-4 sm:py-5 bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-400 focus:from-white focus:to-white focus:outline-none resize-none text-gray-800 placeholder-gray-400 transition-all duration-500 font-light text-base sm:text-lg leading-relaxed shadow-sm hover:shadow-md focus:shadow-lg focus:shadow-blue-200/50"
                />
                <div className="absolute -right-2 -bottom-2 text-4xl opacity-10 pointer-events-none animate-pulse">✨</div>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400 font-light">
                  Comma-separated or line-by-line
                </p>
                <p className="text-xs text-gray-400">{terms.length} characters</p>
              </div>
            </div>

            {/* Controls - Enhanced */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 animate-fadeIn" style={{animationDelay: "0.1s"}}>
              {/* Type Selection */}
              <div className="space-y-3">
                <label className="block text-xs sm:text-sm font-light text-gray-700 uppercase tracking-widest">
                  Mnemonic Type
                </label>
                <div className="flex gap-3">
                  {(["Acronym", "Acrostic"] as const).map((t, idx) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      style={{animationDelay: `${idx * 0.1}s`}}
                      className={`flex-1 px-4 py-3 sm:py-4 rounded-xl font-light transition-all duration-300 border-2 transform hover:scale-105 active:scale-95 ${
                        type === t
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg shadow-blue-300/50 scale-105"
                          : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Selection */}
              <div className="space-y-3">
                <label className="block text-xs sm:text-sm font-light text-gray-700 uppercase tracking-widest">
                  Tone & Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as typeof style)}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-gradient-to-br from-white to-blue-50/50 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-gray-800 font-light transition-all duration-300 appearance-none cursor-pointer hover:border-blue-300 hover:shadow-md focus:shadow-lg focus:shadow-blue-200/50"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233b82f6' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.2em 1.2em',
                    paddingRight: '2.8rem',
                  }}
                >
                  <option>Funny</option>
                  <option>Academic</option>
                  <option>Weird</option>
                </select>
              </div>
            </div>

            {/* Error Message - Enhanced */}
            {error && (
              <div className="animate-slideIn p-4 sm:p-5 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3 shadow-md">
                <div className="text-red-500 text-xl mt-0.5 flex-shrink-0 animate-bounce">⚠</div>
                <p className="text-red-700 font-light text-sm sm:text-base">{error}</p>
              </div>
            )}

            {/* Generate Button - Premium */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full relative group/btn animate-fadeIn"
              style={{animationDelay: "0.2s"}}
            >
              {/* Gradient background with animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 rounded-2xl opacity-100 group-hover/btn:opacity-110 blur-xl group-hover/btn:blur-2xl transition-all duration-500 group-disabled/btn:opacity-50"></div>
              
              {/* Button */}
              <div className={`relative bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 group-hover/btn:from-blue-600 group-hover/btn:via-blue-700 group-hover/btn:to-purple-700 group-disabled/btn:from-gray-400 group-disabled/btn:via-gray-400 group-disabled/btn:to-gray-400 text-white font-light py-4 sm:py-5 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg group-hover/btn:shadow-2xl group-hover/btn:shadow-blue-500/50 group-disabled/btn:shadow-none text-base sm:text-lg group-disabled/btn:cursor-not-allowed transform group-hover/btn:scale-105 group-active/btn:scale-95 group-disabled/btn:scale-100`}
              >
                {loading ? (
                  <>
                    <div className="relative w-5 h-5">
                      <div className="absolute inset-0 bg-white rounded-full animate-pulse"></div>
                      <Zap size={20} className="absolute inset-0 animate-spin" />
                    </div>
                    <span>Weaving Magic...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={22} className="group-hover/btn:scale-125 transition-transform duration-300" />
                    <span>Generate Mnemonic</span>
                    <ChevronRight size={20} className="group-hover/btn:translate-x-2 transition-transform duration-300 opacity-70" />
                  </>
                )}
              </div>
            </button>

            {/* Loading State - Sophisticated */}
            {loading && (
              <div className="space-y-4 sm:space-y-5 p-6 sm:p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl border-2 border-blue-200/50 shadow-lg animate-slideUp">
                <div className="flex gap-2 justify-center">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-2.5 h-2.5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full animate-bounce"
                      style={{animationDelay: `${i * 0.15}s`, animationDuration: "0.8s"}}
                    />
                  ))}
                </div>
                <p className="text-center text-gray-600 font-light text-sm animate-pulse">
                  ✨ Creating your unforgettable mnemonic...
                </p>
              </div>
            )}

            {/* Result Display - Premium */}
            {result && !loading && (
              <div className="space-y-4 animate-scaleIn">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-2xl opacity-20 -z-10"></div>
                
                <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-white rounded-2xl p-6 sm:p-8 border-2 border-blue-200/60 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:border-blue-300">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-blue-600 font-light uppercase tracking-widest mb-3">
                        ✨ Your Mnemonic
                      </p>
                      <h3 className="text-3xl sm:text-5xl font-light text-gray-900 leading-tight mb-5 break-words text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-fadeIn">
                        {result.mnemonic}
                      </h3>
                      <p className="text-gray-700 font-light leading-relaxed text-base sm:text-lg text-opacity-90">
                        {result.explanation}
                      </p>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="flex-shrink-0 p-3 sm:p-4 bg-white hover:bg-blue-50 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg group/copy"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <Check size={24} className="text-green-500 animate-pulse" />
                      ) : (
                        <Copy size={24} className="text-blue-600 group-hover/copy:text-blue-700" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Enhanced */}
        <div className="text-center mt-10 sm:mt-12 space-y-3 animate-fadeIn" style={{animationDelay: "0.3s"}}>
          <p className="text-gray-500 font-light text-xs sm:text-sm">
            Powered by AI • Designed for learning
          </p>
          
        </div>
      </div>
    </main>
  );
}
