/**
 * NIL Go Clearinghouse Prediction Engine
 * Based on Deloitte's actual NIL Go clearinghouse process and criteria
 * 
 * Research Sources:
 * - Deloitte NIL Go 3-step process documentation
 * - Troutman Pepper Locke NIL Revolution analysis
 * - Yahoo Sports NIL Go coverage (Ross Dellenger, June 2025)
 * - Sports Business Journal clearinghouse analysis
 */

/**
 * Predicts NIL Go clearinghouse approval likelihood
 * @param {Object} dealData - Deal information from wizard
 * @param {Object} athleteData - Athlete social media and profile data
 * @returns {Object} Prediction with status, confidence, factors, issues, and recommendations
 */
export const predictClearinghouse = (dealData, athleteData) => {
  const prediction = {
    status: 'cleared', // 'cleared', 'in_review', 'information_needed'
    confidence: 85,
    factors: {
      payor_association: { score: 0, weight: 0.4 },
      business_purpose: { score: 0, weight: 0.3 },
      compensation_range: { score: 0, weight: 0.3 }
    },
    issues: [],
    recommendations: [],
    details: {
      threshold_analysis: null,
      payor_verification: null,
      business_purpose_verification: null,
      fmv_analysis: null
    }
  };

  // Step 0: $600 Threshold Check (Auto-clear if under $600)
  const totalCompensation = calculateTotalCompensation(dealData);
  prediction.details.threshold_analysis = {
    total_compensation: totalCompensation,
    meets_threshold: totalCompensation >= 600,
    auto_cleared: totalCompensation < 600
  };

  if (totalCompensation < 600) {
    prediction.status = 'cleared';
    prediction.confidence = 95;
    prediction.factors.payor_association.score = 100;
    prediction.factors.business_purpose.score = 100;
    prediction.factors.compensation_range.score = 100;
    prediction.details.payor_verification = { auto_cleared: true };
    prediction.details.business_purpose_verification = { auto_cleared: true };
    prediction.details.fmv_analysis = { auto_cleared: true };
    return prediction;
  }

  // Step 1: Payor Association Verification
  const payorAnalysis = analyzePayorAssociation(dealData);
  prediction.factors.payor_association.score = payorAnalysis.score;
  prediction.details.payor_verification = payorAnalysis;
  
  if (payorAnalysis.issues.length > 0) {
    prediction.issues.push(...payorAnalysis.issues);
  }

  // Step 2: Valid Business Purpose Verification  
  const businessPurposeAnalysis = analyzeBusinessPurpose(dealData);
  prediction.factors.business_purpose.score = businessPurposeAnalysis.score;
  prediction.details.business_purpose_verification = businessPurposeAnalysis;
  
  if (businessPurposeAnalysis.issues.length > 0) {
    prediction.issues.push(...businessPurposeAnalysis.issues);
  }

  // Step 3: Range of Compensation Analysis (Fair Market Value)
  const fmvAnalysis = analyzeFairMarketValue(dealData, athleteData, totalCompensation);
  prediction.factors.compensation_range.score = fmvAnalysis.score;
  prediction.details.fmv_analysis = fmvAnalysis;
  
  if (fmvAnalysis.issues.length > 0) {
    prediction.issues.push(...fmvAnalysis.issues);
  }

  // Calculate overall confidence and status
  const overallScore = calculateOverallScore(prediction.factors);
  prediction.confidence = Math.round(overallScore);

  // Determine final status based on scores and issues
  if (overallScore >= 80 && prediction.issues.length === 0) {
    prediction.status = 'cleared';
  } else if (overallScore >= 60 || prediction.issues.filter(i => i.severity === 'high').length === 0) {
    prediction.status = 'in_review';
  } else {
    prediction.status = 'information_needed';
  }

  // Generate recommendations
  prediction.recommendations = generateRecommendations(prediction);

  return prediction;
};

/**
 * Calculate total compensation from deal data
 */
function calculateTotalCompensation(dealData) {
  let total = 0;
  
  if (dealData.compensation_cash) {
    total += parseFloat(dealData.compensation_cash) || 0;
  }
  
  if (dealData.compensation_goods && Array.isArray(dealData.compensation_goods)) {
    total += dealData.compensation_goods.reduce((sum, item) => {
      return sum + (parseFloat(item.estimated_value) || 0);
    }, 0);
  }
  
  if (dealData.compensation_other && Array.isArray(dealData.compensation_other)) {
    total += dealData.compensation_other.reduce((sum, item) => {
      return sum + (parseFloat(item.estimated_value) || 0);
    }, 0);
  }
  
  return total;
}

