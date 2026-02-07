import { Node, Edge } from '@xyflow/react';
import { getDefaultMetrics } from './defaultMetrics';

export interface FunnelTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  nodes: Node[];
  edges: Edge[];
}

// Template 1: Instagram Ads → Landing Page → Lead → CRM
const instagramToCRM: FunnelTemplate = {
  id: 'instagram-crm',
  name: 'Instagram → CRM',
  description: 'Funil completo: Instagram Ads até conversão no CRM',
  icon: 'FaInstagram',
  nodes: [
    {
      id: 'tpl1-1',
      type: 'traffic',
      position: { x: 100, y: 200 },
      data: { 
        label: 'Instagram Ads',
        nodeType: 'instagram',
        url: '',
        width: 64,
        height: 64,
        ...getDefaultMetrics('instagram', 'traffic'),
      },
    },
    {
      id: 'tpl1-2',
      type: 'page',
      position: { x: 300, y: 170 },
      data: { 
        label: 'Landing Page',
        nodeType: 'landing',
        url: '/lp-instagram',
        width: 160,
        height: 140,
        ...getDefaultMetrics('landing', 'page'),
      },
    },
    {
      id: 'tpl1-3',
      type: 'event',
      position: { x: 550, y: 200 },
      data: { 
        label: 'Lead Capturado',
        nodeType: 'lead',
        url: '',
        width: 56,
        height: 56,
        ...getDefaultMetrics('lead', 'event'),
      },
    },
    {
      id: 'tpl1-4',
      type: 'communication',
      position: { x: 700, y: 200 },
      data: { 
        label: 'Sequência E-mail',
        nodeType: 'sequence',
        url: '',
        width: 56,
        height: 56,
        ...getDefaultMetrics('sequence', 'communication'),
      },
    },
    {
      id: 'tpl1-5',
      type: 'event',
      position: { x: 850, y: 200 },
      data: { 
        label: 'Cliente',
        nodeType: 'customer',
        url: '',
        width: 56,
        height: 56,
        ...getDefaultMetrics('customer', 'event'),
      },
    },
  ],
  edges: [
    { id: 'tpl1-e1', source: 'tpl1-1', target: 'tpl1-2', type: 'custom', data: { style: 'solid' } },
    { id: 'tpl1-e2', source: 'tpl1-2', target: 'tpl1-3', type: 'custom', data: { style: 'solid' } },
    { id: 'tpl1-e3', source: 'tpl1-3', target: 'tpl1-4', type: 'custom', data: { style: 'solid' } },
    { id: 'tpl1-e4', source: 'tpl1-4', target: 'tpl1-5', type: 'custom', data: { style: 'solid' } },
  ],
};

// Template 2: Funil Simples (Facebook → LP → Obrigado)
const simpleFunnel: FunnelTemplate = {
  id: 'simple',
  name: 'Funil Simples',
  description: 'Tráfego → Landing Page → Conversão',
  icon: 'FaRocket',
  nodes: [
    {
      id: 'tpl2-1',
      type: 'traffic',
      position: { x: 100, y: 200 },
      data: { 
        label: 'Facebook Ads',
        nodeType: 'facebook',
        url: '',
        width: 64,
        height: 64,
        ...getDefaultMetrics('facebook', 'traffic'),
      },
    },
    {
      id: 'tpl2-2',
      type: 'page',
      position: { x: 300, y: 170 },
      data: { 
        label: 'Landing Page',
        nodeType: 'landing',
        url: '/lp-oferta',
        width: 160,
        height: 140,
        ...getDefaultMetrics('landing', 'page'),
      },
    },
    {
      id: 'tpl2-3',
      type: 'page',
      position: { x: 550, y: 170 },
      data: { 
        label: 'Thank You',
        nodeType: 'thankyou',
        url: '/obrigado',
        width: 160,
        height: 140,
        ...getDefaultMetrics('thankyou', 'page'),
      },
    },
  ],
  edges: [
    { id: 'tpl2-e1', source: 'tpl2-1', target: 'tpl2-2', type: 'custom', data: { style: 'solid' } },
    { id: 'tpl2-e2', source: 'tpl2-2', target: 'tpl2-3', type: 'custom', data: { style: 'solid' } },
  ],
};

