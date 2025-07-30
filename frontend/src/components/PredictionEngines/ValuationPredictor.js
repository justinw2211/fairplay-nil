/**
 * NIL Deal Valuation Prediction Engine
 * Based on industry research from On3, Opendorse, and NIL market analysis
 *
 * Research Sources:
 * - On3 NIL Valuation methodology (performance + influence + exposure)
 * - Opendorse NIL compensation guides by sport
 * - NCAA revenue sharing estimates by conference
 * - Industry averages: $35K college athletes, $52K SEC, $37K Pac-12
 */

/**
 * Calculate fair market value range for NIL deal
 * @param {Object} dealData - Deal information from wizard
 * @param {Object} athleteData - Athlete profile and social media data
 * @returns {Object} Valuation with ranges, confidence, factors, and rationale
 */
export const predictValuation = (dealData, athleteData) => {
  // Base calculation using social media following as foundation
  const baseValue = calculateSocialMediaValue(athleteData);

  // Apply institutional and market multipliers
  const schoolMultiplier = getSchoolTierMultiplier(athleteData.university);
  const sportMultiplier = getSportPopularityMultiplier(athleteData.sports);
  const activityMultiplier = getActivityTypeMultiplier(dealData.activities);
  const genderMultiplier = getGenderMultiplier(athleteData.gender);
  const conferenceBonus = getConferenceBonus(athleteData.university);

  // Calculate adjusted value
  const adjustedValue = Math.round(baseValue * schoolMultiplier * sportMultiplier * activityMultiplier * genderMultiplier + conferenceBonus);

  // Create compensation range (industry standard ±25-40%)
  const rangeFactor = 0.35; // 35% variance is realistic per research
  const lowRange = Math.round(adjustedValue * (1 - rangeFactor));
  const highRange = Math.round(adjustedValue * (1 + rangeFactor));

  // Calculate confidence score based on data quality
  const confidence = calculateConfidenceScore({
    hasFollowers: !!(athleteData.instagram_followers || athleteData.tiktok_followers),
    hasSport: !!athleteData.sports?.length,
    hasSchool: !!athleteData.university,
    hasActivities: !!dealData.activities?.length,
    hasPerformanceData: !!(athleteData.athletic_performance || athleteData.achievements)
  });

  // Build detailed factors breakdown
  const factors = {
    social_media_base: {
      value: baseValue,
      description: `Base value from ${getTotalFollowers(athleteData).toLocaleString()} total followers across platforms`
    },
    school_tier: {
      multiplier: schoolMultiplier,
      description: getSchoolTierDescription(athleteData.university, schoolMultiplier)
    },
    sport_popularity: {
      multiplier: sportMultiplier,
      description: getSportDescription(athleteData.sports, sportMultiplier)
    },
    activity_type: {
      multiplier: activityMultiplier,
      description: getActivityDescription(dealData.activities, activityMultiplier)
    },
    gender_adjustment: {
      multiplier: genderMultiplier,
      description: getGenderDescription(athleteData.gender, genderMultiplier)
    },
    conference_bonus: {
      value: conferenceBonus,
      description: getConferenceDescription(athleteData.university, conferenceBonus)
    }
  };

  // Generate detailed rationale
  const rationale = generateValuationRationale({
    baseValue,
    adjustedValue,
    lowRange,
    highRange,
    factors,
    athleteData,
    dealData
  });

  return {
    estimated_fmv: adjustedValue,
    low_range: Math.max(lowRange, 100), // Minimum $100 floor
    high_range: Math.min(highRange, 500000), // Maximum $500K ceiling for college
    confidence,
    factors,
    rationale,
    market_comparison: generateMarketComparison(adjustedValue, athleteData),
    predicted_at: new Date().toISOString()
  };
};

/**
 * Calculate base value from social media followers
 */
