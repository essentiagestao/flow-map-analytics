import { Handle, Position, NodeResizer } from '@xyflow/react';
import { NodeIcon } from './NodeIcon';
import { getNodeConfig } from './nodeTypes';
import { AddNodeHandle } from './AddNodeHandle';

interface EventNodeProps {
  id: string;
  data: {
    label: string;
    nodeType: string;
    width?: number;
    height?: number;
  };
  selected: boolean;
}

export const EventNode = ({ id, data, selected }: EventNodeProps) => {
  const config = getNodeConfig(data.nodeType);
  const size = data.width || 56;

  const handleClass = `
    !w-4 !h-4 !rounded-full !border-2 
    !bg-card !border-muted-foreground/40
    hover:!bg-primary hover:!border-primary hover:!scale-150
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
        style={{ left: -6, top: '50%' }}
      />
      
      {/* Diamond shape container */}
      <div
        className={`
          w-full h-full flex items-center justify-center
          cursor-pointer transition-all duration-200
          hover:scale-105
          ${selected ? 'drop-shadow-lg' : ''}
        `}
      >
        {/* Diamond background */}
        <div
          className={`
            absolute rotate-45 rounded-sm
            border-2 shadow-md transition-all duration-200
            ${selected ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
          `}
          style={{ 
            width: size * 0.8,
            height: size * 0.8,
            backgroundColor: config?.bgColor || '#FEE2E2',
            borderColor: config?.borderColor || '#EF4444',
          }}
        />
        
        {/* Icon (not rotated) */}
        <div className="relative z-10">
          <NodeIcon 
            iconName={config?.icon || 'FaUserPlus'} 
            className="drop-shadow-sm"
            style={{ 
              color: config?.color || '#EF4444',
              width: `${size * 0.35}px`,
              height: `${size * 0.35}px`,
            }}
          />
        </div>
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
        style={{ right: -6, top: '50%' }}
      />
      
      <div className={`${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
        <AddNodeHandle nodeId={id} position={Position.Right} currentNodeType={data.nodeType} />
      </div>
    </div>
  );
};
