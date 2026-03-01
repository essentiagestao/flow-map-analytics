import { useBoardStore } from '../store/boardStore';
import { StructureSidebar } from './sidebars/StructureSidebar';
import { OrganizeSidebar } from './sidebars/OrganizeSidebar';
import { CreateSidebar } from './sidebars/CreateSidebar';

export function ModeSidebar() {
  const { studioMode } = useBoardStore();

  return (
    <div className="w-56 border-r border-border bg-card shrink-0 flex flex-col h-full overflow-hidden">
      {studioMode === 'structure' && <StructureSidebar />}
      {studioMode === 'organize' && <OrganizeSidebar />}
      {studioMode === 'create' && <CreateSidebar />}
    </div>
  );
}
