// Node type definitions matching Funnelytics style

export type NodeCategory = 'traffic' | 'page' | 'communication' | 'event';

export interface NodeTypeConfig {
  id: string;
  label: string;
  category: NodeCategory;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string; // Icon component name
  description: string;
}

// Traffic sources - Circular nodes with brand colors
export const trafficNodes: NodeTypeConfig[] = [
  {
    id: 'facebook',
    label: 'Facebook Ads',
    category: 'traffic',
    color: '#1877F2',
    bgColor: '#1877F2',
    borderColor: '#1877F2',
    icon: 'FaFacebookF',
    description: 'Anúncios do Facebook'
  },
  {
    id: 'instagram',
    label: 'Instagram Ads',
    category: 'traffic',
    color: '#E4405F',
    bgColor: 'linear-gradient(45deg, #F58529, #DD2A7B, #8134AF)',
    borderColor: '#E4405F',
    icon: 'FaInstagram',
    description: 'Anúncios do Instagram'
  },
  {
    id: 'tiktok',
    label: 'TikTok Ads',
    category: 'traffic',
    color: '#000000',
    bgColor: '#000000',
    borderColor: '#000000',
    icon: 'FaTiktok',
    description: 'Anúncios do TikTok'
  },
  {
    id: 'youtube',
    label: 'YouTube Ads',
    category: 'traffic',
    color: '#FF0000',
    bgColor: '#FF0000',
    borderColor: '#FF0000',
    icon: 'FaYoutube',
    description: 'Anúncios do YouTube'
  },
  {
    id: 'linkedin',
    label: 'LinkedIn Ads',
    category: 'traffic',
    color: '#0A66C2',
    bgColor: '#0A66C2',
    borderColor: '#0A66C2',
    icon: 'FaLinkedinIn',
    description: 'Anúncios do LinkedIn'
  },
  {
    id: 'google',
    label: 'Google Ads',
    category: 'traffic',
    color: '#EA4335',
    bgColor: '#EA4335',
    borderColor: '#EA4335',
    icon: 'FaGoogle',
    description: 'Google Ads / Search'
  },
  {
    id: 'organic',
    label: 'Tráfego Orgânico',
    category: 'traffic',
    color: '#10B981',
    bgColor: '#10B981',
    borderColor: '#10B981',
    icon: 'FaSearch',
    description: 'SEO / Busca orgânica'
  },
  {
    id: 'affiliate',
    label: 'Afiliados',
    category: 'traffic',
    color: '#8B5CF6',
    bgColor: '#8B5CF6',
    borderColor: '#8B5CF6',
    icon: 'FaUsers',
    description: 'Marketing de afiliados'
  },
];

// Pages - Rectangular nodes with preview style
export const pageNodes: NodeTypeConfig[] = [
  {
    id: 'landing',
    label: 'Landing Page',
    category: 'page',
    color: '#6366F1',
    bgColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    icon: 'FaFileAlt',
    description: 'Página de captura'
  },
  {
    id: 'sales',
    label: 'Página de Vendas',
    category: 'page',
    color: '#10B981',
    bgColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    icon: 'FaShoppingCart',
    description: 'Página de oferta'
  },
  {
    id: 'webinar',
    label: 'Webinar',
    category: 'page',
    color: '#F59E0B',
    bgColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    icon: 'FaVideo',
    description: 'Registro de webinar'
  },
  {
    id: 'checkout',
    label: 'Checkout',
    category: 'page',
    color: '#EF4444',
    bgColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    icon: 'FaCreditCard',
    description: 'Página de pagamento'
  },
  {
    id: 'thankyou',
    label: 'Thank You',
    category: 'page',
    color: '#10B981',
    bgColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    icon: 'FaCheck',
    description: 'Página de confirmação'
  },
  {
    id: 'blog',
    label: 'Blog Post',
    category: 'page',
    color: '#8B5CF6',
    bgColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    icon: 'FaPenFancy',
    description: 'Artigo do blog'
  },
  {
    id: 'calendar',
    label: 'Calendário',
    category: 'page',
    color: '#3B82F6',
    bgColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    icon: 'FaCalendarAlt',
    description: 'Agendamento'
  },
  {
    id: 'survey',
    label: 'Pesquisa',
    category: 'page',
    color: '#EC4899',
    bgColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    icon: 'FaClipboardList',
    description: 'Formulário/Quiz'
  },
];

