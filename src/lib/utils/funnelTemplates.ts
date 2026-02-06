import { Node, Edge } from '@xyflow/react';

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
      type: 'trafficNode',
      position: { x: 100, y: 200 },
      data: { 
        label: 'Instagram Ads',
        nodeType: 'instagram',
        url: '',
        meta: 5000,
        color: '#E4405F',
      },
    },
    {
      id: 'tpl1-2',
      type: 'pageNode',
      position: { x: 350, y: 200 },
      data: { 
        label: 'Landing Page',
        nodeType: 'landing',
        url: '/lp-instagram',
        meta: 2500,
        color: '#6366F1',
      },
    },
    {
      id: 'tpl1-3',
      type: 'eventNode',
      position: { x: 600, y: 200 },
      data: { 
        label: 'Lead Capturado',
        nodeType: 'lead',
        url: '',
        meta: 500,
        color: '#EF4444',
      },
    },
    {
      id: 'tpl1-4',
      type: 'communicationNode',
      position: { x: 850, y: 200 },
      data: { 
        label: 'Sequência E-mail',
        nodeType: 'sequence',
        url: '',
        meta: 450,
        color: '#6366F1',
      },
    },
    {
      id: 'tpl1-5',
      type: 'eventNode',
      position: { x: 1100, y: 200 },
      data: { 
        label: 'Cliente',
        nodeType: 'customer',
        url: '',
        meta: 50,
        color: '#10B981',
      },
    },
  ],
  edges: [
    { id: 'tpl1-e1', source: 'tpl1-1', target: 'tpl1-2', type: 'smoothstep' },
    { id: 'tpl1-e2', source: 'tpl1-2', target: 'tpl1-3', type: 'smoothstep' },
    { id: 'tpl1-e3', source: 'tpl1-3', target: 'tpl1-4', type: 'smoothstep' },
    { id: 'tpl1-e4', source: 'tpl1-4', target: 'tpl1-5', type: 'smoothstep' },
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
      type: 'trafficNode',
      position: { x: 100, y: 200 },
      data: { 
        label: 'Facebook Ads',
        nodeType: 'facebook',
        url: '',
        meta: 3000,
        color: '#1877F2',
      },
    },
    {
      id: 'tpl2-2',
      type: 'pageNode',
      position: { x: 350, y: 200 },
      data: { 
        label: 'Landing Page',
        nodeType: 'landing',
        url: '/lp-oferta',
        meta: 1500,
        color: '#6366F1',
      },
    },
    {
      id: 'tpl2-3',
      type: 'pageNode',
      position: { x: 600, y: 200 },
      data: { 
        label: 'Thank You',
        nodeType: 'thankyou',
        url: '/obrigado',
        meta: 300,
        color: '#10B981',
      },
    },
  ],
  edges: [
    { id: 'tpl2-e1', source: 'tpl2-1', target: 'tpl2-2', type: 'smoothstep' },
    { id: 'tpl2-e2', source: 'tpl2-2', target: 'tpl2-3', type: 'smoothstep' },
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
      type: 'trafficNode',
      position: { x: 100, y: 250 },
      data: { 
        label: 'Google Ads',
        nodeType: 'google',
        url: '',
        meta: 4000,
        color: '#EA4335',
      },
    },
    {
      id: 'tpl3-2',
      type: 'pageNode',
      position: { x: 350, y: 250 },
      data: { 
        label: 'Página de Vendas',
        nodeType: 'sales',
        url: '/vendas',
        meta: 2000,
        color: '#10B981',
      },
    },
    {
      id: 'tpl3-3',
      type: 'pageNode',
      position: { x: 600, y: 250 },
      data: { 
        label: 'Checkout',
        nodeType: 'checkout',
        url: '/checkout',
        meta: 400,
        color: '#EF4444',
      },
    },
    {
      id: 'tpl3-4',
      type: 'eventNode',
      position: { x: 850, y: 150 },
      data: { 
        label: 'Upsell',
        nodeType: 'upsell',
        url: '',
        meta: 100,
        color: '#8B5CF6',
      },
    },
    {
      id: 'tpl3-5',
      type: 'eventNode',
      position: { x: 850, y: 350 },
      data: { 
        label: 'Downsell',
        nodeType: 'segment',
        url: '',
        meta: 80,
        color: '#F59E0B',
      },
    },
    {
      id: 'tpl3-6',
      type: 'pageNode',
      position: { x: 1100, y: 250 },
      data: { 
        label: 'Thank You',
        nodeType: 'thankyou',
        url: '/obrigado',
        meta: 180,
        color: '#10B981',
      },
    },
  ],
  edges: [
    { id: 'tpl3-e1', source: 'tpl3-1', target: 'tpl3-2', type: 'smoothstep' },
    { id: 'tpl3-e2', source: 'tpl3-2', target: 'tpl3-3', type: 'smoothstep' },
    { id: 'tpl3-e3', source: 'tpl3-3', target: 'tpl3-4', type: 'smoothstep', label: 'Sim' },
    { id: 'tpl3-e4', source: 'tpl3-3', target: 'tpl3-5', type: 'smoothstep', label: 'Não' },
    { id: 'tpl3-e5', source: 'tpl3-4', target: 'tpl3-6', type: 'smoothstep' },
    { id: 'tpl3-e6', source: 'tpl3-5', target: 'tpl3-6', type: 'smoothstep' },
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
      type: 'trafficNode',
      position: { x: 100, y: 200 },
      data: { 
        label: 'YouTube Ads',
        nodeType: 'youtube',
        url: '',
        meta: 8000,
        color: '#FF0000',
      },
    },
    {
      id: 'tpl4-2',
      type: 'pageNode',
      position: { x: 350, y: 200 },
      data: { 
        label: 'Registro Webinar',
        nodeType: 'webinar',
        url: '/webinar-registro',
        meta: 2400,
        color: '#F59E0B',
      },
    },
    {
      id: 'tpl4-3',
      type: 'communicationNode',
      position: { x: 600, y: 200 },
      data: { 
        label: 'Lembrete E-mail',
        nodeType: 'sequence',
        url: '',
        meta: 2200,
        color: '#6366F1',
      },
    },
    {
      id: 'tpl4-4',
      type: 'pageNode',
      position: { x: 850, y: 200 },
      data: { 
        label: 'Sala do Webinar',
        nodeType: 'webinar',
        url: '/webinar-sala',
        meta: 1200,
        color: '#F59E0B',
      },
    },
    {
      id: 'tpl4-5',
      type: 'pageNode',
      position: { x: 1100, y: 200 },
      data: { 
        label: 'Checkout',
        nodeType: 'checkout',
        url: '/checkout',
        meta: 300,
        color: '#EF4444',
      },
    },
    {
      id: 'tpl4-6',
      type: 'eventNode',
      position: { x: 1350, y: 200 },
      data: { 
        label: 'Cliente',
        nodeType: 'customer',
        url: '',
        meta: 120,
        color: '#10B981',
      },
    },
  ],
  edges: [
    { id: 'tpl4-e1', source: 'tpl4-1', target: 'tpl4-2', type: 'smoothstep' },
    { id: 'tpl4-e2', source: 'tpl4-2', target: 'tpl4-3', type: 'smoothstep' },
    { id: 'tpl4-e3', source: 'tpl4-3', target: 'tpl4-4', type: 'smoothstep' },
    { id: 'tpl4-e4', source: 'tpl4-4', target: 'tpl4-5', type: 'smoothstep' },
    { id: 'tpl4-e5', source: 'tpl4-5', target: 'tpl4-6', type: 'smoothstep' },
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
      type: 'trafficNode',
      position: { x: 100, y: 200 },
      data: { 
        label: 'Orgânico',
        nodeType: 'organic',
        url: '',
        meta: 10000,
        color: '#10B981',
      },
    },
    {
      id: 'tpl5-2',
      type: 'pageNode',
      position: { x: 350, y: 200 },
      data: { 
        label: 'Blog Post',
        nodeType: 'blog',
        url: '/blog/artigo',
        meta: 5000,
        color: '#8B5CF6',
      },
    },
    {
      id: 'tpl5-3',
      type: 'pageNode',
      position: { x: 600, y: 200 },
      data: { 
        label: 'Lead Magnet',
        nodeType: 'landing',
        url: '/ebook',
        meta: 1000,
        color: '#6366F1',
      },
    },
    {
      id: 'tpl5-4',
      type: 'eventNode',
      position: { x: 850, y: 200 },
      data: { 
        label: 'Lead',
        nodeType: 'lead',
        url: '',
        meta: 300,
        color: '#EF4444',
      },
    },
    {
      id: 'tpl5-5',
      type: 'communicationNode',
      position: { x: 1100, y: 100 },
      data: { 
        label: 'Sequência Nutrição',
        nodeType: 'sequence',
        url: '',
        meta: 280,
        color: '#6366F1',
      },
    },
    {
      id: 'tpl5-6',
      type: 'eventNode',
      position: { x: 1100, y: 300 },
      data: { 
        label: 'Segmentação',
        nodeType: 'segment',
        url: '',
        meta: 280,
        color: '#F59E0B',
      },
    },
    {
      id: 'tpl5-7',
      type: 'pageNode',
      position: { x: 1350, y: 200 },
      data: { 
        label: 'Página de Vendas',
        nodeType: 'sales',
        url: '/vendas',
        meta: 150,
        color: '#10B981',
      },
    },
    {
      id: 'tpl5-8',
      type: 'eventNode',
      position: { x: 1600, y: 200 },
      data: { 
        label: 'Cliente',
        nodeType: 'customer',
        url: '',
        meta: 45,
        color: '#10B981',
      },
    },
  ],
  edges: [
    { id: 'tpl5-e1', source: 'tpl5-1', target: 'tpl5-2', type: 'smoothstep' },
    { id: 'tpl5-e2', source: 'tpl5-2', target: 'tpl5-3', type: 'smoothstep' },
    { id: 'tpl5-e3', source: 'tpl5-3', target: 'tpl5-4', type: 'smoothstep' },
    { id: 'tpl5-e4', source: 'tpl5-4', target: 'tpl5-5', type: 'smoothstep' },
    { id: 'tpl5-e5', source: 'tpl5-4', target: 'tpl5-6', type: 'smoothstep' },
    { id: 'tpl5-e6', source: 'tpl5-5', target: 'tpl5-7', type: 'smoothstep' },
    { id: 'tpl5-e7', source: 'tpl5-6', target: 'tpl5-7', type: 'smoothstep' },
    { id: 'tpl5-e8', source: 'tpl5-7', target: 'tpl5-8', type: 'smoothstep' },
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