/**
 * Step 1: Payor Association Verification
 * Determines if payor is an "associated entity" requiring stricter scrutiny
 */
function analyzePayorAssociation(dealData) {
  const analysis = {
    score: 85,
    is_associated_entity: false,
    association_type: null,
    risk_level: 'low',
    issues: [],
    criteria_checked: []
  };

  const payorName = dealData.payor_name?.toLowerCase() || '';
  const payorType = dealData.payor_type || 'business';

  // Check for associated entity indicators
  const associatedIndicators = [
    { pattern: /collective|nil|booster|club/i, type: 'collective', risk: 'high' },
    { pattern: /university|college|athletics|athletic/i, type: 'school_affiliated', risk: 'medium' },
    { pattern: /alumni|fan|supporter/i, type: 'alumni_group', risk: 'medium' },
    { pattern: /foundation|fund/i, type: 'foundation', risk: 'medium' }
  ];

  let matchedIndicator = null;
  for (const indicator of associatedIndicators) {
    if (indicator.pattern.test(payorName)) {
      matchedIndicator = indicator;
      break;
    }
  }

  if (matchedIndicator) {
    analysis.is_associated_entity = true;
    analysis.association_type = matchedIndicator.type;
    analysis.risk_level = matchedIndicator.risk;
    
    if (matchedIndicator.risk === 'high') {
      analysis.score = 30; // Low score for collective-type entities
      analysis.issues.push({
        type: 'associated_entity',
        severity: 'high',
        message: 'Payor appears to be a collective or booster-backed entity, requiring enhanced scrutiny'
      });
    } else {
      analysis.score = 60; // Medium score for school-affiliated entities
      analysis.issues.push({
        type: 'associated_entity',
        severity: 'medium',
        message: 'Payor may be associated with university, requiring fair market value assessment'
      });
    }
  }

  // Public company check (generally positive)
  const publicCompanyIndicators = /inc\.|llc|corp|corporation|company|enterprises|brands|group/i;
  if (publicCompanyIndicators.test(payorName) && !matchedIndicator) {
    analysis.score = 90; // High score for legitimate businesses
    analysis.criteria_checked.push('Public company indicators present');
  }

  // Individual payor check
  if (payorType === 'individual' && !matchedIndicator) {
    analysis.score = 75; // Medium-high score for individuals
    analysis.criteria_checked.push('Individual payor - moderate scrutiny');
  }

  return analysis;
}

/**
 * Step 2: Valid Business Purpose Verification
 * Checks if the deal serves legitimate business objectives
 */
function analyzeBusinessPurpose(dealData) {
  const analysis = {
    score: 80,
    has_valid_purpose: true,
    purpose_type: null,
    issues: [],
    activities_analysis: []
  };

  // Check if activities are specified and legitimate
  if (!dealData.activities || !Array.isArray(dealData.activities) || dealData.activities.length === 0) {
    analysis.score = 40;
    analysis.has_valid_purpose = false;
    analysis.issues.push({
      type: 'missing_activities',
      severity: 'high',
      message: 'No activities specified - unable to verify business purpose'
    });
    return analysis;
  }

  // Analyze each activity for legitimacy
  let totalActivityScore = 0;
  dealData.activities.forEach((activity, index) => {
    const activityAnalysis = analyzeActivityLegitimacy(activity);
    analysis.activities_analysis.push(activityAnalysis);
    totalActivityScore += activityAnalysis.score;
    
    if (activityAnalysis.issues.length > 0) {
      analysis.issues.push(...activityAnalysis.issues);
    }
  });

  // Calculate average activity score
  const avgActivityScore = totalActivityScore / dealData.activities.length;
  analysis.score = Math.round(avgActivityScore);

  // Check for red flags that indicate pay-for-play
  const redFlags = checkForPayForPlayIndicators(dealData);
  if (redFlags.length > 0) {
    analysis.score = Math.max(20, analysis.score - 30);
    analysis.issues.push(...redFlags);
  }

  analysis.has_valid_purpose = analysis.score >= 60;
  return analysis;
}

/**
 * Analyze individual activity for business legitimacy
 */