// Template 3: Funil com Upsell
const upsellFunnel: FunnelTemplate = {
  id: 'upsell',
  name: 'Funil com Upsell',
  description: 'Checkout → Upsell → Downsell → Obrigado',
  icon: 'FaArrowUp',
  nodes: [
    {
      id: 'tpl3-1',
      type: 'traffic',
      position: { x: 100, y: 250 },
      data: { 
        label: 'Google Ads',
        nodeType: 'google',
        url: '',
        width: 64,
        height: 64,
        ...getDefaultMetrics('google', 'traffic'),
      },
    },
    {
      id: 'tpl3-2',
      type: 'page',
      position: { x: 300, y: 220 },
      data: { 
        label: 'Página de Vendas',
        nodeType: 'sales',
        url: '/vendas',
        width: 160,
        height: 140,
        ...getDefaultMetrics('sales', 'page'),
      },
    },
    {
      id: 'tpl3-3',
      type: 'page',
      position: { x: 550, y: 220 },
      data: { 
        label: 'Checkout',
        nodeType: 'checkout',
        url: '/checkout',
        width: 160,
        height: 140,
        ...getDefaultMetrics('checkout', 'page'),
      },
    },
    {
      id: 'tpl3-4',
      type: 'page',
      position: { x: 800, y: 100 },
      data: { 
        label: 'Upsell',
        nodeType: 'sales',
        url: '/upsell',
        width: 160,
        height: 140,
        conversionRate: 25,
        cost: 0,
      },
    },
    {
      id: 'tpl3-5',
      type: 'page',
      position: { x: 800, y: 320 },
      data: { 
        label: 'Downsell',
        nodeType: 'sales',
        url: '/downsell',
        width: 160,
        height: 140,
        conversionRate: 35,
        cost: 0,
      },
    },
    {
      id: 'tpl3-6',
      type: 'page',
      position: { x: 1050, y: 220 },
      data: { 
        label: 'Thank You',
        nodeType: 'thankyou',
        url: '/obrigado',
        width: 160,
        height: 140,
        ...getDefaultMetrics('thankyou', 'page'),
      },
    },
  ],
  edges: [
    { id: 'tpl3-e1', source: 'tpl3-1', target: 'tpl3-2', type: 'custom', data: { style: 'solid' } },
    { id: 'tpl3-e2', source: 'tpl3-2', target: 'tpl3-3', type: 'custom', data: { style: 'solid' } },
    { id: 'tpl3-e3', source: 'tpl3-3', target: 'tpl3-4', type: 'custom', data: { style: 'solid' } },
    { id: 'tpl3-e4', source: 'tpl3-3', target: 'tpl3-5', type: 'custom', data: { style: 'dashed' } },
    { id: 'tpl3-e5', source: 'tpl3-4', target: 'tpl3-6', type: 'custom', data: { style: 'solid' } },
    { id: 'tpl3-e6', source: 'tpl3-5', target: 'tpl3-6', type: 'custom', data: { style: 'dashed' } },
  ],
};

// Template 4: Webinar Funnel
const webinarFunnel: FunnelTemplate = {
  id: 'webinar',
  name: 'Funil de Webinar',
  description: 'Registro → Webinar → Oferta → Venda',
  icon: 'FaVideo',
  nodes: [
    {
      id: 'tpl4-1',
      type: 'traffic',
      position: { x: 100, y: 200 },
      data: { 
        label: 'YouTube Ads',
        nodeType: 'youtube',
        url: '',
        width: 64,
        height: 64,
        ...getDefaultMetrics('youtube', 'traffic'),
      },
    },
    {
      id: 'tpl4-2',
      type: 'page',
      position: { x: 300, y: 170 },
      data: { 
        label: 'Registro Webinar',
        nodeType: 'webinar',
        url: '/webinar-registro',
        width: 160,
        height: 140,
        ...getDefaultMetrics('webinar', 'page'),
      },
    },
    {
      id: 'tpl4-3',
      type: 'communication',
      position: { x: 550, y: 200 },
      data: { 
        label: 'Lembrete E-mail',
        nodeType: 'sequence',
        url: '',
        width: 56,
        height: 56,
        ...getDefaultMetrics('sequence', 'communication'),
      },
    },
    {
      id: 'tpl4-4',
      type: 'page',
      position: { x: 700, y: 170 },
      data: { 
        label: 'Sala do Webinar',
        nodeType: 'webinar',
        url: '/webinar-sala',
        width: 160,
        height: 140,
        conversionRate: 60,
        cost: 0,
      },
    },
    {
      id: 'tpl4-5',
      type: 'page',
      position: { x: 950, y: 170 },
      data: { 
        label: 'Checkout',
        nodeType: 'checkout',
        url: '/checkout',
        width: 160,
        height: 140,
        ...getDefaultMetrics('checkout', 'page'),
      },
    },
    {
      id: 'tpl4-6',
      type: 'event',
      position: { x: 1200, y: 200 },
      data: { 
        label: 'Cliente',
        nodeType: 'customer',
        url: '',
        width: 56,
        height: 56,
        ...getDefaultMetrics('customer', 'event'),
      },
    },
  ],
  edges: [
    { id: 'tpl4-e1', source: 'tpl4-1', target: 'tpl4-2', type: 'custom', data: { style: 'solid' } },
    { id: 'tpl4-e2', source: 'tpl4-2', target: 'tpl4-3', type: 'custom', data: { style: 'solid' } },
    { id: 'tpl4-e3', source: 'tpl4-3', target: 'tpl4-4', type: 'custom', data: { style: 'dashed' } },
    { id: 'tpl4-e4', source: 'tpl4-4', target: 'tpl4-5', type: 'custom', data: { style: 'solid' } },
    { id: 'tpl4-e5', source: 'tpl4-5', target: 'tpl4-6', type: 'custom', data: { style: 'solid' } },
  ],
};

