/**
 * CivicHero Centralized Category-Aware Placeholder System
 * Provides contextual, high-fidelity civic photography fallbacks
 * based on category, title keywords, and description context.
 */

export interface PlaceholderMeta {
  url: string;
  altText: string;
  category: string;
  subcategory: string;
}

export const CIVIC_PLACEHOLDERS: Record<string, {
  default: string;
  alt: string;
  subtypes?: Record<string, { url: string; alt: string }>;
}> = {
  roads: {
    default: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80',
    alt: 'Municipal road maintenance and asphalt condition report',
    subtypes: {
      pothole: {
        url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80',
        alt: 'Roadway asphalt pothole and surface fracture',
      },
      barrier: {
        url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
        alt: 'Traffic detour safety barriers and caution cones',
      },
      damage: {
        url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
        alt: 'Damaged pavement and pedestrian curb hazard',
      },
    },
  },
  water: {
    default: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80',
    alt: 'Municipal water utility infrastructure',
    subtypes: {
      leak: {
        url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80',
        alt: 'Pressurized water pipeline leak and municipal main defect',
      },
      flood: {
        url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
        alt: 'Street water pooling and stormwater drain overflow',
      },
      drain: {
        url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
        alt: 'Municipal storm drain and civic water asset',
      },
    },
  },
  sanitation: {
    default: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
    alt: 'Public sanitation and waste management site',
    subtypes: {
      bin: {
        url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
        alt: 'Overflowing neighborhood waste container and recycling bin',
      },
      waste: {
        url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
        alt: 'Community waste collection and disposal point',
      },
      clean: {
        url: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=800&q=80',
        alt: 'Public street sweeping and litter clearing zone',
      },
    },
  },
  electrical: {
    default: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80',
    alt: 'Municipal electrical utility installation',
    subtypes: {
      light: {
        url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80',
        alt: 'Public street light pole and illumination fixture',
      },
      transformer: {
        url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
        alt: 'Electrical transformer substation and overhead utility lines',
      },
      wire: {
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
        alt: 'Exposed utility wiring and junction box service point',
      },
    },
  },
  safety: {
    default: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    alt: 'Public safety and emergency hazard zone',
    subtypes: {
      barrier: {
        url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
        alt: 'Public caution tape and hazard exclusion zone',
      },
      emergency: {
        url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80',
        alt: 'Emergency services response and active incident coordination',
      },
    },
  },
  parks: {
    default: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
    alt: 'Public park trees and community green space',
    subtypes: {
      tree: {
        url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
        alt: 'Fallen tree branch obstructing pedestrian park path',
      },
    },
  },
  animals: {
    default: 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=800&q=80',
    alt: 'Community animal welfare and humane wildlife response',
  },
  construction: {
    default: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    alt: 'Public works infrastructure repair and construction site',
  },
  general: {
    default: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
    alt: 'Municipal civic asset and neighborhood public space',
  },
};

/**
 * Normalizes input strings and retrieves the best category match
 */