function analyzeActivityLegitimacy(activity) {
  const analysis = {
    score: 70,
    activity_type: activity.activity_type,
    legitimacy_level: 'moderate',
    issues: []
  };

  const highValueActivities = [
    'social_media_campaign',
    'television_commercial',
    'print_advertisement',
    'product_endorsement',
    'speaking_engagement',
    'appearance_event'
  ];

  const moderateValueActivities = [
    'autograph_session',
    'photo_shoot',
    'interview',
    'podcast_appearance',
    'content_creation'
  ];

  const lowValueActivities = [
    'general_promotion',
    'brand_representation',
    'other'
  ];

  if (highValueActivities.includes(activity.activity_type)) {
    analysis.score = 90;
    analysis.legitimacy_level = 'high';
  } else if (moderateValueActivities.includes(activity.activity_type)) {
    analysis.score = 75;
    analysis.legitimacy_level = 'moderate';
  } else if (lowValueActivities.includes(activity.activity_type)) {
    analysis.score = 50;
    analysis.legitimacy_level = 'low';
    analysis.issues.push({
      type: 'vague_activity',
      severity: 'medium',
      message: `Activity "${activity.activity_type}" may be too vague to establish business purpose`
    });
  }

  return analysis;
}

/**
 * Check for pay-for-play indicators
 */
function checkForPayForPlayIndicators(dealData) {
  const redFlags = [];

  // Check exclusivity terms (red flag per NIL Go research)
  if (dealData.grant_exclusivity === 'yes') {
    redFlags.push({
      type: 'exclusivity_terms',
      severity: 'high',
      message: 'Exclusive representation deals require enhanced documentation and scrutiny'
    });
  }

  // Check school IP usage
  if (dealData.uses_school_ip === true) {
    redFlags.push({
      type: 'school_ip_usage',
      severity: 'high',
      message: 'Use of school IP triggers additional compliance review'
    });
  }

  // Check if deal lacks specific deliverables
  if (!dealData.activities || dealData.activities.some(a => !a.details || Object.keys(a.details).length === 0)) {
    redFlags.push({
      type: 'vague_deliverables',
      severity: 'medium',
      message: 'Activities lack specific deliverables or requirements'
    });
  }

  return redFlags;
}

/**
 * Step 3: Range of Compensation Analysis (Fair Market Value)
 * Uses algorithm similar to NIL Go's 12-point analysis
 */
function analyzeFairMarketValue(dealData, athleteData, totalCompensation) {
  const analysis = {
    score: 75,
    estimated_fmv: 0,
    fmv_range: { min: 0, max: 0 },
    variance_from_fmv: 0,
    factors: {
      social_media: { score: 0, followers: 0 },
      athletic_performance: { score: 0 },
      market_size: { score: 0 },
      activity_multiplier: { score: 0 }
    },
    issues: []
  };

  // Base FMV calculation using social media metrics
  const socialMediaScore = calculateSocialMediaScore(athleteData);
  analysis.factors.social_media = socialMediaScore;

  // Athletic performance factor (estimated since we don't have real data)
  const athleticScore = estimateAthleticPerformance(dealData);
  analysis.factors.athletic_performance = athleticScore;

  // Market size factor (based on university if available)
  const marketScore = estimateMarketSize(dealData);
  analysis.factors.market_size = marketScore;

  // Activity type multiplier
  const activityScore = calculateActivityMultiplier(dealData);
  analysis.factors.activity_multiplier = activityScore;

  // Calculate estimated FMV using weighted factors
  const baseFMV = 500; // Base rate for NIL deals
  const socialMultiplier = 1 + (socialMediaScore.score / 100);
  const athleticMultiplier = 1 + (athleticScore.score / 200);
  const marketMultiplier = 1 + (marketScore.score / 200);
  const activityMultiplier = 1 + (activityScore.score / 100);

  analysis.estimated_fmv = Math.round(baseFMV * socialMultiplier * athleticMultiplier * marketMultiplier * activityMultiplier);
  
  // Create FMV range (±25%)
  analysis.fmv_range = {
    min: Math.round(analysis.estimated_fmv * 0.75),
    max: Math.round(analysis.estimated_fmv * 1.25)
  };

  // Calculate variance from estimated FMV
  analysis.variance_from_fmv = ((totalCompensation - analysis.estimated_fmv) / analysis.estimated_fmv) * 100;

  // Score based on how close compensation is to FMV range
  if (totalCompensation >= analysis.fmv_range.min && totalCompensation <= analysis.fmv_range.max) {
    analysis.score = 95; // Within range
  } else if (totalCompensation < analysis.fmv_range.min) {
    analysis.score = 90; // Under-market (generally okay)
  } else {
    // Over-market (concerning)
    const overageMultiple = totalCompensation / analysis.fmv_range.max;
    if (overageMultiple <= 2) {
      analysis.score = 70; // Moderate overage
    } else if (overageMultiple <= 3) {
      analysis.score = 40; // Significant overage
      analysis.issues.push({
        type: 'fmv_overage',
        severity: 'medium',
        message: `Compensation (${formatCurrency(totalCompensation)}) significantly exceeds fair market value range (${formatCurrency(analysis.fmv_range.min)}-${formatCurrency(analysis.fmv_range.max)})`
      });
    } else {
      analysis.score = 20; // Extreme overage
      analysis.issues.push({
        type: 'fmv_overage',
        severity: 'high',
        message: `Compensation (${formatCurrency(totalCompensation)}) is ${Math.round(overageMultiple)}x the estimated fair market value, indicating potential pay-for-play`
      });
    }
  }

  return analysis;
}