const calculateSocialMediaValue = (athleteData) => {
  const instagram = parseInt(athleteData.instagram_followers || 0);
  const tiktok = parseInt(athleteData.tiktok_followers || 0);
  const twitter = parseInt(athleteData.twitter_followers || 0);

  // Industry rates: Instagram $0.01-0.05/follower, TikTok $0.02-0.08/follower, Twitter $0.005-0.02/follower
  const instagramValue = instagram * 0.025; // $0.025 per follower (mid-range)
  const tiktokValue = tiktok * 0.04; // $0.04 per follower (higher engagement)
  const twitterValue = twitter * 0.01; // $0.01 per follower (lower value)

  const totalValue = instagramValue + tiktokValue + twitterValue;

  // Apply follower tier bonuses (diminishing returns for mega-influencers)
  if (getTotalFollowers(athleteData) > 1000000) {
    return Math.round(totalValue * 0.8); // Diminishing returns above 1M
  } else if (getTotalFollowers(athleteData) > 100000) {
    return Math.round(totalValue * 1.0); // Standard rate
  } else if (getTotalFollowers(athleteData) > 10000) {
    return Math.round(totalValue * 1.2); // Premium for growing accounts
  } else {
    return Math.max(Math.round(totalValue * 1.5), 500); // Minimum viable value
  }
};

/**
 * Get school tier multiplier based on Division and athletic success
 */
const getSchoolTierMultiplier = (university) => {
  if (!university) {return 1.0;}

  const universityLower = university.toLowerCase();

  // Power 5 (SEC, Big Ten, Big 12, ACC, Pac-12) - Research shows SEC avg $52K
  const power5Schools = {
    // SEC - Highest values per research
    'alabama': 1.8, 'georgia': 1.7, 'lsu': 1.7, 'florida': 1.6, 'texas a&m': 1.6,
    'tennessee': 1.5, 'auburn': 1.5, 'south carolina': 1.4, 'kentucky': 1.4,
    'mississippi': 1.4, 'ole miss': 1.4, 'arkansas': 1.3, 'missouri': 1.3, 'vanderbilt': 1.2,

    // Big Ten
    'ohio state': 1.7, 'michigan': 1.6, 'penn state': 1.5, 'wisconsin': 1.4,
    'iowa': 1.3, 'michigan state': 1.3, 'minnesota': 1.2, 'nebraska': 1.2,
    'indiana': 1.1, 'illinois': 1.1, 'purdue': 1.1, 'northwestern': 1.1,

    // Big 12
    'texas': 1.6, 'oklahoma': 1.5, 'oklahoma state': 1.3, 'texas tech': 1.2,
    'baylor': 1.2, 'tcu': 1.2, 'kansas': 1.1, 'kansas state': 1.1,

    // ACC
    'clemson': 1.5, 'florida state': 1.4, 'miami': 1.4, 'north carolina': 1.3,
    'virginia tech': 1.2, 'nc state': 1.2, 'virginia': 1.1, 'duke': 1.2,

    // Pac-12 - Research shows avg $37K
    'usc': 1.4, 'ucla': 1.4, 'oregon': 1.3, 'washington': 1.2,
    'stanford': 1.2, 'california': 1.1, 'arizona state': 1.1, 'arizona': 1.1
  };

  // Group of 5 conferences - Research shows avg ~$20K
  if (universityLower.includes('state') && !power5Schools[universityLower]) {
    return 1.1; // Most state schools in G5
  }

  return power5Schools[universityLower] || 1.0; // Default for smaller schools
};

/**
 * Get sport popularity multiplier
 */
const getSportPopularityMultiplier = (sports) => {
  if (!sports || !sports.length) {return 1.0;}

  const sportLower = sports[0].toLowerCase();

  // Based on TV revenue and fan engagement data
  const sportMultipliers = {
    'football': 1.5, // Highest revenue sport
    'basketball': 1.4, // March Madness drives high value
    'baseball': 1.2, // Strong collegiate following
    'softball': 1.1, // Growing popularity
    'soccer': 1.1, // Increasing NIL opportunities
    'gymnastics': 1.3, // High social media engagement (LSU effect)
    'tennis': 1.0, // Individual sport moderate value
    'golf': 1.0, // Individual sport moderate value
    'swimming': 0.9, // Lower media exposure
    'track and field': 0.9, // Lower media exposure
    'volleyball': 1.0, // Moderate following
    'wrestling': 0.8, // Niche audience
    'cross country': 0.8, // Niche audience
  };

  return sportMultipliers[sportLower] || 0.9;
};

/**
 * Get activity type multiplier based on value and complexity
 */
