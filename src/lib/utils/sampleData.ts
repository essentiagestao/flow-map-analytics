import { Node, Edge } from '@xyflow/react';

export const getSampleFunnel = () => {
  const nodes: Node[] = [
    {
      id: 'sample-1',
      type: 'custom',
      position: { x: 100, y: 100 },
      data: { 
        label: 'Anúncio Facebook',
        nodeType: 'ad',
        url: 'https://facebook.com/ads/123',
        meta: 1000,
        color: 'blue',
        tags: 'marketing,facebook'
      },
    },
    {
      id: 'sample-2',
      type: 'custom',
      position: { x: 350, y: 100 },
      data: { 
        label: 'Landing Page',
        nodeType: 'page',
        url: 'https://exemplo.com/lp',
        meta: 500,
        color: 'green',
        tags: 'conversao,landing'
      },
    },
    {
      id: 'sample-3',
      type: 'custom',
      position: { x: 600, y: 100 },
      data: { 
        label: 'Formulário Contato',
        nodeType: 'form',
        url: '/contato',
        meta: 100,
        color: 'purple',
        tags: 'lead,formulario'
      },
    },
    {
      id: 'sample-4',
      type: 'custom',
      position: { x: 850, y: 50 },
      data: { 
        label: 'Aprovado?',
        nodeType: 'decision',
        url: '',
        meta: 80,
        color: 'yellow',
        tags: 'decisao,qualificacao'
      },
    },
    {
      id: 'sample-5',
      type: 'custom',
      position: { x: 1100, y: 50 },
      data: { 
        label: 'Página Obrigado',
        nodeType: 'page',
        url: '/obrigado',
        meta: 80,
        color: 'green',
        tags: 'sucesso,conversao'
      },
    },
    {
      id: 'sample-6',
      type: 'custom',
      position: { x: 850, y: 200 },
      data: { 
        label: 'E-mail Rejeição',
        nodeType: 'email',
        url: '/email/rejeicao',
        meta: 20,
        color: 'red',
        tags: 'email,rejeicao'
      },
    },
  ];

  const edges: Edge[] = [
    { id: 'se1-2', source: 'sample-1', target: 'sample-2', type: 'smoothstep' },
    { id: 'se2-3', source: 'sample-2', target: 'sample-3', type: 'smoothstep' },
    { id: 'se3-4', source: 'sample-3', target: 'sample-4', type: 'smoothstep' },
    { id: 'se4-5', source: 'sample-4', target: 'sample-5', type: 'smoothstep', label: 'Sim' },
    { id: 'se4-6', source: 'sample-4', target: 'sample-6', type: 'smoothstep', label: 'Não' },
  ];

  return { nodes, edges };
};