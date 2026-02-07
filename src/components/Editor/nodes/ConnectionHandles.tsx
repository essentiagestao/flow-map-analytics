'use client';

import { Handle, Position } from '@xyflow/react';

interface ConnectionHandlesProps {
  showLeft?: boolean;
  showRight?: boolean;
  showTop?: boolean;
  showBottom?: boolean;
}

export const ConnectionHandles = ({ 
  showLeft = true, 
  showRight = true,
  showTop = false,
  showBottom = false,
}: ConnectionHandlesProps) => {
  const handleBaseClass = `
    !w-3 !h-3 !rounded-full !border-2 
    !bg-card !border-muted-foreground/40
    hover:!bg-primary hover:!border-primary hover:!scale-125
    !transition-all !duration-200
    !opacity-0 group-hover:!opacity-100
  `;

  return (
    <>
      {showLeft && (
        <Handle 
          type="target" 
          position={Position.Left}
          className={handleBaseClass}
          style={{ left: -6 }}
        />
      )}
      
      {showRight && (
        <Handle 
          type="source" 
          position={Position.Right}
          className={handleBaseClass}
          style={{ right: -6 }}
        />
      )}
      
      {showTop && (
        <Handle 
          type="target" 
          position={Position.Top}
          className={handleBaseClass}
          style={{ top: -6 }}
        />
      )}
      
      {showBottom && (
        <Handle 
          type="source" 
          position={Position.Bottom}
          className={handleBaseClass}
          style={{ bottom: -6 }}
        />
      )}
    </>
  );
};