const getActivityTypeMultiplier = (activities) => {
  if (!activities || !activities.length) {return 1.0;}

  let maxMultiplier = 1.0;

  activities.forEach(activity => {
    const activityType = activity.activity_type?.toLowerCase() || '';

    const activityMultipliers = {
      'social_media_post': 1.0, // Base standard
      'product_endorsement': 1.5, // High value brand partnership
      'appearance': 1.3, // Personal brand building
      'autograph_signing': 1.2, // Fan engagement value
      'commercial_filming': 1.4, // Professional content creation
      'brand_ambassadorship': 1.6, // Long-term partnership premium
      'speaking_engagement': 1.1, // Moderate value
      'merchandise_promotion': 1.2, // Revenue sharing potential
      'event_hosting': 1.3, // Personal brand showcase
      'content_creation': 1.1, // Growing market segment
    };

    const multiplier = activityMultipliers[activityType] || 1.0;
    if (multiplier > maxMultiplier) {
      maxMultiplier = multiplier;
    }
  });

  return maxMultiplier;
};

/**
 * Get gender adjustment multiplier (reflecting current market reality)
 */
const getGenderMultiplier = (gender) => {
  // Research shows female athletes often command higher NIL values
  // due to social media engagement and brand appeal
  if (gender?.toLowerCase() === 'female') {
    return 1.15; // 15% bonus reflecting market reality
  }
  return 1.0;
};

/**
 * Get conference bonus based on TV revenue and exposure
 */
const getConferenceBonus = (university) => {
  if (!university) {return 0;}

  const universityLower = university.toLowerCase();

  // SEC schools get exposure bonus due to highest TV revenues
  const secSchools = ['alabama', 'georgia', 'lsu', 'florida', 'texas a&m', 'tennessee',
                     'auburn', 'south carolina', 'kentucky', 'mississippi', 'ole miss',
                     'arkansas', 'missouri', 'vanderbilt'];

  if (secSchools.includes(universityLower)) {
    return 2000; // $2K SEC exposure bonus
  }

  // Big Ten gets moderate bonus
  const bigTenSchools = ['ohio state', 'michigan', 'penn state', 'wisconsin', 'iowa',
                        'michigan state', 'minnesota', 'nebraska', 'indiana', 'illinois',
                        'purdue', 'northwestern'];

  if (bigTenSchools.includes(universityLower)) {
    return 1000; // $1K Big Ten bonus
  }

  return 0;
};

/**
 * Calculate confidence score based on data quality
 */
const calculateConfidenceScore = (dataQuality) => {
  let score = 0;
  let maxScore = 0;

  // Weight factors by importance to valuation accuracy
  const weights = {
    hasFollowers: 30, // Most critical for NIL value
    hasSport: 25, // Important for multipliers
    hasSchool: 20, // Important for tier multipliers
    hasActivities: 15, // Important for activity multipliers
    hasPerformanceData: 10 // Nice to have for credibility
  };

  Object.keys(weights).forEach(factor => {
    maxScore += weights[factor];
    if (dataQuality[factor]) {
      score += weights[factor];
    }
  });

  return Math.round((score / maxScore) * 100);
};

/**
 * Helper functions
 */
const getTotalFollowers = (athleteData) => {
  return (parseInt(athleteData.instagram_followers || 0) +
          parseInt(athleteData.tiktok_followers || 0) +
          parseInt(athleteData.twitter_followers || 0));
};

const getSchoolTierDescription = (university, multiplier) => {
  if (multiplier >= 1.5) {return `${university} - Elite Power 5 program with premium market value`;}
  if (multiplier >= 1.2) {return `${university} - Strong Power 5 program with above-average value`;}
  if (multiplier >= 1.1) {return `${university} - Solid program with moderate market premium`;}
  return `${university} - Standard market value positioning`;
};

const getSportDescription = (sports, multiplier) => {
  if (!sports?.length) {return 'Sport not specified';}
  const sport = sports[0];
  if (multiplier >= 1.4) {return `${sport} - Premium revenue sport with highest NIL potential`;}
  if (multiplier >= 1.1) {return `${sport} - Popular sport with above-average NIL opportunities`;}
  return `${sport} - Standard NIL market positioning`;
};

const getActivityDescription = (activities, multiplier) => {
  if (!activities?.length) {return 'Activities not specified';}
  if (multiplier >= 1.4) {return 'High-value brand partnership activities commanding premium rates';}
  if (multiplier >= 1.2) {return 'Valuable promotional activities with strong market demand';}
  return 'Standard promotional activities with baseline market value';
};

const getGenderDescription = (gender, multiplier) => {
  if (multiplier > 1.0) {return 'Female athlete market premium reflecting strong brand appeal and engagement';}
  return 'Standard market positioning';
};

