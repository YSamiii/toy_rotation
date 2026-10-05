import { catalogSafetyStatus } from './catalog-safety.js';
import { earlyRotationEvidenceFor } from '../data/early-rotation-evidence-batch1.js';
import { earlyRotationEvidenceBatch2For } from '../data/early-rotation-evidence-batch2.js';
import { earlyRotationEvidenceBatch3For } from '../data/early-rotation-evidence-batch3.js';

export const EARLY_ROTATION_ELIGIBILITY=Object.freeze(['EARLY_ROTATION_ALLOWED','AGE_RECOMMENDED_ONLY','HARD_SAFETY_GATE','INSUFFICIENT_EVIDENCE']);
const HARD=new Set(['SMALL_PARTS_GATE','GROSS_MOTOR_GATE','OTHER_HARD_GATE']);
const PREREQUISITES=Object.freeze({shape_sorting:{matching:2,visualSpatial:2},puzzle:{visualSpatial:2,attentionPersistence:2},matching_sorting:{matching:2,sorting:2},blocks_build:{fineMotor:2,visualSpatial:2},threading_lacing:{bilateralCoordination:3,fineMotor:3},lock_key:{problemSolving:3,fineMotor:3},screw_bolt_tool:{toolUse:3,handStrength:3},magnetic_build:{fineMotor:3,visualSpatial:3},counting_quantity:{earlyMath:3,attentionPersistence:2},pretend_role:{pretendPlay:2,language:2},balance:{grossMotor:3},fine_motor_general:{fineMotor:2},cause_effect:{causeEffect:2}});
const fallbackMechanism=toy=>{const category=String(toy.categoryCode||'').toLowerCase();if(/puzzle/.test(category))return 'puzzle';if(/block|construct/.test(category))return 'blocks_build';if(/vehicle|track/.test(category))return 'vehicles_tracks';if(/music/.test(category))return 'music_play';if(/pretend/.test(category))return 'pretend_role';if(/sensory/.test(category))return 'sensory';return 'general_play';};
const evidence=toy=>{const safety=toy.userMetadata?.safety||{};const status=catalogSafetyStatus(toy);if(status!=='UNKNOWN')return {safetyEvidenceStatus:status==='NO_DOCUMENTED_HARD_GATE'?'PARTIAL':'VERIFIED',evidence:{sourceType:'OFFICIAL_OR_REVIEWED_EXISTING',sourceUrl:safety.safetySource,sourceTitle:null,manufacturer:toy.brand,retrievedAt:safety.safetyVerifiedAt,evidenceType:'safety_review',quotedOrStructuredClaim:safety.evidenceNote,confidence:status==='NO_DOCUMENTED_HARD_GATE'?'partial':'high',reviewStatus:'reviewed'}};return {safetyEvidenceStatus:'INSUFFICIENT',evidence:{sourceType:null,sourceUrl:null,sourceTitle:null,manufacturer:toy.brand,retrievedAt:null,evidenceType:'insufficient',quotedOrStructuredClaim:'No SKU-level safety evidence has been reviewed; early rotation is fail-closed.',confidence:'insufficient',reviewStatus:'backlog'}};};
export function withEarlyRotationBaseline(toy={}){
  const mechanisms=(toy.playMechanics||[]).filter(Boolean);
  const mechanism=mechanisms[0]||fallbackMechanism(toy);
  const safetyStatus=catalogSafetyStatus(toy);
  const overlay=earlyRotationEvidenceBatch3For(toy.canonicalKey)||earlyRotationEvidenceBatch2For(toy.canonicalKey)||earlyRotationEvidenceFor(toy.canonicalKey);
  const existing={ ...(toy.userMetadata?.developmentFit||{}), ...(overlay||{}) };
  const evidenceInfo=evidence(toy);
  const inferred=HARD.has(safetyStatus)?'HARD_SAFETY_GATE':safetyStatus==='VERIFIED_NO_EXTRA_GATE'?'EARLY_ROTATION_ALLOWED':safetyStatus==='NO_DOCUMENTED_HARD_GATE'?'AGE_RECOMMENDED_ONLY':'INSUFFICIENT_EVIDENCE';
  const explicitEligibility=EARLY_ROTATION_ELIGIBILITY.includes(existing.earlyRotationEligibility);
  const earlyRotationEligibility=explicitEligibility?existing.earlyRotationEligibility:inferred;
  const eligibilityPolicyOrigin=existing.eligibilityPolicyOrigin||(explicitEligibility?'OFFICIAL_EVIDENCE':'SAFETY_INFERRED');
  const safetyEvidenceStatus=existing.safetyEvidenceStatus||evidenceInfo.safetyEvidenceStatus;
  const researchStatus=existing.researchStatus||(safetyEvidenceStatus==='INSUFFICIENT'?'NOT_RESEARCHED':'RESEARCHED_RESOLVED');
  const prerequisiteSkills=existing.prerequisiteSkills||PREREQUISITES[mechanism]||{};
  const maximumEarlyMonths=earlyRotationEligibility==='EARLY_ROTATION_ALLOWED'&&Number(existing.maximumEarlyMonths)>0?Number(existing.maximumEarlyMonths):null;
  const record={...existing,mechanism,prerequisiteSkills,stretchSkills:existing.stretchSkills||[],developmentalEntryAge:existing.developmentalEntryAge??toy.minAgeMonths??null,earlyRotationEligibility,eligibilityPolicyOrigin,safetyEvidenceStatus,researchStatus,evidence:existing.evidence||evidenceInfo.evidence,maximumEarlyMonths,insufficientReason:existing.insufficientReason??(safetyEvidenceStatus==='INSUFFICIENT'?'SKU-level safety evidence has not yet been reviewed.':null)};
  return {...toy,recommendedAgeMin:toy.minAgeMonths??null,recommendedAgeMax:toy.maxAgeMonths??null,developmentalEntryAge:record.developmentalEntryAge,earlyRotationEligibility,safetyEvidenceStatus,mechanism,prerequisiteSkills,maximumEarlyMonths,userMetadata:{...(toy.userMetadata||{}),...(overlay?.safety?{safety:overlay.safety}:{}),developmentFit:record}};
}
export function prerequisitesSatisfied(toy,profile={}){for(const [skill,level] of Object.entries(toy.prerequisiteSkills||toy.userMetadata?.developmentFit?.prerequisiteSkills||{})){const value=profile[skill]?.manualLevel??profile[skill]?.currentLevel??profile[skill]?.autoLevel??0;if(value<level)return false;}return true;}
