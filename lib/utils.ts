import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPlaceholderImage(category?: string, title?: string, description?: string): string {
  const normCategory = (category || '').toLowerCase();
  const normTitle = (title || '').toLowerCase();
  const normDesc = (description || '').toLowerCase();

  const combined = `${normCategory} ${normTitle} ${normDesc}`;

  if (combined.includes('water') || combined.includes('leak') || combined.includes('flood') || combined.includes('pipe')) {
    // Water Leakage
    return 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=640&q=80';
  }
  if (combined.includes('electric') || combined.includes('power') || combined.includes('hazard') || combined.includes('wire') || combined.includes('grid')) {
    // Electrical Hazard
    return 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=640&q=80';
  }
  if (combined.includes('light') || combined.includes('streetlamp') || combined.includes('streetlight') || combined.includes('lamp')) {
    // Streetlight
    return 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=640&q=80';
  }
  if (combined.includes('garbage') || combined.includes('trash') || combined.includes('waste') || combined.includes('bin') || combined.includes('dump') || combined.includes('litter')) {
    // Garbage
    return 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=640&q=80';
  }
  if (combined.includes('tree') || combined.includes('branch') || combined.includes('forest') || combined.includes('park') || combined.includes('plant')) {
    // Trees
    return 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=640&q=80';
  }
  if (combined.includes('animal') || combined.includes('dog') || combined.includes('cat') || combined.includes('pet') || combined.includes('wildlife') || combined.includes('stray')) {
    // Animals
    return 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=640&q=80';
  }
  if (combined.includes('construct') || combined.includes('building') || combined.includes('renovate') || combined.includes('worker') || combined.includes('site')) {
    // Construction
    return 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=640&q=80';
  }
  if (combined.includes('safety') || combined.includes('emergency') || combined.includes('police') || combined.includes('fire') || combined.includes('smoke')) {
    // Public Safety / Emergency
    return 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=640&q=80';
  }
  if (combined.includes('road') || combined.includes('pothole') || combined.includes('street') || combined.includes('damage') || combined.includes('asphalt') || combined.includes('concrete')) {
    // Road Damage
    return 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=640&q=80';
  }

  // Default to general utility/safety placeholder
  return 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=640&q=80';
}

