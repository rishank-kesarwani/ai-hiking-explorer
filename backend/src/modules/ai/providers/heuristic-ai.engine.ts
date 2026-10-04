import { Injectable } from '@nestjs/common';
import { Trail, TrailDifficulty } from '../../trails/schemas/trail.schema';
import { FitnessLevel } from '../../users/schemas/user.schema';
import { NlSearchDto, PlanItineraryDto, GenerateGearChecklistDto } from '../dto/ai.dto';

export interface ParsedNlIntent {
  extractedKeywords: string[];
  region?: string;
  difficulty?: TrailDifficulty;
  targetDistanceKm?: number;
  tags: string[];
  terrains: string[];
  isSunriseSuitable?: boolean;
  isSunsetSuitable?: boolean;
  hasWaterfall?: boolean;
  isDogFriendly?: boolean;
  isFamilyFriendly?: boolean;
  isCampingAllowed?: boolean;
  summaryExplanation: string;
}

@Injectable()
export class HeuristicAiEngine {
  parseNaturalLanguageQuery(query: string, userFitnessLevel?: FitnessLevel): ParsedNlIntent {
    const q = query.toLowerCase();
    const tags: string[] = [];
    const terrains: string[] = [];
    let difficulty: TrailDifficulty | undefined = undefined;
    let region: string | undefined = undefined;
    let targetDistanceKm: number | undefined = undefined;
    let isSunriseSuitable: boolean | undefined = undefined;
    let isSunsetSuitable: boolean | undefined = undefined;
    let hasWaterfall: boolean | undefined = undefined;
    let isDogFriendly: boolean | undefined = undefined;
    let isFamilyFriendly: boolean | undefined = undefined;
    let isCampingAllowed: boolean | undefined = undefined;

    // Detect regions
    if (q.includes('delhi') || q.includes('ncr') || q.includes('gurgaon') || q.includes('noida') || q.includes('aravalli')) {
      region = 'Delhi NCR';
    } else if (q.includes('himachal') || q.includes('manali') || q.includes('dharamshala') || q.includes('mcleod') || q.includes('kasol') || q.includes('triund')) {
      region = 'Himachal Pradesh';
    } else if (q.includes('maharashtra') || q.includes('mumbai') || q.includes('pune') || q.includes('sahyadri') || q.includes('lonavala')) {
      region = 'Maharashtra';
    } else if (q.includes('uttarakhand') || q.includes('rishikesh') || q.includes('mussoorie') || q.includes('dehradun')) {
      region = 'Uttarakhand';
    }

    // Detect difficulty
    if (q.includes('easy') || q.includes('beginner') || q.includes('gentle') || q.includes('simple') || q.includes('starter')) {
      difficulty = TrailDifficulty.EASY;
    } else if (q.includes('moderate') || q.includes('medium') || q.includes('intermediate')) {
      difficulty = TrailDifficulty.MODERATE;
    } else if (q.includes('hard') || q.includes('difficult') || q.includes('tough') || q.includes('strenuous') || q.includes('challenging')) {
      difficulty = TrailDifficulty.HARD;
    } else if (q.includes('expert') || q.includes('alpine') || q.includes('extreme')) {
      difficulty = TrailDifficulty.EXPERT;
    }

    // Detect distance (e.g. "5 km", "5km", "10 kilometers", "under 10km")
    const distanceMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:km|kilometer|kilometre|k)/i);
    if (distanceMatch) {
      targetDistanceKm = parseFloat(distanceMatch[1]);
    }

    // Detect tags & attributes
    if (q.includes('waterfall') || q.includes('falls') || q.includes('cascades')) {
      hasWaterfall = true;
      tags.push('Waterfall');
    }

    if (q.includes('sunrise') || q.includes('dawn') || q.includes('morning')) {
      isSunriseSuitable = true;
      tags.push('Sunrise/Sunset');
    }

    if (q.includes('sunset') || q.includes('dusk') || q.includes('evening')) {
      isSunsetSuitable = true;
      tags.push('Sunrise/Sunset');
    }

    if (q.includes('dog') || q.includes('pet') || q.includes('pup')) {
      isDogFriendly = true;
      tags.push('Dog-Friendly');
    }

    if (q.includes('family') || q.includes('kid') || q.includes('children')) {
      isFamilyFriendly = true;
      tags.push('Family-Friendly');
    }

    if (q.includes('camp') || q.includes('overnight') || q.includes('tent')) {
      isCampingAllowed = true;
      tags.push('Camping');
    }

    if (q.includes('scenic') || q.includes('view') || q.includes('vista') || q.includes('panoramic') || q.includes('photo')) {
      tags.push('Scenic');
    }

    // Detect terrains
    if (q.includes('forest') || q.includes('woods') || q.includes('jungle')) terrains.push('Forest');
    if (q.includes('mountain') || q.includes('hill') || q.includes('peak')) terrains.push('Mountain');
    if (q.includes('lake') || q.includes('river') || q.includes('stream')) terrains.push('River');
    if (q.includes('rock') || q.includes('boulder') || q.includes('cliff')) terrains.push('Rocky');

    const intentDetails = [
      difficulty ? `${difficulty} difficulty` : 'any difficulty',
      region ? `in ${region}` : 'across all regions',
      targetDistanceKm ? `around ${targetDistanceKm} km` : '',
      tags.length > 0 ? `featuring ${tags.join(', ')}` : '',
    ].filter(Boolean).join(', ');

    return {
      extractedKeywords: q.split(/\s+/).filter((w) => w.length > 2),
      region,
      difficulty,
      targetDistanceKm,
      tags,
      terrains,
      isSunriseSuitable,
      isSunsetSuitable,
      hasWaterfall,
      isDogFriendly,
      isFamilyFriendly,
      isCampingAllowed,
      summaryExplanation: `Interpreted query looking for ${intentDetails}. Matches filtered with confidence scoring.`,
    };
  }

  generateItinerary(trail: Trail, dto: PlanItineraryDto) {
    const fitness = dto.fitnessLevel || FitnessLevel.INTERMEDIATE;
    let paceMultiplier = 1.0;
    if (fitness === FitnessLevel.BEGINNER) paceMultiplier = 1.35;
    else if (fitness === FitnessLevel.ADVANCED) paceMultiplier = 0.85;
    else if (fitness === FitnessLevel.EXPERT) paceMultiplier = 0.7;

    const baseDurationMin = trail.estimatedDurationMin || 120;
    const adjustedDurationMin = Math.round(baseDurationMin * paceMultiplier);
    const startHour = dto.preferredStartTime ? parseInt(dto.preferredStartTime.split(':')[0], 10) : 7;
    const startMin = dto.preferredStartTime ? parseInt(dto.preferredStartTime.split(':')[1], 10) || 0 : 0;

    const timeline = [];
    let currentMin = startHour * 60 + startMin;

    const formatTime = (totalMinutes: number) => {
      const h = Math.floor(totalMinutes / 60) % 24;
      const m = totalMinutes % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 === 0 ? 12 : h % 12;
      return `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    // Step 1: Trailhead Briefing
    timeline.push({
      time: formatTime(currentMin),
      title: 'Trailhead Arrival & Gear Check',
      description: `Arrive at ${trail.title} starting point. Inspect laces, calibrate GPS / map, check water reserves (${fitness === FitnessLevel.BEGINNER ? '2.0L' : '1.5L'} recommended).`,
      durationMin: 15,
      type: 'start',
    });
    currentMin += 15;

    // Step 2: Outbound Ascent / First Segment
    const waypoints = trail.waypoints || [];
    if (waypoints.length > 0) {
      const segmentDuration = Math.round((adjustedDurationMin * 0.45) / waypoints.length);
      waypoints.forEach((wp, idx) => {
        timeline.push({
          time: formatTime(currentMin),
          title: `Waypoint: ${wp.title}`,
          description: wp.description || `Reach waypoint at ${wp.elevationM}m elevation. Hydrate and check trail pulse.`,
          durationMin: segmentDuration,
          elevationM: wp.elevationM,
          type: 'waypoint',
        });
        currentMin += segmentDuration;
      });
    } else {
      const midDuration = Math.round(adjustedDurationMin * 0.45);
      timeline.push({
        time: formatTime(currentMin),
        title: 'Midpoint Scenic Rest',
        description: `Reach peak elevation (${trail.highestPointM || 300}m). Enjoy 360-degree panorama, rest muscles, and take nutrition.`,
        durationMin: midDuration,
        type: 'summit',
      });
      currentMin += midDuration;
    }

    // Step 3: Summit / Peak Halt
    timeline.push({
      time: formatTime(currentMin),
      title: 'Summit Break & Photography',
      description: 'Relax at highest vantage point. Capture views, replenish electrolytes, and review return path.',
      durationMin: 30,
      type: 'rest',
    });
    currentMin += 30;

    // Step 4: Return Descent
    const returnDuration = Math.round(adjustedDurationMin * 0.4);
    timeline.push({
      time: formatTime(currentMin),
      title: 'Steady Descent / Final Return Segment',
      description: 'Controlled descent. Watch footing on loose gravel and maintain rhythmic breathing.',
      durationMin: returnDuration,
      type: 'descent',
    });
    currentMin += returnDuration;

    // Step 5: Hike Completion
    timeline.push({
      time: formatTime(currentMin),
      title: 'Hike Completion & Post-Trail Recovery',
      description: 'Return to trailhead base. Stretch calves and hamstrings, log trail stats, and celebrate completion!',
      durationMin: 10,
      type: 'finish',
    });

    const recommendedWaterLiters = Math.round(((trail.distanceKm * 0.25) + (adjustedDurationMin / 180)) * 10) / 10;

    return {
      trailTitle: trail.title,
      hikingDate: dto.hikingDate || new Date().toISOString().split('T')[0],
      startTime: formatTime(startHour * 60 + startMin),
      estimatedTotalDurationHours: (adjustedDurationMin / 60).toFixed(1),
      fitnessAdjustment: `Pacing optimized for ${fitness} level (${paceMultiplier}x base pace)`,
      recommendedWaterLiters: Math.max(1.5, recommendedWaterLiters),
      estimatedCaloriesBurned: Math.round(trail.distanceKm * 65 + trail.elevationGainM * 0.5),
      timeline,
      safetyChecklist: [
        'Download offline maps before departing trailhead',
        'Check local weather forecast 2 hours prior to departure',
        'Inform a contact person with your expected return time',
        'Carry emergency whistle, basic first aid, and headlamp',
      ],
      aiReasoning: `Generated customized pacing for ${fitness} hiker traversing ${trail.distanceKm} km with +${trail.elevationGainM}m elevation gain. Schedule ensures daylight buffer and steady aerobic pacing.`,
      disclaimer: 'AI-generated itineraries are estimates based on standard trail metrics and do not replace situational awareness, fitness judgment, or real-time trail condition assessments.',
    };
  }

  generateGearChecklist(trail: Trail, dto: GenerateGearChecklistDto) {
    const essential = [
      { item: 'Appropriate Footwear (Grippy trail shoes / boots)', category: 'Footwear', required: true },
      { item: `Hydration (${trail.distanceKm > 8 ? '2.5L Water' : '1.5L Water'})`, category: 'Hydration', required: true },
      { item: 'Trail Snacks & Electrolyte tabs', category: 'Nutrition', required: true },
      { item: 'Compact First Aid Kit & Blister Plasters', category: 'Safety', required: true },
      { item: 'Fully Charged Phone & Offline Trail Map', category: 'Navigation', required: true },
      { item: 'UV Protection Sunglasses & SPF 50 Sunscreen', category: 'Sun Protection', required: true },
      { item: 'Emergency Whistle & Mini Multi-tool', category: 'Safety', required: true },
    ];

    const weatherAndTerrain = [];
    if (trail.elevationGainM > 500 || trail.difficulty === TrailDifficulty.HARD || trail.difficulty === TrailDifficulty.EXPERT) {
      weatherAndTerrain.push({ item: 'Lightweight Trekking Poles', category: 'Equipment', required: true });
      weatherAndTerrain.push({ item: 'Breathable Windbreaker / Shell Jacket', category: 'Clothing', required: true });
      weatherAndTerrain.push({ item: 'Headlamp with extra batteries', category: 'Safety', required: true });
    }

    if (trail.hasWaterfall || trail.terrains?.includes('River') || trail.terrains?.includes('Waterfall')) {
      weatherAndTerrain.push({ item: 'Waterproof Dry Bag for electronics', category: 'Gear', required: false });
      weatherAndTerrain.push({ item: 'Quick-dry microfiber towel', category: 'Comfort', required: false });
      weatherAndTerrain.push({ item: 'Extra pair of dry socks', category: 'Clothing', required: true });
    }

    const campingAndGroup = [];
    if (dto.isOvernightCamping || trail.isCampingAllowed) {
      campingAndGroup.push({ item: 'Ultralight Tent / Bivy Shelter', category: 'Shelter', required: true });
      campingAndGroup.push({ item: 'Sleeping Bag rated to 5°C & Sleeping Pad', category: 'Camp Comfort', required: true });
      campingAndGroup.push({ item: 'Camp Stove, Fuel & Camp Cookware', category: 'Camp Cooking', required: true });
      campingAndGroup.push({ item: 'Water Filtration System / Purification Tablets', category: 'Hydration', required: true });
      campingAndGroup.push({ item: 'Trash bags (Leave No Trace policy)', category: 'Environment', required: true });
    }

    if (dto.hasDog || trail.isDogFriendly) {
      campingAndGroup.push({ item: 'Collapsible Dog Water Bowl & Extra Dog Water (1L)', category: 'Pet Care', required: true });
      campingAndGroup.push({ item: 'Dog Leash & Harness with safety tag', category: 'Pet Care', required: true });
      campingAndGroup.push({ item: 'Pet First Aid (Tick remover, antiseptic wipes)', category: 'Pet Care', required: true });
    }

    return {
      trailTitle: trail.title,
      totalItemsCount: essential.length + weatherAndTerrain.length + campingAndGroup.length,
      categories: {
        essentials: essential,
        terrainAndWeather: weatherAndTerrain,
        campingAndSpecial: campingAndGroup,
      },
      aiNote: `Checklist tailored for ${trail.title} (${trail.difficulty}, ${trail.distanceKm} km, +${trail.elevationGainM}m elevation).`,
      disclaimer: 'Always adapt gear based on present environmental conditions and personal health needs.',
    };
  }

  explainTrailDifficulty(trail: Trail, fitness: FitnessLevel = FitnessLevel.INTERMEDIATE) {
    const factors = [];

    if (trail.distanceKm > 10) {
      factors.push(`Length (${trail.distanceKm} km): Requires sustained cardiovascular endurance`);
    } else {
      factors.push(`Manageable distance (${trail.distanceKm} km): Achievable within half a day`);
    }

    if (trail.elevationGainM > 600) {
      factors.push(`Steep ascent (+${trail.elevationGainM}m): Requires strong leg strength and proper pacing`);
    } else if (trail.elevationGainM > 200) {
      factors.push(`Moderate rolling hills (+${trail.elevationGainM}m): Good aerobic workout`);
    } else {
      factors.push(`Gentle terrain (+${trail.elevationGainM}m): Low joint impact and beginner accessible`);
    }

    if (trail.terrains?.includes('Rocky') || trail.terrains?.includes('Alpine')) {
      factors.push('Technical footing: Uneven rocky surfaces require stable ankle-support boots');
    }

    let userFitSummary = '';
    if (fitness === FitnessLevel.BEGINNER && (trail.difficulty === TrailDifficulty.HARD || trail.difficulty === TrailDifficulty.EXPERT)) {
      userFitSummary = '⚠️ High Challenge Warning: This trail significantly exceeds beginner thresholds. Consider building endurance on easier routes first or going with an experienced guide.';
    } else if (fitness === FitnessLevel.BEGINNER && trail.difficulty === TrailDifficulty.EASY) {
      userFitSummary = '✅ Excellent Match: Perfectly matched for beginner fitness with gentle slopes and well-defined pathways.';
    } else if (fitness === FitnessLevel.EXPERT) {
      userFitSummary = '🏃 Fast & Aerobic: Fast-paced or easily completed; great for trail running or active training.';
    } else {
      userFitSummary = '🎯 Recommended: A solid, rewarding hike matching your fitness profile with standard precautions.';
    }

    return {
      trailDifficulty: trail.difficulty,
      userFitnessLevel: fitness,
      estimatedPace: fitness === FitnessLevel.BEGINNER ? '4.0 km/h (relaxed)' : fitness === FitnessLevel.EXPERT ? '6.0 km/h (brisk)' : '4.8 km/h (moderate)',
      analysisFactors: factors,
      recommendationSummary: userFitSummary,
      disclaimer: 'Difficulty ratings are subjective approximations. Individual fatigue, weather changes, and hydration dramatically affect trail difficulty.',
    };
  }
}