export function getCategoryPlaceholder(
  category?: string,
  title?: string,
  description?: string
): string {
  const normCategory = (category || '').toLowerCase();
  const normTitle = (title || '').toLowerCase();
  const normDesc = (description || '').toLowerCase();
  const combined = `${normCategory} ${normTitle} ${normDesc}`;

  // 1. Water
  if (combined.includes('water') || combined.includes('leak') || combined.includes('flood') || combined.includes('pipe') || combined.includes('drain') || combined.includes('sewage')) {
    if (combined.includes('flood') || combined.includes('pool') || combined.includes('rain')) {
      return CIVIC_PLACEHOLDERS.water.subtypes?.flood.url || CIVIC_PLACEHOLDERS.water.default;
    }
    if (combined.includes('drain') || combined.includes('hydrant') || combined.includes('valve')) {
      return CIVIC_PLACEHOLDERS.water.subtypes?.drain.url || CIVIC_PLACEHOLDERS.water.default;
    }
    return CIVIC_PLACEHOLDERS.water.subtypes?.leak.url || CIVIC_PLACEHOLDERS.water.default;
  }

  // 2. Electrical
  if (combined.includes('electric') || combined.includes('power') || combined.includes('light') || combined.includes('lamp') || combined.includes('wire') || combined.includes('transformer') || combined.includes('pole')) {
    if (combined.includes('light') || combined.includes('lamp') || combined.includes('streetlamp') || combined.includes('bulb')) {
      return CIVIC_PLACEHOLDERS.electrical.subtypes?.light.url || CIVIC_PLACEHOLDERS.electrical.default;
    }
    if (combined.includes('transformer') || combined.includes('grid') || combined.includes('outage')) {
      return CIVIC_PLACEHOLDERS.electrical.subtypes?.transformer.url || CIVIC_PLACEHOLDERS.electrical.default;
    }
    return CIVIC_PLACEHOLDERS.electrical.subtypes?.wire.url || CIVIC_PLACEHOLDERS.electrical.default;
  }

  // 3. Sanitation & Waste
  if (combined.includes('sanitation') || combined.includes('garbage') || combined.includes('trash') || combined.includes('waste') || combined.includes('bin') || combined.includes('dump') || combined.includes('litter') || combined.includes('clean')) {
    if (combined.includes('bin') || combined.includes('overflow') || combined.includes('container')) {
      return CIVIC_PLACEHOLDERS.sanitation.subtypes?.bin.url || CIVIC_PLACEHOLDERS.sanitation.default;
    }
    if (combined.includes('clean') || combined.includes('sweep') || combined.includes('debris')) {
      return CIVIC_PLACEHOLDERS.sanitation.subtypes?.clean.url || CIVIC_PLACEHOLDERS.sanitation.default;
    }
    return CIVIC_PLACEHOLDERS.sanitation.subtypes?.waste.url || CIVIC_PLACEHOLDERS.sanitation.default;
  }

  // 4. Safety & Emergency
  if (combined.includes('safety') || combined.includes('hazard') || combined.includes('emergency') || combined.includes('police') || combined.includes('fire') || combined.includes('smoke') || combined.includes('caution')) {
    if (combined.includes('barrier') || combined.includes('tape') || combined.includes('block')) {
      return CIVIC_PLACEHOLDERS.safety.subtypes?.barrier.url || CIVIC_PLACEHOLDERS.safety.default;
    }
    return CIVIC_PLACEHOLDERS.safety.subtypes?.emergency.url || CIVIC_PLACEHOLDERS.safety.default;
  }

  // 5. Roads & Infrastructure
  if (combined.includes('road') || combined.includes('pothole') || combined.includes('street') || combined.includes('asphalt') || combined.includes('pavement') || combined.includes('traffic') || combined.includes('curb') || combined.includes('sidewalk')) {
    if (combined.includes('barrier') || combined.includes('cone') || combined.includes('divert')) {
      return CIVIC_PLACEHOLDERS.roads.subtypes?.barrier.url || CIVIC_PLACEHOLDERS.roads.default;
    }
    if (combined.includes('damage') || combined.includes('crack') || combined.includes('hole') || combined.includes('sidewalk')) {
      return CIVIC_PLACEHOLDERS.roads.subtypes?.damage.url || CIVIC_PLACEHOLDERS.roads.default;
    }
    return CIVIC_PLACEHOLDERS.roads.subtypes?.pothole.url || CIVIC_PLACEHOLDERS.roads.default;
  }

  // 6. Parks & Trees
  if (combined.includes('tree') || combined.includes('branch') || combined.includes('park') || combined.includes('grass') || combined.includes('foliage') || combined.includes('garden')) {
    return CIVIC_PLACEHOLDERS.parks.default;
  }

  // 7. Animals
  if (combined.includes('animal') || combined.includes('dog') || combined.includes('cat') || combined.includes('pet') || combined.includes('stray') || combined.includes('wildlife')) {
    return CIVIC_PLACEHOLDERS.animals.default;
  }

  // 8. Construction
  if (combined.includes('construct') || combined.includes('building') || combined.includes('repair') || combined.includes('renovat') || combined.includes('scaffold')) {
    return CIVIC_PLACEHOLDERS.construction.default;
  }

  // Default General Civic
  return CIVIC_PLACEHOLDERS.general.default;
}

/**
 * Returns contextual descriptive alt text matching the category
 */
export function getCategoryPlaceholderAlt(
  category?: string,
  title?: string
): string {
  const normCategory = (category || '').toLowerCase();
  const normTitle = (title || '').trim();

  if (normTitle) {
    return `Civic report image for ${normTitle}`;
  }

  if (normCategory in CIVIC_PLACEHOLDERS) {
    return CIVIC_PLACEHOLDERS[normCategory].alt;
  }

  return 'Civic infrastructure condition photograph';
}

/**
 * Sanitizes and validates an image URL, safely falling back to category placeholder
 */
export function safeImageUrl(
  imageUrl?: string | null,
  category?: string,
  title?: string,
  description?: string
): string {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return getCategoryPlaceholder(category, title, description);
  }

  const trimmed = imageUrl.trim();

  // Expired or invalid blob URIs
  if (trimmed.startsWith('blob:')) {
    return getCategoryPlaceholder(category, title, description);
  }

  // Valid protocols
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('/')
  ) {
    return trimmed;
  }

  return getCategoryPlaceholder(category, title, description);
}
