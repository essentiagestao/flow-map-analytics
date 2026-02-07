import { Handle, Position, NodeResizer } from '@xyflow/react';
import { NodeIcon } from './NodeIcon';
import { getNodeConfig } from './nodeTypes';
import { AddNodeHandle } from './AddNodeHandle';

interface PageNodeProps {
  id: string;
  data: {
    label: string;
    nodeType: string;
    url?: string;
    width?: number;
    height?: number;
  };
  selected: boolean;
}

export const PageNode = ({ id, data, selected }: PageNodeProps) => {
  const config = getNodeConfig(data.nodeType);
  const width = data.width || 160;
  const height = data.height || 140;

  const handleClass = `
    !w-3 !h-3 !rounded-full !border-2 
    !bg-card !border-muted-foreground/40
    hover:!bg-primary hover:!border-primary hover:!scale-125
    !transition-all !duration-200
    ${selected ? '!opacity-100' : '!opacity-0 group-hover:!opacity-100'}
  `;

  return (
    <div className="relative group" style={{ width, height }}>
      <NodeResizer 
        minWidth={120}
        minHeight={100}
        maxWidth={400}
        maxHeight={350}
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
          w-full h-full bg-card rounded-lg shadow-md overflow-hidden
          border transition-all duration-200
          hover:shadow-xl
          ${selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg border-primary' : 'border-border'}
        `}
      >
        {/* Header bar with icon */}
        <div 
          className="h-8 flex items-center gap-2 px-3"
          style={{ backgroundColor: config?.color || '#6366F1' }}
        >
          <NodeIcon 
            iconName={config?.icon || 'FaFileAlt'} 
            className="w-3.5 h-3.5 text-white"
          />
          <span className="text-xs font-medium text-white truncate flex-1">
            {config?.label || 'Página'}
          </span>
        </div>
        
        {/* Preview area - simulating page content */}
        <div className="flex-1 p-3 space-y-2 bg-muted/30 overflow-hidden" style={{ height: height - 56 }}>
          <div className="h-2 bg-muted rounded w-full"></div>
          <div className="h-2 bg-muted rounded w-3/4"></div>
          <div className="h-6 bg-muted rounded w-full mt-2"></div>
          <div className="h-2 bg-muted rounded w-1/2"></div>
        </div>
        
        {/* Footer with label */}
        <div className="px-3 py-2 bg-card border-t border-border">
          <p className="text-xs font-medium text-foreground truncate">{data.label}</p>
          {data.url && (
            <p className="text-[10px] text-muted-foreground truncate">{data.url}</p>
          )}
        </div>
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
