import React from 'react';
import Teemane from './Teemane';

/**
 * EmptyState — Empty list / no data illustration with Teemane mascot
 * Props: title, description, action (node), pose
 */
export const EmptyState = ({
  title = 'Nothing here yet',
  description = '',
  action = null,
  pose = 'thinking',
  size = 120,
}) => (
  <div className="flex flex-col items-center justify-center text-center py-12 px-6 gap-5">
    <Teemane pose={pose} size={size} animate />
    <div className="flex flex-col gap-2 max-w-xs">
      <h3 className="font-display font-bold text-sm text-white">{title}</h3>
      {description && (
        <p className="text-xs text-zinc-400 font-sans leading-relaxed">{description}</p>
      )}
    </div>
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export default EmptyState;