const getConferenceDescription = (university, bonus) => {
  if (bonus >= 2000) {return `SEC Conference exposure bonus (+$${bonus.toLocaleString()})`;}
  if (bonus >= 1000) {return `Power 5 Conference exposure bonus (+$${bonus.toLocaleString()})`;}
  return 'No conference bonus applied';
};

/**
 * Generate comprehensive valuation rationale
 */
const generateValuationRationale = ({ baseValue, adjustedValue, lowRange, highRange, factors, athleteData, dealData }) => {
  const totalFollowers = getTotalFollowers(athleteData);

  return {
    methodology: "Fair market value calculated using industry-standard NIL valuation methodology based on social media influence, institutional prestige, sport popularity, and activity type analysis.",

    base_calculation: `Starting with $${baseValue.toLocaleString()} base value derived from ${totalFollowers.toLocaleString()} total social media followers across platforms using industry engagement rates.`,

    key_adjustments: [
      `School tier adjustment: ${factors.school_tier.description}`,
      `Sport popularity factor: ${factors.sport_popularity.description}`,
      `Activity type premium: ${factors.activity_type.description}`,
      factors.gender_adjustment.multiplier > 1.0 ? factors.gender_adjustment.description : null,
      factors.conference_bonus.value > 0 ? factors.conference_bonus.description : null
    ].filter(Boolean),

    final_calculation: `Adjusted value: $${adjustedValue.toLocaleString()} • Range: $${lowRange.toLocaleString()} - $${highRange.toLocaleString()} (±35% industry standard variance)`,

    market_context: generateMarketContext(adjustedValue, athleteData),

    recommendations: generateRecommendations(adjustedValue, factors, athleteData)
  };
};

/**
 * Generate market comparison context
 */
const generateMarketComparison = (adjustedValue, athleteData) => {
  const comparisons = [];

  // National averages from research
  if (adjustedValue > 50000) {
    comparisons.push("Above SEC conference average ($52K) - elite market positioning");
  } else if (adjustedValue > 35000) {
    comparisons.push("Above national college athlete average ($35K) - strong market value");
  } else if (adjustedValue > 20000) {
    comparisons.push("Above Group of 5 average ($20K) - solid market positioning");
  } else {
    comparisons.push("Entry-level NIL market positioning with growth potential");
  }

  // Follower-based comparisons
  const totalFollowers = getTotalFollowers(athleteData);
  if (totalFollowers > 100000) {
    comparisons.push("High social media influence tier (100K+ followers)");
  } else if (totalFollowers > 10000) {
    comparisons.push("Moderate social media influence (10K+ followers)");
  } else {
    comparisons.push("Building social media presence (<10K followers)");
  }

  return comparisons;
};

/**
 * Generate market context explanation
 */
const generateMarketContext = (adjustedValue, athleteData) => {
  const sport = athleteData.sports?.[0] || 'athletics';
  const school = athleteData.university || 'college';

  if (adjustedValue > 100000) {
    return `This valuation places the athlete in the top tier of college NIL earners. For context, only star quarterbacks and social media phenoms typically command six-figure valuations.`;
  } else if (adjustedValue > 50000) {
    return `This valuation reflects strong market positioning. Athletes in major ${sport} programs at ${school} with significant social media presence often achieve this range.`;
  } else if (adjustedValue > 20000) {
    return `This valuation represents solid NIL potential. Many successful college athletes in ${sport} earn in this range through local partnerships and social media deals.`;
  } else {
    return `This valuation reflects emerging NIL potential. Focus on growing social media presence and on-field performance to increase market value.`;
  }
};

/**
 * Generate actionable recommendations
 */
const generateRecommendations = (adjustedValue, factors, athleteData) => {
  const recommendations = [];

  // Social media growth opportunities
  const totalFollowers = getTotalFollowers(athleteData);
  if (totalFollowers < 10000) {
    recommendations.push("Focus on growing social media presence to 10K+ followers for improved valuation");
  }

  // Performance-based recommendations
  if (factors.sport_popularity.multiplier < 1.2) {
    recommendations.push("Consider cross-sport content or trending activities to increase market appeal");
  }

  // Activity optimization
  if (factors.activity_type.multiplier < 1.3) {
    recommendations.push("Pursue higher-value activities like brand ambassadorships or product endorsements");
  }

  // Market positioning
  if (adjustedValue < 35000) {
    recommendations.push("Target local and regional partnerships to build market credibility");
  } else {
    recommendations.push("Qualified for national brand partnerships and premium NIL opportunities");
  }

  return recommendations;
};

export default predictValuation;