import assert from 'node:assert/strict';
import { recommendationReason } from '../src/domain/development-presentation.js';
import { DICTIONARY } from '../src/ui/i18n.js';

let checks=0; const equal=(actual,expected,message)=>{assert.equal(actual,expected,message);checks++}; const ok=(value,message)=>{assert.ok(value,message);checks++};
const toy={id:'shape-3',playMechanics:['shape_sorting'],progressionLevel:3,challengeLevel:3};
equal(recommendationReason(toy,{profile:{shape_sorting:{currentLevel:3}}}).key,'recommendationReason.developmentFit','exact fit gets one deterministic developmental reason');
equal(recommendationReason({...toy,progressionLevel:4},{profile:{shape_sorting:{currentLevel:3}}}).key,'recommendationReason.progression','next level gets the progression reason');
equal(recommendationReason(toy,{profile:{shape_sorting:{currentLevel:1}},diversityPreferred:true}).key,'recommendationReason.diversity','diversity is used after developmental fit');
equal(recommendationReason(toy,{profile:{shape_sorting:{currentLevel:1}},recentIds:[]}).key,'recommendationReason.recency','recency is used before familiar fallback');
equal(recommendationReason(toy,{profile:{shape_sorting:{currentLevel:1}},recentIds:['shape-3']}).key,'recommendationReason.familiar','familiar is the final fallback');
equal(recommendationReason(toy,{profile:{shape_sorting:{currentLevel:3}}}).key,recommendationReason(toy,{profile:{shape_sorting:{currentLevel:3}}}).key,'reason selection is deterministic');
const fallback={id:'legacy',productName:'Simple Puzzle',categoryCode:'puzzles_matching'};
equal(recommendationReason(fallback,{profile:{puzzle:{currentLevel:2}}}).key,'recommendationReason.developmentFit','fallback metadata stays eligible for a conservative reason');
ok(!Object.values(DICTIONARY.en.recommendationReason).join(' ').match(/score|confidence|level \d/i),'English reason copy exposes no internal score, confidence, or level number');
ok(!Object.values(DICTIONARY.zh.recommendationReason).join(' ').includes('fallback'),'Chinese reason copy exposes no fallback implementation term');
equal(DICTIONARY.en.recommendationReason.progression,'A good next challenge for current play.','English reason i18n exists');
equal(DICTIONARY.zh.recommendationReason.developmentFit,'适合孩子当前的玩法。','Chinese reason i18n exists');
console.log(`rotation recommendation reason v0.11.6: PASS (${checks} assertions)`);