/**
 * Calculate social media score based on follower counts
 */
function calculateSocialMediaScore(athleteData) {
  const score = { score: 50, followers: 0, breakdown: [] };
  
  if (!athleteData || !athleteData.athlete_social_media) {
    return score;
  }

  let totalFollowers = 0;
  athleteData.athlete_social_media.forEach(platform => {
    const followers = platform.followers || 0;
    totalFollowers += followers;
    
    // Platform-specific scoring
    let platformScore = 0;
    if (followers >= 100000) platformScore = 90;
    else if (followers >= 50000) platformScore = 75;
    else if (followers >= 25000) platformScore = 60;
    else if (followers >= 10000) platformScore = 45;
    else if (followers >= 5000) platformScore = 30;
    else platformScore = 15;

    score.breakdown.push({
      platform: platform.platform,
      followers: followers,
      score: platformScore
    });
  });

  score.followers = totalFollowers;
  
  // Calculate weighted average based on total followers
  if (totalFollowers >= 500000) score.score = 95;
  else if (totalFollowers >= 250000) score.score = 85;
  else if (totalFollowers >= 100000) score.score = 75;
  else if (totalFollowers >= 50000) score.score = 65;
  else if (totalFollowers >= 25000) score.score = 55;
  else if (totalFollowers >= 10000) score.score = 45;
  else if (totalFollowers >= 5000) score.score = 35;
  else score.score = 25;

  return score;
}

/**
 * Estimate athletic performance (placeholder - would use real performance data)
 */
function estimateAthleticPerformance(dealData) {
  // Placeholder scoring based on sport and school tier
  return { score: 65, note: 'Estimated based on available data' };
}

/**
 * Estimate market size (placeholder - would use real market data)
 */
function estimateMarketSize(dealData) {
  // Placeholder scoring based on location and school
  return { score: 70, note: 'Estimated based on available data' };
}

/**
 * Calculate activity type multiplier
 */
function calculateActivityMultiplier(dealData) {
  if (!dealData.activities || dealData.activities.length === 0) {
    return { score: 30 };
  }

  const activityMultipliers = {
    'television_commercial': 90,
    'social_media_campaign': 85,
    'product_endorsement': 80,
    'speaking_engagement': 75,
    'appearance_event': 70,
    'autograph_session': 60,
    'photo_shoot': 65,
    'content_creation': 70,
    'other': 40
  };

  const avgMultiplier = dealData.activities.reduce((sum, activity) => {
    return sum + (activityMultipliers[activity.activity_type] || 50);
  }, 0) / dealData.activities.length;

  return { score: Math.round(avgMultiplier) };
}

/**
 * Calculate overall prediction score
 */
function calculateOverallScore(factors) {
  return Object.values(factors).reduce((total, factor) => {
    return total + (factor.score * factor.weight);
  }, 0);
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(prediction) {
  const recommendations = [];

  if (prediction.status === 'information_needed') {
    recommendations.push('Consider revising deal terms to align with fair market value');
    recommendations.push('Provide additional documentation for business purpose verification');
  }

  if (prediction.issues.some(i => i.type === 'fmv_overage')) {
    recommendations.push('Reduce compensation amount to fall within estimated fair market value range');
    recommendations.push('Consider supplementing with revenue-share compensation if athlete is eligible');
  }

  if (prediction.issues.some(i => i.type === 'exclusivity_terms')) {
    recommendations.push('Provide detailed justification for exclusivity requirements');
    recommendations.push('Consider non-exclusive arrangement to improve approval likelihood');
  }

  if (prediction.issues.some(i => i.type === 'school_ip_usage')) {
    recommendations.push('Ensure proper approval from university compliance office');
    recommendations.push('Document legitimate business need for school IP usage');
  }

  return recommendations;
}

/**
 * Format currency for display
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export default predictClearinghouse; 