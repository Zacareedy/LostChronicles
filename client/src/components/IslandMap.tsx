import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { playSound } from '@/lib/audio';
import plainIslandMap from '@/assets/island_maps/plain_lost_map.jpeg';
import '@/styles/map-effects.css';

const IslandMap: React.FC = () => {
  const [coordinates] = useState('--° --′ --″ N, --° --′ --″ W');
  const [mapStatus] = useState('SCANNING FOR SIGNALS...');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 });
  const [mapZoom, setMapZoom] = useState(1);
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 2.5;

  const handleMapMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartDragPos({ x: e.clientX - mapOffset.x, y: e.clientY - mapOffset.y });
  };

  const clampOffset = (offset: { x: number; y: number }, zoom: number) => {
    if (!mapContainerRef.current) return offset;
    
    const container = mapContainerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const maxOffsetX = (containerWidth * (zoom - 1)) / 2;
    const maxOffsetY = (containerHeight * (zoom - 1)) / 2;
    
    return {
      x: Math.max(-maxOffsetX, Math.min(maxOffsetX, offset.x)),
      y: Math.max(-maxOffsetY, Math.min(maxOffsetY, offset.y))
    };
  };

  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newOffset = {
      x: e.clientX - startDragPos.x,
      y: e.clientY - startDragPos.y
    };
    setMapOffset(clampOffset(newOffset, mapZoom));
  };

  const handleMapMouseUp = () => {
    setIsDragging(false);
  };

  const handleMapZoomIn = () => {
    if (mapZoom < MAX_ZOOM) {
      setMapZoom(prev => Math.min(MAX_ZOOM, prev + 0.1));
      playSound('beep', 'short');
    }
  };

  const handleMapZoomOut = () => {
    if (mapZoom > MIN_ZOOM) {
      const newZoom = Math.max(MIN_ZOOM, mapZoom - 0.1);
      setMapZoom(newZoom);
      playSound('beep', 'short');
      setMapOffset(prev => clampOffset(prev, newZoom));
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="dharma-panel shadow-[0_0_15px_rgba(0,255,0,0.15)] relative"
    >
      <div className="dharma-panel-header border-b-2 border-[hsla(var(--dharma-green),0.3)] bg-[hsla(var(--dharma-green),0.1)]">
        <h2 className="dharma-panel-title text-[hsl(var(--dharma-green))]">ISLAND MAP</h2>
        <div className="flex space-x-2">
          <button 
            onClick={handleMapZoomIn}
            className="w-6 h-6 flex items-center justify-center bg-[hsla(var(--dharma-gray),0.2)] text-[hsl(var(--dharma-green))] hover:bg-[hsla(var(--dharma-gray),0.3)]"
          >+</button>
          <button 
            onClick={handleMapZoomOut}
            className="w-6 h-6 flex items-center justify-center bg-[hsla(var(--dharma-gray),0.2)] text-[hsl(var(--dharma-green))] hover:bg-[hsla(var(--dharma-gray),0.3)]"
          >-</button>
        </div>
      </div>

      <div className="p-4 relative aspect-[4/3] w-full">
        <div 
          className="absolute inset-4 rounded overflow-hidden border border-[hsla(var(--dharma-gray),0.3)] bg-black"
          ref={mapContainerRef}
          onMouseDown={handleMapMouseDown}
          onMouseMove={handleMapMouseMove}
          onMouseUp={handleMapMouseUp}
          onMouseLeave={handleMapMouseUp}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div className="relative w-full h-full overflow-hidden">
              <div 
                className="relative w-full h-full bg-black"
                style={{ 
                  transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${mapZoom})`,
                  willChange: 'transform',
                  transformOrigin: 'center',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
              >
                <img 
                  src={plainIslandMap} 
                  alt="LOST Island Map" 
                  className="w-full h-full object-cover select-none pointer-events-none"
                  style={{
                    filter: 'contrast(1.1) brightness(0.9)',
                  }}
                />
              </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 flex justify-between items-center text-[hsl(var(--dharma-green))] font-terminal text-[10px] tracking-tight">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--dharma-green))] animate-pulse"></span>
          <span>{mapStatus}</span>
        </div>
        <div className="font-mono">{coordinates}</div>
      </div>
    </motion.section>
  );
};

export default IslandMap;