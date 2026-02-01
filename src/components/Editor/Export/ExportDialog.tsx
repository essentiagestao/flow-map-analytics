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

  const handleExport = async () => {
    const canvas = document.querySelector('.react-flow') as HTMLElement;
    if (!canvas) {
      toast.error('Canvas não encontrado');
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
          // Exclude controls and minimap from export
          const excludeClasses = ['react-flow__controls', 'react-flow__minimap', 'react-flow__attribution'];
          return !excludeClasses.some(cls => node.classList?.contains(cls));
        },
      };

      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `funil-${timestamp}`;

      if (format === 'pdf') {
        // Generate image first, then add to PDF
        const dataUrl = await toPng(canvas, options);
        
        // Get image dimensions
        const img = new window.Image();
        img.src = dataUrl;
        await new Promise(resolve => img.onload = resolve);
        
        // Create PDF with proper dimensions
        const imgWidth = img.width;
        const imgHeight = img.height;
        const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait';
        
        const pdf = new jsPDF({
          orientation,
          unit: 'px',
          format: [imgWidth, imgHeight],
        });
        
        pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`${filename}.pdf`);
        
        toast.success('PDF exportado com sucesso!');
      } else if (format === 'png') {
        const dataUrl = await toPng(canvas, options);
        downloadImage(dataUrl, `${filename}.png`);
        toast.success('Imagem PNG exportada!');
      } else if (format === 'jpg') {
        const dataUrl = await toJpeg(canvas, options);
        downloadImage(dataUrl, `${filename}.jpg`);
        toast.success('Imagem JPG exportada!');
      }

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
