import { Handle, Position, NodeResizer } from '@xyflow/react';
import { NodeIcon } from './NodeIcon';
import { getNodeConfig } from './nodeTypes';
import { AddNodeHandle } from './AddNodeHandle';

interface CommunicationNodeProps {
  id: string;
  data: {
    label: string;
    nodeType: string;
    width?: number;
    height?: number;
  };
  selected: boolean;
}

export const CommunicationNode = ({ id, data, selected }: CommunicationNodeProps) => {
  const config = getNodeConfig(data.nodeType);
  const bgColor = config?.bgColor || '#3B82F6';
  const size = data.width || 56;

  const handleClass = `
    !w-3 !h-3 !rounded-full !border-2 
    !bg-card !border-muted-foreground/40
    hover:!bg-primary hover:!border-primary hover:!scale-125
    !transition-all !duration-200
    ${selected ? '!opacity-100' : '!opacity-0 group-hover:!opacity-100'}
  `;

  return (
    <div className="relative group" style={{ width: size, height: size }}>
      <NodeResizer 
        minWidth={40}
        minHeight={40}
        maxWidth={100}
        maxHeight={100}
        keepAspectRatio
        isVisible={selected}
        lineClassName="!border-primary !border-2"
        handleClassName="!w-2.5 !h-2.5 !bg-primary !border-2 !border-background !rounded-sm"
      />
      
      {/* Connection handles - visible on hover */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className={handleClass}
        style={{ left: -6 }}
      />
      
      <div
        className={`
          w-full h-full rounded-full flex items-center justify-center
          shadow-md cursor-pointer transition-all duration-200
          hover:shadow-xl hover:scale-105
          ${selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg' : ''}
        `}
        style={{ backgroundColor: bgColor }}
      >
        <NodeIcon 
          iconName={config?.icon || 'FaEnvelope'} 
          className="text-white drop-shadow-sm"
          style={{ width: `${size * 0.4}px`, height: `${size * 0.4}px` }}
        />
      </div>
      
      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
        <span className="text-xs font-medium text-foreground bg-card px-2 py-1 rounded-md shadow-sm border border-border">
          {data.label}
        </span>
      </div>
      
      {/* Connection handles - visible on hover */}
      <Handle 
        type="source" 
        position={Position.Right} 
        className={handleClass}
        style={{ right: -6 }}
      />
      
      <div className={`${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
        <AddNodeHandle nodeId={id} position={Position.Right} currentNodeType={data.nodeType} />
      </div>
    </div>
  );
};
