import { Injectable } from '@nestjs/common';
import { ITrailDataProvider, NearbyTrailParams, TrailSearchParams } from './trail-data.interface';
import { Trail, TrailDifficulty, TrailRouteType } from '../schemas/trail.schema';
import { GeoUtil } from '../../../common/utils/geo.util';

@Injectable()
export class MockTrailDataProvider implements ITrailDataProvider {
  readonly providerName = 'Curated Mock & Sample Trail Provider';
  readonly isLiveProvider = false;

  private readonly trailsDatabase: Partial<Trail>[] = [
    {
      title: 'Aravalli Biodiversity Park Nature Loop',
      slug: 'aravalli-biodiversity-park-loop',
      description: 'A tranquil semi-arid forest trail on the southern ridge of Delhi NCR. Perfect for beginners, birdwatching, and morning walks among restored native flora.',
      region: 'Delhi NCR',
      country: 'India',
      location: {
        type: 'Point',
        coordinates: [77.1264, 28.5583], // [lng, lat]
      },
      difficulty: TrailDifficulty.EASY,
      distanceKm: 5.2,
      elevationGainM: 85,
      highestPointM: 275,
      estimatedDurationMin: 90,
      routeType: TrailRouteType.LOOP,
      terrains: ['Forest', 'Rocky', 'Meadow'],
      tags: ['Dog-Friendly', 'Family-Friendly', 'Scenic', 'Bird Watching', 'Sunrise/Sunset'],
      isDogFriendly: true,
      isFamilyFriendly: true,
      isCampingAllowed: false,
      isSunriseSuitable: true,
      isSunsetSuitable: true,
      hasWaterfall: false,
      rating: 4.6,
      reviewCount: 340,
      images: [
        'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
      ],
      waypoints: [
        {
          title: 'Vasant Vihar Entry Gate',
          description: 'Main visitor parking and information kiosk',
          coordinates: [77.1264, 28.5583],
          elevationM: 230,
          distanceFromStartKm: 0,
          type: ['rest_area'],
        },
        {
          title: 'Bat Cave Overlook',
          description: 'Restored quarried ridge with resting benches',
          coordinates: [77.128, 28.561],
          elevationM: 265,
          distanceFromStartKm: 2.1,
          type: ['viewpoint'],
        },
        {
          title: 'Central Grassland Canopy',
          description: 'Shaded path through indigenous Dhau trees',
          coordinates: [77.131, 28.557],
          elevationM: 275,
          distanceFromStartKm: 3.8,
          type: ['viewpoint', 'rest_area'],
        },
      ],
      elevationProfile: [
        { distanceKm: 0, elevationM: 230 },
        { distanceKm: 1.5, elevationM: 250 },
        { distanceKm: 2.8, elevationM: 275 },
        { distanceKm: 4.2, elevationM: 245 },
        { distanceKm: 5.2, elevationM: 230 },
      ],
      recommendedGear: ['Walking shoes / light trail shoes', '1L Water bottle', 'Sun protection hat', 'Insect repellent'],
      safetyWarnings: ['Stay on marked trails to protect sensitive flora', 'Carry hydration during warmer months (March - June)'],
      currentStatus: 'Open',
      dataSource: 'Verified Curated Dataset',
      isDemoData: true,
    },
    {
      title: 'Asola Bhatti Wildlife Sanctuary & Neelkanth Lake Trail',
      slug: 'asola-bhatti-neelkanth-lake',
      description: 'Scenic ridge hike leading to the turquoise Neelkanth Lake nestled inside the historical Bhatti mines. Excellent for morning sunrise views and spotting peacocks and deer.',
      region: 'Delhi NCR',
      country: 'India',
      location: {
        type: 'Point',
        coordinates: [77.2511, 28.4892],
      },
      difficulty: TrailDifficulty.EASY,
      distanceKm: 6.8,
      elevationGainM: 110,
      highestPointM: 290,
      estimatedDurationMin: 120,
      routeType: TrailRouteType.OUT_AND_BACK,
      terrains: ['Rocky', 'Forest', 'Lake View'],
      tags: ['Scenic', 'Family-Friendly', 'Sunrise/Sunset', 'Wildlife', 'Lake View'],
      isDogFriendly: false,
      isFamilyFriendly: true,
      isCampingAllowed: false,
      isSunriseSuitable: true,
      isSunsetSuitable: true,
      hasWaterfall: false,
      rating: 4.5,
      reviewCount: 215,
      images: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
      ],
      waypoints: [
        {
          title: 'Conservation Education Centre (CEC)',
          description: 'Sanctuary entry point with eco-briefing',
          coordinates: [77.2511, 28.4892],
          elevationM: 220,
          distanceFromStartKm: 0,
          type: ['rest_area'],
        },
        {
          title: 'Neelkanth Lake Viewpoint',
          description: 'Dramatic azure water quarry lake view',
          coordinates: [77.265, 28.478],
          elevationM: 290,
          distanceFromStartKm: 3.4,
          type: ['viewpoint'],
        },
      ],
      elevationProfile: [
        { distanceKm: 0, elevationM: 220 },
        { distanceKm: 1.8, elevationM: 260 },
        { distanceKm: 3.4, elevationM: 290 },
        { distanceKm: 5.0, elevationM: 255 },
        { distanceKm: 6.8, elevationM: 220 },
      ],
      recommendedGear: ['Grippy hiking boots', '1.5L Water bottle', 'Binoculars', 'Sunscreen'],
      safetyWarnings: ['Do not swim in the lake (steep quarry cliffs)', 'Beware of monkeys near the picnic gates'],
      currentStatus: 'Open',
      dataSource: 'Verified Curated Dataset',
      isDemoData: true,
    },
    {
      title: 'Sanjay Van Forest Heritage Walk',
      slug: 'sanjay-van-heritage-walk',
      description: 'A peaceful lush green trail wandering through 783 acres of South Delhi city forest and the medieval 12th-century ramparts of Qila Rai Pithora.',
      region: 'Delhi NCR',
      country: 'India',
      location: {
        type: 'Point',
        coordinates: [77.1725, 28.5348],
      },
      difficulty: TrailDifficulty.EASY,
      distanceKm: 4.5,
      elevationGainM: 60,
      highestPointM: 250,
      estimatedDurationMin: 75,
      routeType: TrailRouteType.LOOP,
      terrains: ['Forest', 'Heritage', 'Meadow'],
      tags: ['Dog-Friendly', 'Family-Friendly', 'Scenic', 'Historical', 'Sunrise/Sunset'],
      isDogFriendly: true,
      isFamilyFriendly: true,
      isCampingAllowed: false,
      isSunriseSuitable: true,
      isSunsetSuitable: false,
      hasWaterfall: false,
      rating: 4.4,
      reviewCount: 410,
      images: [
        'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
      ],
      waypoints: [
        {
          title: 'Qutub Institutional Gate',
          description: 'Paved trail head with drinking water fountain',
          coordinates: [77.1725, 28.5348],
          elevationM: 215,
          distanceFromStartKm: 0,
          type: ['rest_area', 'water_source'],
        },
        {
          title: 'Qila Rai Pithora Watchtower Bastion',
          description: 'Historical 12th century stone ruins overlooking forest canopy',
          coordinates: [77.178, 28.539],
          elevationM: 250,
          distanceFromStartKm: 2.2,
          type: ['viewpoint'],
        },
      ],
      elevationProfile: [
        { distanceKm: 0, elevationM: 215 },
        { distanceKm: 2.2, elevationM: 250 },
        { distanceKm: 4.5, elevationM: 215 },
      ],
      recommendedGear: ['Comfortable sneakers', 'Hydration pack / water bottle', 'Camera'],
      safetyWarnings: ['Exit before dark; sanctuary gates close at sunset'],
      currentStatus: 'Open',
      dataSource: 'Verified Curated Dataset',
      isDemoData: true,
    },
    {
      title: 'Leopard Trail Ridge Trek (Gurugram Aravallis)',
      slug: 'leopard-trail-gurugram',
      description: 'Popular Aravalli trail meandering through rugged dry scrub hills and open ravines. Renowned for scenic sunset viewpoints and cycling/hiking enthusiasts.',
      region: 'Delhi NCR',
      country: 'India',
      location: {
        type: 'Point',
        coordinates: [77.0142, 28.3245],
      },
      difficulty: TrailDifficulty.EASY,
      distanceKm: 8.0,
      elevationGainM: 140,
      highestPointM: 320,
      estimatedDurationMin: 140,
      routeType: TrailRouteType.OUT_AND_BACK,
      terrains: ['Rocky', 'Desert', 'Canyon'],
      tags: ['Dog-Friendly', 'Scenic', 'Sunset', 'Sunrise/Sunset', 'Cafe Stops'],
      isDogFriendly: true,
      isFamilyFriendly: true,
      isCampingAllowed: false,
      isSunriseSuitable: true,
      isSunsetSuitable: true,
      hasWaterfall: false,
      rating: 4.7,
      reviewCount: 520,
      images: [
        'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      ],
      waypoints: [
        {
          title: 'Mandawar Trail Hub',
          description: 'Start of the dirt road trail near rural village',
          coordinates: [77.0142, 28.3245],
          elevationM: 240,
          distanceFromStartKm: 0,
          type: ['rest_area'],
        },
        {
          title: 'Aravalli Ridge Sunset Point',
          description: 'High vantage point overlooking Haryana valleys',
          coordinates: [77.032, 28.318],
          elevationM: 320,
          distanceFromStartKm: 4.0,
          type: ['viewpoint'],
        },
      ],
      elevationProfile: [
        { distanceKm: 0, elevationM: 240 },
        { distanceKm: 2.0, elevationM: 280 },
        { distanceKm: 4.0, elevationM: 320 },
        { distanceKm: 6.0, elevationM: 270 },
        { distanceKm: 8.0, elevationM: 240 },
      ],
      recommendedGear: ['Trail running shoes', '2L Hydration', 'Sun glasses & cap', 'Energy bars'],
      safetyWarnings: ['Gravelly gravel sections can be slippery on descent', 'Sparse tree shade midday'],
      currentStatus: 'Open',
      dataSource: 'Verified Curated Dataset',
      isDemoData: true,
    },
    {
      title: 'Triund Ridge Panoramic Trek',
      slug: 'triund-ridge-panoramic-trek',
      description: 'One of the most spectacular Himalayan ridge treks above McLeod Ganj. Offers jaw-dropping 360-degree vistas of the snow-capped Dhauladhar range and Kangra valley.',
      region: 'Himachal Pradesh',
      country: 'India',
      location: {
        type: 'Point',
        coordinates: [76.3533, 32.2577],
      },
      difficulty: TrailDifficulty.MODERATE,
      distanceKm: 9.5,
      elevationGainM: 950,
      highestPointM: 2875,
      estimatedDurationMin: 300,
      routeType: TrailRouteType.OUT_AND_BACK,
      terrains: ['Mountain', 'Forest', 'Rocky', 'Alpine'],
      tags: ['Scenic', 'Camping', 'Sunrise/Sunset', 'Mountain View', 'Iconic'],
      isDogFriendly: true,
      isFamilyFriendly: false,
      isCampingAllowed: true,
      isSunriseSuitable: true,
      isSunsetSuitable: true,
      hasWaterfall: false,
      rating: 4.9,
      reviewCount: 1840,
      images: [
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
      ],
      waypoints: [
        {
          title: 'Dharamkot / Galu Devi Temple',
          description: 'Trailhead checkpoint with local cafes and walking stick rentals',
          coordinates: [76.3312, 32.2471],
          elevationM: 2130,
          distanceFromStartKm: 0,
          type: ['rest_area', 'water_source'],
        },
        {
          title: 'Magic View Cafe',
          description: 'Oldest tea stall on the route with valley views',
          coordinates: [76.342, 32.252],
          elevationM: 2480,
          distanceFromStartKm: 2.8,
          type: ['viewpoint', 'rest_area'],
        },
        {
          title: 'Triund Top Meadow',
          description: 'Sprawling alpine ridge campsite facing Dhauladhar peaks',
          coordinates: [76.3533, 32.2577],
          elevationM: 2875,
          distanceFromStartKm: 4.75,
          type: ['viewpoint', 'campsite'],
        },
      ],
      elevationProfile: [
        { distanceKm: 0, elevationM: 2130 },
        { distanceKm: 1.5, elevationM: 2320 },
        { distanceKm: 2.8, elevationM: 2480 },
        { distanceKm: 3.8, elevationM: 2680 },
        { distanceKm: 4.75, elevationM: 2875 },
        { distanceKm: 9.5, elevationM: 2130 },
      ],
      recommendedGear: ['Ankle-support hiking boots', 'Trekking poles', 'Windproof fleece jacket', '2L Water', 'Headlamp / Flashlight'],
      safetyWarnings: ['Rapid weather changes and fog in late afternoons', 'Steep 22-curve section requires steady footing'],
      currentStatus: 'Open',
      dataSource: 'Verified Curated Dataset',
      isDemoData: true,
    },
    {
      title: 'Kheerganga Hot Springs & Waterfall Trail',
      slug: 'kheerganga-hot-springs-waterfall',
      description: 'A magical Parvati Valley hike crossing raging rivers, cascading pine waterfalls, and dense apple orchards to reach natural geothermal sulphur hot springs.',
      region: 'Himachal Pradesh',
      country: 'India',
      location: {
        type: 'Point',
        coordinates: [77.4983, 31.9931],
      },
      difficulty: TrailDifficulty.MODERATE,
      distanceKm: 12.0,
      elevationGainM: 820,
      highestPointM: 2960,
      estimatedDurationMin: 360,
      routeType: TrailRouteType.OUT_AND_BACK,
      terrains: ['Mountain', 'Forest', 'Waterfall', 'River'],
      tags: ['Waterfall', 'Scenic', 'Camping', 'Hot Springs', 'River View'],
      isDogFriendly: false,
      isFamilyFriendly: false,
      isCampingAllowed: true,
      isSunriseSuitable: true,
      isSunsetSuitable: true,
      hasWaterfall: true,
      rating: 4.8,
      reviewCount: 1420,
      images: [
        'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      ],
      waypoints: [
        {
          title: 'Barshaini Dam Bridge',
          description: 'Starting point connecting Parvati and Tosh rivers',
          coordinates: [77.452, 31.989],
          elevationM: 2140,
          distanceFromStartKm: 0,
          type: ['rest_area'],
        },
        {
          title: 'Rudranag Waterfall & Temple',
          description: 'Thundering waterfall plunging into natural rock pools',
          coordinates: [77.472, 31.991],
          elevationM: 2510,
          distanceFromStartKm: 3.5,
          type: ['viewpoint', 'water_source'],
        },
        {
          title: 'Kheerganga Sacred Hot Spring Pool',
          description: 'Natural mineral hot water pool surrounded by snow peaks',
          coordinates: [77.4983, 31.9931],
          elevationM: 2960,
          distanceFromStartKm: 6.0,
          type: ['viewpoint', 'campsite', 'rest_area'],
        },
      ],
      elevationProfile: [
        { distanceKm: 0, elevationM: 2140 },
        { distanceKm: 2.0, elevationM: 2300 },
        { distanceKm: 3.5, elevationM: 2510 },
        { distanceKm: 5.0, elevationM: 2780 },
        { distanceKm: 6.0, elevationM: 2960 },
        { distanceKm: 12.0, elevationM: 2140 },
      ],
      recommendedGear: ['Waterproof hiking shoes', 'Quick-dry clothing and towel', 'Rain poncho', 'Trekking pole', 'Water purification tablets'],
      safetyWarnings: ['Trail becomes slippery during monsoon rains', 'Beware of steep gorge drop-offs near Rudranag'],
      currentStatus: 'Open',
      dataSource: 'Verified Curated Dataset',
      isDemoData: true,
    },
    {
      title: 'Devkund Secret Waterfall Trek',
      slug: 'devkund-waterfall-trek',
      description: 'Hidden gem in Maharashtra Western Ghats leading to a secluded turquoise plunge pool enveloped by towering sheer cliffs and dense Sahyadri rainforests.',
      region: 'Maharashtra',
      country: 'India',
      location: {
        type: 'Point',
        coordinates: [73.3854, 18.4239],
      },
      difficulty: TrailDifficulty.MODERATE,
      distanceKm: 6.5,
      elevationGainM: 180,
      highestPointM: 420,
      estimatedDurationMin: 150,
      routeType: TrailRouteType.OUT_AND_BACK,
      terrains: ['Forest', 'Waterfall', 'Rocky', 'River'],
      tags: ['Waterfall', 'Scenic', 'River View', 'Swimming', 'Photogenic'],
      isDogFriendly: false,
      isFamilyFriendly: true,
      isCampingAllowed: false,
      isSunriseSuitable: false,
      isSunsetSuitable: false,
      hasWaterfall: true,
      rating: 4.7,
      reviewCount: 980,
      images: [
        'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
      ],
      waypoints: [
        {
          title: 'Bhira Dam Base Village',
          description: 'Trail registration booth with local guides',
          coordinates: [73.371, 18.431],
          elevationM: 240,
          distanceFromStartKm: 0,
          type: ['rest_area'],
        },
        {
          title: 'Devkund Waterfall Lagoon',
          description: 'Glistening deep blue plunge pool below a 300ft waterfall',
          coordinates: [73.3854, 18.4239],
          elevationM: 420,
          distanceFromStartKm: 3.25,
          type: ['viewpoint', 'water_source'],
        },
      ],
      elevationProfile: [
        { distanceKm: 0, elevationM: 240 },
        { distanceKm: 1.5, elevationM: 310 },
        { distanceKm: 3.25, elevationM: 420 },
        { distanceKm: 6.5, elevationM: 240 },
      ],
      recommendedGear: ['Trail shoes with aggressive grip', 'Dry bag for electronics', 'Extra clothes', 'Hydration pack'],
      safetyWarnings: ['Swimming beyond safety rope is strictly prohibited due to strong undertows', 'Flash flood risk during heavy monsoon bursts'],
      currentStatus: 'Open',
      dataSource: 'Verified Curated Dataset',
      isDemoData: true,
    },
    {
      title: 'Harishchandragad Konkan Kada Cliff Trek',
      slug: 'harishchandragad-konkan-kada',
      description: 'An ancient hill fort trek featuring the legendary Konkan Kada—a concave semicircular vertical cliff that generates breathtaking reverse waterfalls and sunset cloud inversions.',
      region: 'Maharashtra',
      country: 'India',
      location: {
        type: 'Point',
        coordinates: [73.7744, 19.3872],
      },
      difficulty: TrailDifficulty.HARD,
      distanceKm: 14.5,
      elevationGainM: 1100,
      highestPointM: 1424,
      estimatedDurationMin: 450,
      routeType: TrailRouteType.LOOP,
      terrains: ['Mountain', 'Rocky', 'Historical', 'Canyon'],
      tags: ['Camping', 'Scenic', 'Historical', 'Sunset', 'Sunrise/Sunset', 'Caves'],
      isDogFriendly: false,
      isFamilyFriendly: false,
      isCampingAllowed: true,
      isSunriseSuitable: true,
      isSunsetSuitable: true,
      hasWaterfall: true,
      rating: 4.9,
      reviewCount: 1650,
      images: [
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      ],
      waypoints: [
        {
          title: 'Khireshwar Base',
          description: 'Historical lakeside village starting point',
          coordinates: [73.791, 19.375],
          elevationM: 650,
          distanceFromStartKm: 0,
          type: ['rest_area'],
        },
        {
          title: 'Tolar Khind Rock Face',
          description: 'Steep rock climb assisted by steel safety railings',
          coordinates: [73.782, 19.381],
          elevationM: 1050,
          distanceFromStartKm: 3.5,
          type: ['hazard'],
        },
        {
          title: 'Harishchareshwar 6th-Century Temple & Caves',
          description: 'Carved cave complexes and ancient Shiva temple',
          coordinates: [73.776, 19.388],
          elevationM: 1350,
          distanceFromStartKm: 6.2,
          type: ['historical', 'campsite', 'water_source'],
        },
        {
          title: 'Konkan Kada Edge',
          description: 'Massive cliff offering sunset vistas and circular rainbow phenomena',
          coordinates: [73.7744, 19.3872],
          elevationM: 1424,
          distanceFromStartKm: 7.25,
          type: ['viewpoint'],
        },
      ],
      elevationProfile: [
        { distanceKm: 0, elevationM: 650 },
        { distanceKm: 3.5, elevationM: 1050 },
        { distanceKm: 6.2, elevationM: 1350 },
        { distanceKm: 7.25, elevationM: 1424 },
        { distanceKm: 14.5, elevationM: 650 },
      ],
      recommendedGear: ['High-traction technical hiking boots', '3L Hydration bladder', 'Camp gear / warm sleeping bag', 'Gloves for rock sections', 'Headlamp with spare batteries'],
      safetyWarnings: ['Severe vertical drop at Konkan Kada; stay back at least 3 meters from unguarded edge', 'Wind gusts can be extreme at the cliff top'],
      currentStatus: 'Open',
      dataSource: 'Verified Curated Dataset',
      isDemoData: true,
    },
    {
      title: 'Nag Tibba Summit (Serpent’s Peak) Trek',
      slug: 'nag-tibba-summit-trek',
      description: 'The highest peak in the lesser Himalayas of Garhwal region near Mussoorie. Renowned for winter snow trekking, rhododendron forests, and panoramic Gangotri/Bandarpunch peaks.',
      region: 'Uttarakhand',
      country: 'India',
      location: {
        type: 'Point',
        coordinates: [78.1528, 30.5847],
      },
      difficulty: TrailDifficulty.MODERATE,
      distanceKm: 10.0,
      elevationGainM: 780,
      highestPointM: 3022,
      estimatedDurationMin: 320,
      routeType: TrailRouteType.OUT_AND_BACK,
      terrains: ['Mountain', 'Forest', 'Alpine', 'Snow'],
      tags: ['Scenic', 'Camping', 'Sunrise/Sunset', 'Snow Hike', 'Family-Friendly'],
      isDogFriendly: true,
      isFamilyFriendly: true,
      isCampingAllowed: true,
      isSunriseSuitable: true,
      isSunsetSuitable: true,
      hasWaterfall: false,
      rating: 4.8,
      reviewCount: 1120,
      images: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      ],
      waypoints: [
        {
          title: 'Pantwari Village Trailhead',
          description: 'Starting village with mountain homestays',
          coordinates: [78.132, 30.569],
          elevationM: 2240,
          distanceFromStartKm: 0,
          type: ['rest_area'],
        },
        {
          title: 'Nag Tibba Base Camp (Khatian)',
          description: 'Spacious oak meadow campsite with sunset views',
          coordinates: [78.145, 30.579],
          elevationM: 2750,
          distanceFromStartKm: 3.5,
          type: ['campsite', 'viewpoint'],
        },
        {
          title: 'Nag Tibba Temple & Summit Flag',
          description: 'Ancient serpent temple and 3,022m peak flag marker',
          coordinates: [78.1528, 30.5847],
          elevationM: 3022,
          distanceFromStartKm: 5.0,
          type: ['viewpoint'],
        },
      ],
      elevationProfile: [
        { distanceKm: 0, elevationM: 2240 },
        { distanceKm: 2.0, elevationM: 2500 },
        { distanceKm: 3.5, elevationM: 2750 },
        { distanceKm: 5.0, elevationM: 3022 },
        { distanceKm: 10.0, elevationM: 2240 },
      ],
      recommendedGear: ['Insulated winter trekking boots', 'Thermal layers and down jacket', 'Crampons / microspikes in Dec-Feb', '2L Water', 'Trekking poles'],
      safetyWarnings: ['Sub-zero temperatures overnight during winter', 'Limited natural water sources past the base camp'],
      currentStatus: 'Open',
      dataSource: 'Verified Curated Dataset',
      isDemoData: true,
    },
    {
      title: 'Valley of Flowers Alpine Biosphere Trek',
      slug: 'valley-of-flowers-alpine-trek',
      description: 'A UNESCO World Heritage sanctuary in Chamoli carpeted with hundreds of endemic alpine flower species, cascading glacial streams, and surrounded by snowy peaks.',
      region: 'Uttarakhand',
      country: 'India',
      location: {
        type: 'Point',
        coordinates: [79.6053, 30.728],
      },
      difficulty: TrailDifficulty.MODERATE,
      distanceKm: 14.0,
      elevationGainM: 920,
      highestPointM: 3658,
      estimatedDurationMin: 420,
      routeType: TrailRouteType.OUT_AND_BACK,
      terrains: ['Alpine', 'Meadow', 'River', 'Mountain', 'Waterfall'],
      tags: ['Scenic', 'UNESCO Heritage', 'Waterfall', 'Floral', 'Wildlife'],
      isDogFriendly: false,
      isFamilyFriendly: true,
      isCampingAllowed: false,
      isSunriseSuitable: false,
      isSunsetSuitable: false,
      hasWaterfall: true,
      rating: 5.0,
      reviewCount: 2290,
      images: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
      ],
      waypoints: [
        {
          title: 'Ghangaria Settlement',
          description: 'Base camp town with hotels and permit verification post',
          coordinates: [79.589, 30.701],
          elevationM: 3048,
          distanceFromStartKm: 0,
          type: ['rest_area', 'water_source'],
        },
        {
          title: 'Pushpawati River Wooden Bridge',
          description: 'Rushing glacial river crossing inside national park gate',
          coordinates: [79.596, 30.712],
          elevationM: 3200,
          distanceFromStartKm: 2.2,
          type: ['viewpoint'],
        },
        {
          title: 'Joan Margaret Legge Memorial Grave',
          description: 'Historic botanist memorial nestled amidst blue poppies',
          coordinates: [79.6053, 30.728],
          elevationM: 3658,
          distanceFromStartKm: 7.0,
          type: ['viewpoint', 'historical'],
        },
      ],
      elevationProfile: [
        { distanceKm: 0, elevationM: 3048 },
        { distanceKm: 2.2, elevationM: 3200 },
        { distanceKm: 4.5, elevationM: 3450 },
        { distanceKm: 7.0, elevationM: 3658 },
        { distanceKm: 14.0, elevationM: 3048 },
      ],
      recommendedGear: ['Waterproof Gore-Tex boots', 'Full rain suit and backpack rain cover', 'Botanical field guide', 'Trekking poles'],
      safetyWarnings: ['Entry is only allowed between 7:00 AM and 2:00 PM; all visitors must return to Ghangaria before 5:00 PM', 'No camping allowed inside National Park'],
      currentStatus: 'Open',
      dataSource: 'Verified Curated Dataset',
      isDemoData: true,
    },
  ];

  getSeedData(): Partial<Trail>[] {
    return this.trailsDatabase;
  }

  async searchTrails(params: TrailSearchParams): Promise<{ trails: Partial<Trail>[]; total: number }> {
    let filtered = [...this.trailsDatabase];

    if (params.query) {
      const q = params.query.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.region?.toLowerCase().includes(q) ||
          t.terrains?.some((ter) => ter.toLowerCase().includes(q)) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q)),
      );
    }

    if (params.region) {
      const reg = params.region.toLowerCase();
      filtered = filtered.filter((t) => t.region?.toLowerCase().includes(reg));
    }

    if (params.difficulty) {
      filtered = filtered.filter(
        (t) => t.difficulty?.toLowerCase() === params.difficulty?.toLowerCase(),
      );
    }

    if (params.minDistance !== undefined) {
      filtered = filtered.filter((t) => (t.distanceKm || 0) >= params.minDistance!);
    }
    if (params.maxDistance !== undefined) {
      filtered = filtered.filter((t) => (t.distanceKm || 0) <= params.maxDistance!);
    }

    if (params.minElevation !== undefined) {
      filtered = filtered.filter((t) => (t.elevationGainM || 0) >= params.minElevation!);
    }
    if (params.maxElevation !== undefined) {
      filtered = filtered.filter((t) => (t.elevationGainM || 0) <= params.maxElevation!);
    }

    if (params.isDogFriendly) {
      filtered = filtered.filter((t) => t.isDogFriendly === true);
    }
    if (params.isFamilyFriendly) {
      filtered = filtered.filter((t) => t.isFamilyFriendly === true);
    }
    if (params.isCampingAllowed) {
      filtered = filtered.filter((t) => t.isCampingAllowed === true);
    }
    if (params.isSunriseSuitable) {
      filtered = filtered.filter((t) => t.isSunriseSuitable === true);
    }
    if (params.isSunsetSuitable) {
      filtered = filtered.filter((t) => t.isSunsetSuitable === true);
    }
    if (params.hasWaterfall) {
      filtered = filtered.filter((t) => t.hasWaterfall === true);
    }

    if (params.terrain) {
      const ter = params.terrain.toLowerCase();
      filtered = filtered.filter((t) =>
        t.terrains?.some((item) => item.toLowerCase() === ter),
      );
    }

    const total = filtered.length;
    const skip = params.skip || 0;
    const limit = params.limit || 20;

    const trails = filtered.slice(skip, skip + limit);
    return { trails, total };
  }

  async getTrailById(id: string): Promise<Partial<Trail> | null> {
    return (
      this.trailsDatabase.find(
        (t) => (t as any)._id?.toString() === id || t.slug === id,
      ) || null
    );
  }

  async getNearbyTrails(params: NearbyTrailParams): Promise<Partial<Trail>[]> {
    const maxDist = params.maxDistanceKm || 50;
    const limit = params.limit || 10;

    const withDist = this.trailsDatabase.map((t) => {
      const [lng, lat] = t.location?.coordinates || [0, 0];
      const distance = GeoUtil.calculateDistanceKm(
        params.latitude,
        params.longitude,
        lat,
        lng,
      );
      return {
        ...t,
        calculatedDistanceKm: distance,
      };
    });

    let matched = withDist.filter((t) => t.calculatedDistanceKm <= maxDist);

    if (params.difficulty) {
      matched = matched.filter(
        (t) => t.difficulty?.toLowerCase() === params.difficulty?.toLowerCase(),
      );
    }

    matched.sort((a, b) => a.calculatedDistanceKm - b.calculatedDistanceKm);
    return matched.slice(0, limit);
  }
}
