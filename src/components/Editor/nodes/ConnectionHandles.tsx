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
    !w-4 !h-4 !rounded-full !border-2 
    !bg-card !border-muted-foreground/40
    hover:!bg-primary hover:!border-primary hover:!scale-125
    !transition-all !duration-200
    !opacity-0 group-hover:!opacity-100
  `;

  // Invisible larger hit area behind the visual handle
  const hitAreaClass = `
    !w-8 !h-8 !rounded-full !border-0 
    !bg-transparent
    !opacity-0
  `;

  return (
    <>
      {showLeft && (
        <>
          <Handle 
            type="target" 
            position={Position.Left}
            id="left-hit"
            className={hitAreaClass}
            style={{ left: -16, zIndex: 1 }}
          />
          <Handle 
            type="target" 
            position={Position.Left}
            className={handleBaseClass}
            style={{ left: -8, zIndex: 2, pointerEvents: 'none' }}
          />
        </>
      )}
      
      {showRight && (
        <>
          <Handle 
            type="source" 
            position={Position.Right}
            id="right-hit"
            className={hitAreaClass}
            style={{ right: -16, zIndex: 1 }}
          />
          <Handle 
            type="source" 
            position={Position.Right}
            className={handleBaseClass}
            style={{ right: -8, zIndex: 2, pointerEvents: 'none' }}
          />
        </>
      )}
      
      {showTop && (
        <>
          <Handle 
            type="target" 
            position={Position.Top}
            id="top-hit"
            className={hitAreaClass}
            style={{ top: -16, zIndex: 1 }}
          />
          <Handle 
            type="target" 
            position={Position.Top}
            className={handleBaseClass}
            style={{ top: -8, zIndex: 2, pointerEvents: 'none' }}
          />
        </>
      )}
      
      {showBottom && (
        <>
          <Handle 
            type="source" 
            position={Position.Bottom}
            id="bottom-hit"
            className={hitAreaClass}
            style={{ bottom: -16, zIndex: 1 }}
          />
          <Handle 
            type="source" 
            position={Position.Bottom}
            className={handleBaseClass}
            style={{ bottom: -8, zIndex: 2, pointerEvents: 'none' }}
          />
        </>
      )}
    </>
  );
};
