'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Sparkles,
  Send,
  ShieldAlert,
  Compass,
  Video,
  PhoneCall,
  MapPin,
  HelpCircle,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  triageData?: any;
  matchingFacilities?: any[];
  isEmergency?: boolean;
}

function AITriageContent() {
  const { t, user } = useApp();
  const searchParams = useSearchParams();
  const demoMode = searchParams.get('demo');

  const [inputQuery, setInputQuery] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Initial welcome message
  useEffect(() => {
    const initialWelcome: ChatMessage = {
      id: 'welcome',
      sender: 'ai',
      text: "Namaste! I am your JeevanSetu Health Navigation Assistant. Describe what symptoms or discomfort you are experiencing in simple words. I will help guide you to the right department or connect you with a doctor.",
    };

    // If emergency demo requested in URL, pre-fill with chest pain
    if (demoMode === 'emergency') {
      const emergencyQuery = "I have acute crushing chest pain radiating to my left arm, sweating, and difficulty breathing.";
      setMessages([
        initialWelcome,
        { id: 'user-emergency', sender: 'user', text: emergencyQuery },
      ]);
      handleRunTriage(emergencyQuery);
    } else {
      setMessages([initialWelcome]);
    }
  }, [demoMode]);

  const handleRunTriage = async (symptoms: string) => {
    if (!symptoms.trim()) return;

    setIsProcessing(true);
    try {
      const res = await fetch('/api/ai/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms,
          preferredLanguage: 'mr',
          patientLat: 18.7900,
          patientLng: 74.2200,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        const { triage, matchingFacilities } = json;

        const isEmergency = triage.urgency === 'emergency';
        const aiResponseText = isEmergency
          ? triage.userFacingAdvice
          : `${triage.userFacingAdvice}\n\nRecommended Department: ${triage.recommendedDepartment}.`;

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: aiResponseText,
            triageData: triage,
            matchingFacilities,
            isEmergency,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: "I couldn't confidently process your symptoms. A local health worker at your nearest Sub-centre can assist you.",
          },
        ]);
      }
    } catch (err) {
      console.error('Triage error:', err);
    } finally {
      setIsProcessing(false);
      setInputQuery('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isProcessing) return;

    const userText = inputQuery.trim();
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, sender: 'user', text: userText }]);
    handleRunTriage(userText);
  };

  const setPrompt = (text: string) => {
    setInputQuery(text);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header & Safety Disclaimer (Section 22) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="govt">AI Health Navigation</Badge>
          <span className="text-xs text-slate-500 font-medium">Safe & Explainable Triage</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('aiTriage.title')}</h1>
        <p className="text-xs sm:text-sm text-slate-600">{t('aiTriage.subtitle')}</p>

        {/* Non-Negotiable Medical Disclaimer (Section 147) */}
        <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-semibold">Important Clinical Boundary:</strong> {t('aiTriage.disclaimer')}
          </p>
        </div>
      </div>

      {/* Suggested Quick Intakes for Demo */}
      <div className="space-y-1.5">
        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
          Suggested Demonstrations:
        </span>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setPrompt('I have severe knee pain and it is difficult for me to travel.')}
            className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors text-left"
          >
            🦵 Hero Demo: Severe knee pain & travel difficulty
          </button>
          <button
            onClick={() => setPrompt('Acute severe chest pain radiating to left arm with dizziness and sweating.')}
            className="px-3 py-1.5 rounded-xl bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 transition-colors text-left"
          >
            🚨 Emergency Demo: Acute chest pain & red-flags
          </button>
          <button
            onClick={() => setPrompt('Routine monthly checkup for blood pressure and refill of antihypertensive medicine.')}
            className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 transition-colors text-left"
          >
            🩺 Chronic Care: Hypertension refill & checkup
          </button>
        </div>
      </div>

      {/* Chat Messages Container */}
      <Card className="p-4 sm:p-6 min-h-[420px] max-h-[600px] overflow-y-auto space-y-4 bg-slate-50/50 border-slate-200/90 shadow-xs">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-teal-600 text-white rounded-br-xs shadow-xs'
                  : msg.isEmergency
                  ? 'bg-red-50 border-2 border-red-400 text-red-950 rounded-bl-xs shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs'
              }`}
            >
              {/* Emergency Banner Alert if Red Flags Detected (Section 67) */}
              {msg.isEmergency && (
                <div className="mb-3 p-3 bg-red-600 text-white rounded-xl flex items-center justify-between gap-3 animate-pulse">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-white shrink-0" />
                    <span className="font-bold text-xs uppercase tracking-wide">Emergency Warning</span>
                  </div>
                  <a
                    href="tel:108"
                    className="px-3 py-1 bg-white text-red-700 font-bold rounded-lg text-xs hover:bg-red-50 transition-colors flex items-center gap-1"
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> Call 108
                  </a>
                </div>
              )}

              <p className="whitespace-pre-line">{msg.text}</p>

              {/* Triage Structured Recommendation Card */}
              {msg.triageData && !msg.isEmergency && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Assessed Priority:</span>
                    <Badge variant={msg.triageData.urgency === 'urgent' ? 'urgent' : 'routine'}>
                      {msg.triageData.urgency.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Specialty Required:</span>
                    <strong className="text-slate-900">{msg.triageData.recommendedDepartment}</strong>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                    <span className="font-bold text-slate-800 block mb-0.5">Why this recommendation?</span>
                    {msg.triageData.urgencyReason}
                  </div>

                  {/* Primary Teleconsult CTA for Hero Journey */}
                  {msg.triageData.recommendedServiceType === 'TELECONSULT' && (
                    <div className="pt-2">
                      <Link
                        href={`/patient/appointments?type=TELECONSULT&specialty=Orthopedics`}
                        className="w-full inline-block"
                      >
                        <Button size="md" className="w-full" leftIcon={<Video className="w-4 h-4" />}>
                          {t('aiTriage.proceedToTeleconsult')}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Matching Facilities (Section 25) */}
              {msg.matchingFacilities && msg.matchingFacilities.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    {msg.isEmergency ? 'Nearest 24x7 Emergency Facilities:' : 'Matching Public Facilities:'}
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {msg.matchingFacilities.map((fac) => (
                      <div
                        key={fac.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                          msg.isEmergency
                            ? 'bg-red-50/50 border-red-200'
                            : 'bg-slate-50/80 border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900">{fac.name}</span>
                            <Badge variant={fac.ownership === 'GOVERNMENT' ? 'govt' : 'private'}>
                              {fac.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" /> {fac.address}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <a href={`tel:${fac.phone}`}>
                            <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs">
                              <PhoneCall className="w-3.5 h-3.5 mr-1" /> Call
                            </Button>
                          </a>
                          <Link href={`/patient/facilities/${fac.id}`}>
                            <Button size="sm" className="h-8 px-2.5 text-xs">
                              Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-slate-500 animate-pulse pl-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>{t('aiTriage.analyzing')}</span>
          </div>
        )}
      </Card>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={t('aiTriage.placeholder')}
          disabled={isProcessing}
          className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-xs"
        />
        <Button type="submit" disabled={isProcessing || !inputQuery.trim()} leftIcon={<Send className="w-4 h-4" />}>
          {t('aiTriage.send')}
        </Button>
      </form>
    </div>
  );
}

export default function AITriagePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading AI Assistant...</div>}>
      <AITriageContent />
    </Suspense>
  );
}