// Communication - Circular blue nodes
export const communicationNodes: NodeTypeConfig[] = [
  {
    id: 'email',
    label: 'E-mail',
    category: 'communication',
    color: '#3B82F6',
    bgColor: '#3B82F6',
    borderColor: '#3B82F6',
    icon: 'FaEnvelope',
    description: 'E-mail único'
  },
  {
    id: 'sequence',
    label: 'Sequência',
    category: 'communication',
    color: '#6366F1',
    bgColor: '#6366F1',
    borderColor: '#6366F1',
    icon: 'FaLayerGroup',
    description: 'Sequência de e-mails'
  },
  {
    id: 'sms',
    label: 'SMS',
    category: 'communication',
    color: '#10B981',
    bgColor: '#10B981',
    borderColor: '#10B981',
    icon: 'FaSms',
    description: 'Mensagem SMS'
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    category: 'communication',
    color: '#25D366',
    bgColor: '#25D366',
    borderColor: '#25D366',
    icon: 'FaWhatsapp',
    description: 'Mensagem WhatsApp'
  },
];

// Events - Diamond shaped nodes
export const eventNodes: NodeTypeConfig[] = [
  {
    id: 'lead',
    label: 'Lead',
    category: 'event',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    borderColor: '#EF4444',
    icon: 'FaUserPlus',
    description: 'Novo lead capturado'
  },
  {
    id: 'customer',
    label: 'Cliente',
    category: 'event',
    color: '#10B981',
    bgColor: '#D1FAE5',
    borderColor: '#10B981',
    icon: 'FaDollarSign',
    description: 'Conversão em cliente'
  },
  {
    id: 'upsell',
    label: 'Upsell',
    category: 'event',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    borderColor: '#8B5CF6',
    icon: 'FaArrowUp',
    description: 'Venda adicional'
  },
  {
    id: 'lost',
    label: 'Perdido',
    category: 'event',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    borderColor: '#6B7280',
    icon: 'FaTimes',
    description: 'Lead/cliente perdido'
  },
  {
    id: 'segment',
    label: 'Segmento',
    category: 'event',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    borderColor: '#F59E0B',
    icon: 'FaFilter',
    description: 'Segmentação'
  },
  {
    id: 'crm',
    label: 'CRM',
    category: 'event',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    borderColor: '#3B82F6',
    icon: 'FaDatabase',
    description: 'Entrada no CRM'
  },
  {
    id: 'comercial',
    label: 'Comercial',
    category: 'event',
    color: '#0EA5E9',
    bgColor: '#E0F2FE',
    borderColor: '#0EA5E9',
    icon: 'FaPhone',
    description: 'Contato comercial'
  },
  {
    id: 'proposta',
    label: 'Proposta Comercial',
    category: 'event',
    color: '#F97316',
    bgColor: '#FFF7ED',
    borderColor: '#F97316',
    icon: 'FaFileContract',
    description: 'Envio de proposta comercial'
  },
  {
    id: 'agendamento',
    label: 'Agendamento',
    category: 'event',
    color: '#6366F1',
    bgColor: '#EEF2FF',
    borderColor: '#6366F1',
    icon: 'FaCalendarCheck',
    description: 'Reunião ou visita agendada'
  },
  {
    id: 'visita',
    label: 'Visita Presencial',
    category: 'event',
    color: '#14B8A6',
    bgColor: '#CCFBF1',
    borderColor: '#14B8A6',
    icon: 'FaMapMarkerAlt',
    description: 'Visita presencial ao cliente'
  },
];

export const allNodeTypes = [
  ...trafficNodes,
  ...pageNodes,
  ...communicationNodes,
  ...eventNodes,
];

export const getNodeConfig = (nodeType: string): NodeTypeConfig | undefined => {
  return allNodeTypes.find(n => n.id === nodeType);
};

export const categoryLabels: Record<NodeCategory, string> = {
  traffic: 'Fontes de Tráfego',
  page: 'Páginas & Conteúdo',
  communication: 'E-mail & Comunicação',
  event: 'Eventos & Conversões',
};