// Template 5: Lead Nurturing
const leadNurturing: FunnelTemplate = {
  id: 'nurturing',
  name: 'Lead Nurturing',
  description: 'Captura → Nutrição → Qualificação → Venda',
  icon: 'FaEnvelope',
  nodes: [
    {
      id: 'tpl5-1',
      type: 'traffic',
      position: { x: 100, y: 200 },
      data: { 
        label: 'Orgânico',
        nodeType: 'organic',
        url: '',
        width: 64,
        height: 64,
        ...getDefaultMetrics('organic', 'traffic'),
      },
    },
    {
      id: 'tpl5-2',
      type: 'page',
      position: { x: 300, y: 170 },
      data: { 
        label: 'Blog Post',
        nodeType: 'blog',
        url: '/blog/artigo',
        width: 160,
        height: 140,
        ...getDefaultMetrics('blog', 'page'),
      },
    },
    {
      id: 'tpl5-3',
      type: 'page',
      position: { x: 550, y: 170 },
      data: { 
        label: 'Lead Magnet',
        nodeType: 'landing',
        url: '/ebook',
        width: 160,
        height: 140,
        ...getDefaultMetrics('landing', 'page'),
      },
    },
    {
      id: 'tpl5-4',
      type: 'event',
      position: { x: 800, y: 200 },
      data: { 
        label: 'Lead',
        nodeType: 'lead',
        url: '',
        width: 56,
        height: 56,
        ...getDefaultMetrics('lead', 'event'),
      },
    },
    {
      id: 'tpl5-5',
      type: 'communication',
      position: { x: 950, y: 100 },
      data: { 
        label: 'Sequência Nutrição',
        nodeType: 'sequence',
        url: '',
        width: 56,
        height: 56,
        ...getDefaultMetrics('sequence', 'communication'),
      },
    },
    {
      id: 'tpl5-6',
      type: 'event',
      position: { x: 950, y: 300 },
      data: { 
        label: 'Segmentação',
        nodeType: 'segment',
        url: '',
        width: 56,
        height: 56,
        ...getDefaultMetrics('segment', 'event'),
      },
    },
    {
      id: 'tpl5-7',
      type: 'page',
      position: { x: 1100, y: 170 },
      data: { 
        label: 'Página de Vendas',
        nodeType: 'sales',
        url: '/vendas',
        width: 160,
        height: 140,
        ...getDefaultMetrics('sales', 'page'),
      },
    },
    {
      id: 'tpl5-8',
      type: 'event',
      position: { x: 1350, y: 200 },
      data: { 
        label: 'Cliente',
        nodeType: 'customer',
        url: '',
        width: 56,
        height: 56,
        ...getDefaultMetrics('customer', 'event'),
      },
    },
  ],
  edges: [
    { id: 'tpl5-e1', source: 'tpl5-1', target: 'tpl5-2', type: 'custom', data: { style: 'solid' } },
    { id: 'tpl5-e2', source: 'tpl5-2', target: 'tpl5-3', type: 'custom', data: { style: 'solid' } },
    { id: 'tpl5-e3', source: 'tpl5-3', target: 'tpl5-4', type: 'custom', data: { style: 'solid' } },
    { id: 'tpl5-e4', source: 'tpl5-4', target: 'tpl5-5', type: 'custom', data: { style: 'solid' } },
    { id: 'tpl5-e5', source: 'tpl5-4', target: 'tpl5-6', type: 'custom', data: { style: 'dashed' } },
    { id: 'tpl5-e6', source: 'tpl5-5', target: 'tpl5-7', type: 'custom', data: { style: 'solid' } },
    { id: 'tpl5-e7', source: 'tpl5-6', target: 'tpl5-7', type: 'custom', data: { style: 'dashed' } },
    { id: 'tpl5-e8', source: 'tpl5-7', target: 'tpl5-8', type: 'custom', data: { style: 'solid' } },
  ],
};

export const funnelTemplates: FunnelTemplate[] = [
  simpleFunnel,
  instagramToCRM,
  upsellFunnel,
  webinarFunnel,
  leadNurturing,
];

export const getTemplate = (id: string): FunnelTemplate | undefined => {
  return funnelTemplates.find(t => t.id === id);
};
