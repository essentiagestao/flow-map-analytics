'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  MousePointer2, 
  Link2, 
  Settings2, 
  ArrowRight, 
  X,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

const ONBOARDING_KEY = 'funnel:onboarding-completed';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  tip: string;
}

const steps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Arraste componentes',
    description: 'Na paleta à esquerda, escolha os elementos do seu funil: fontes de tráfego, páginas, eventos e comunicações.',
    icon: <MousePointer2 className="w-8 h-8" />,
    tip: 'Dica: Use a busca para encontrar componentes rapidamente',
  },
  {
    id: 2,
    title: 'Conecte as etapas',
    description: 'Clique e arraste das bolinhas de conexão de um nó para outro. Isso cria o fluxo do seu funil.',
    icon: <Link2 className="w-8 h-8" />,
    tip: 'Dica: Segure Shift para selecionar múltiplos nós',
  },
  {
    id: 3,
    title: 'Configure métricas',
    description: 'Clique em qualquer nó para editar suas propriedades: nome, URL, meta de conversão e tags.',
    icon: <Settings2 className="w-8 h-8" />,
    tip: 'Dica: Use Ctrl+S para salvar seu trabalho',
  },
];

export const OnboardingOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      // Delay to let the page load first
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOpen(false);
  };

  const handleStartOver = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  // Expose restart function
  useEffect(() => {
    (window as any).restartOnboarding = handleStartOver;
    return () => {
      delete (window as any).restartOnboarding;
    };
  }, []);

  if (!isOpen) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg mx-4"
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 pb-6">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                onClick={handleSkip}
              >
                <X className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-2 text-primary mb-4">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium">Bem-vindo ao Flow-Map</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Passo {currentStep + 1} de {steps.length}</span>
                <span>{Math.round(progress)}% completo</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Tip box */}
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">
                      💡 {step.tip}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-8 pb-8 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-muted-foreground"
              >
                Pular tutorial
              </Button>
              
              <div className="flex items-center gap-3">
                {/* Step indicators */}
                <div className="flex gap-1.5">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentStep 
                          ? 'bg-primary' 
                          : index < currentStep 
                            ? 'bg-primary/50' 
                            : 'bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                
                <Button onClick={handleNext} className="gap-2">
                  {currentStep === steps.length - 1 ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Começar
                    </>
                  ) : (
                    <>
                      Próximo
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const resetOnboarding = () => {
  localStorage.removeItem(ONBOARDING_KEY);
  (window as any).restartOnboarding?.();
};
