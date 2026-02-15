'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Image, FileText, Download, Loader2 } from 'lucide-react';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ExportFormat = 'png' | 'jpg' | 'pdf';
type ExportQuality = 'standard' | 'high' | 'ultra';
type ExportContent = 'funnel' | 'performance' | 'both';

const qualitySettings: Record<ExportQuality, { scale: number; label: string; description: string }> = {
  standard: { scale: 1, label: 'Padrão', description: '1x - Rápido, ideal para visualização' },
  high: { scale: 2, label: 'Alta', description: '2x - Boa qualidade para apresentações' },
  ultra: { scale: 3, label: 'Ultra', description: '3x - Máxima qualidade para impressão' },
};

export const ExportDialog = ({ open, onOpenChange }: ExportDialogProps) => {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [quality, setQuality] = useState<ExportQuality>('high');
  const [isExporting, setIsExporting] = useState(false);
  const [includeBackground, setIncludeBackground] = useState(true);
  const [exportContent, setExportContent] = useState<ExportContent>('funnel');

  const getExportElements = (): HTMLElement[] => {
    const elements: HTMLElement[] = [];
    if (exportContent === 'funnel' || exportContent === 'both') {
      const canvas = document.querySelector('.react-flow') as HTMLElement;
      if (canvas) elements.push(canvas);
    }
    if (exportContent === 'performance' || exportContent === 'both') {
      const panel = document.querySelector('[data-conversion-panel]') as HTMLElement;
      if (panel) elements.push(panel);
    }
    return elements;
  };

  const handleExport = async () => {
    const elements = getExportElements();
    if (elements.length === 0) {
      toast.error('Elemento não encontrado para exportar');
      return;
    }

    setIsExporting(true);

    try {
      const { scale } = qualitySettings[quality];
      const options = {
        backgroundColor: includeBackground ? '#ffffff' : undefined,
        pixelRatio: scale,
        quality: format === 'jpg' ? 0.95 : 1,
        filter: (node: HTMLElement) => {
          const excludeClasses = ['react-flow__controls', 'react-flow__minimap', 'react-flow__attribution'];
          return !excludeClasses.some(cls => node.classList?.contains(cls));
        },
      };

      const timestamp = new Date().toISOString().slice(0, 10);
      const contentLabel = exportContent === 'both' ? 'completo' : exportContent === 'performance' ? 'performance' : 'funil';
      const filename = `${contentLabel}-${timestamp}`;

      if (exportContent === 'both' && elements.length === 2) {
        // Capture both and combine into one image
        const images = await Promise.all(elements.map(el => toPng(el, options)));
        
        const loadedImgs = await Promise.all(images.map(src => {
          return new Promise<HTMLImageElement>((resolve) => {
            const img = new window.Image();
            img.src = src;
            img.onload = () => resolve(img);
          });
        }));

        const totalWidth = Math.max(...loadedImgs.map(i => i.width));
        const totalHeight = loadedImgs.reduce((sum, i) => sum + i.height + 40, 0);
        
        const canvasEl = document.createElement('canvas');
        canvasEl.width = totalWidth;
        canvasEl.height = totalHeight;
        const ctx = canvasEl.getContext('2d')!;
        if (includeBackground) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, totalWidth, totalHeight);
        }
        
        let y = 0;
        for (const img of loadedImgs) {
          ctx.drawImage(img, 0, y);
          y += img.height + 40;
        }

        const combinedUrl = canvasEl.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png', 0.95);

        if (format === 'pdf') {
          const pdf = new jsPDF({
            orientation: totalWidth > totalHeight ? 'landscape' : 'portrait',
            unit: 'px',
            format: [totalWidth, totalHeight],
          });
          pdf.addImage(combinedUrl, 'PNG', 0, 0, totalWidth, totalHeight);
          pdf.save(`${filename}.pdf`);
        } else {
          downloadImage(combinedUrl, `${filename}.${format}`);
        }
      } else {
        // Single element export
        const el = elements[0];
        if (format === 'pdf') {
          const dataUrl = await toPng(el, options);
          const img = new window.Image();
          img.src = dataUrl;
          await new Promise(resolve => img.onload = resolve);
          const pdf = new jsPDF({
            orientation: img.width > img.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [img.width, img.height],
          });
          pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
          pdf.save(`${filename}.pdf`);
        } else if (format === 'png') {
          const dataUrl = await toPng(el, options);
          downloadImage(dataUrl, `${filename}.png`);
        } else {
          const dataUrl = await toJpeg(el, options);
          downloadImage(dataUrl, `${filename}.jpg`);
        }
      }

      toast.success('Exportado com sucesso!');
      onOpenChange(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportar Funil
          </DialogTitle>
          <DialogDescription>
            Escolha o formato e a qualidade para exportar seu funil
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Content selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">O que exportar</Label>
            <RadioGroup
              value={exportContent}
              onValueChange={(v) => setExportContent(v as ExportContent)}
              className="grid grid-cols-3 gap-3"
            >
              <Label
                htmlFor="content-funnel"
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${
                  exportContent === 'funnel' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="funnel" id="content-funnel" className="sr-only" />
                <span className="text-sm font-medium">Funil</span>
                <span className="text-[10px] text-muted-foreground">Apenas o canvas</span>
              </Label>
              <Label
                htmlFor="content-performance"
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${
                  exportContent === 'performance' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="performance" id="content-performance" className="sr-only" />
                <span className="text-sm font-medium">Performance</span>
                <span className="text-[10px] text-muted-foreground">Análise de conversão</span>
              </Label>
              <Label
                htmlFor="content-both"
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${
                  exportContent === 'both' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="both" id="content-both" className="sr-only" />
                <span className="text-sm font-medium">Ambos</span>
                <span className="text-[10px] text-muted-foreground">Funil + Performance</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Format selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Formato</Label>
            <RadioGroup
              value={format}
              onValueChange={(v) => setFormat(v as ExportFormat)}
              className="grid grid-cols-3 gap-3"
            >
              <Label
                htmlFor="png"
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  format === 'png' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="png" id="png" className="sr-only" />
                <Image className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium">PNG</span>
                <span className="text-[10px] text-muted-foreground">Transparente</span>
              </Label>
              
              <Label
                htmlFor="jpg"
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  format === 'jpg' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="jpg" id="jpg" className="sr-only" />
                <Image className="w-6 h-6 text-amber-500" />
                <span className="text-sm font-medium">JPG</span>
                <span className="text-[10px] text-muted-foreground">Compacto</span>
              </Label>
              
              <Label
                htmlFor="pdf"
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  format === 'pdf' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="pdf" id="pdf" className="sr-only" />
                <FileText className="w-6 h-6 text-destructive" />
                <span className="text-sm font-medium">PDF</span>
                <span className="text-[10px] text-muted-foreground">Apresentação</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Quality selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Qualidade</Label>
            <RadioGroup
              value={quality}
              onValueChange={(v) => setQuality(v as ExportQuality)}
              className="space-y-2"
            >
              {Object.entries(qualitySettings).map(([key, { label, description }]) => (
                <Label
                  key={key}
                  htmlFor={key}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    quality === key 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={key} id={key} />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs text-muted-foreground">{description}</div>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Background toggle (only for PNG) */}
          {format === 'png' && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <Label className="text-sm font-medium">Fundo branco</Label>
                <p className="text-xs text-muted-foreground">Desative para fundo transparente</p>
              </div>
              <Button
                variant={includeBackground ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIncludeBackground(!includeBackground)}
              >
                {includeBackground ? 'Sim' : 'Não'}
              </Button>
            </div>
          )}
        </div>

        {/* Export button */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={isExporting} className="gap-2">
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Exportar {format.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
