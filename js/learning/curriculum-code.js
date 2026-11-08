import { codeUnits } from '../data/curriculum-code.js';
import { sounds } from '../data/curriculum-chapter-one.js';
import { PHONEMES } from '../data/phonemes.js';

const regular = {
  ...Object.fromEntries(Object.entries(sounds).map(([g, [ipa]]) => [g, ipa])),
  e:'ə', eu:'ø', m:'m', n:'n', p:'p', b:'b', t:'t', d:'d', c:'k', qu:'k', k:'k', g:'ɡ',
  on:'ɔ̃', an:'ɑ̃', en:'ɑ̃', in:'ɛ̃', ain:'ɛ̃', ein:'ɛ̃', oi:'wa', au:'o', eau:'o',
  è:'ɛ', ê:'ɛ', ai:'ɛ', ei:'ɛ', er:'e', ez:'e', ss:'s', z:'z', ç:'s', gu:'ɡ', ph:'f',
  gn:'ɲ', ill:'ij', eil:'ɛj', ail:'aj', ouil:'uj', euil:'œj', '|':' '
};

const introduction = {
  e:'C2-U01', eu:'C2-U03', m:'C2-U04', n:'C2-U05', p:'C2-U06', b:'C2-U07', t:'C2-U08',
  d:'C2-U09', c:'C2-U10', qu:'C2-U11', k:'C2-U11', g:'C2-U12', on:'C3-U01',
  an:'C3-U02', en:'C3-U02', in:'C3-U03', ain:'C3-U03', ein:'C3-U03', oi:'C3-U04',
  au:'C3-U05', eau:'C3-U05', è:'C3-U06', ê:'C3-U06', ai:'C3-U06', ei:'C3-U06',
  er:'C3-U07', ez:'C3-U07', ss:'C3-U08', z:'C3-U08', ç:'C3-U09', gu:'C3-U10',
  ph:'C3-U12', gn:'C3-U13', ill:'C3-U14', eil:'C3-U15', ail:'C3-U16', ouil:'C3-U17', euil:'C3-U17'
};

const alternateValues = {
  'e:-':'C2-U02', 'eu:œ':'C2-U03', 'o:ɔ':'C2-U13', 'e:ɛ':'C3-U06',
  's:z':'C3-U08', 'c:s':'C3-U09', 'g:ʒ':'C3-U11', 'ill:il':'C3-U14', 'd:-':'C4-U02', 'p:-':'C4-U02'
};

export function parseCodeForm(notation, id) {
  const fields = notation.trim().split(/ +/);
  const segments = fields.map((field, index) => {
    const [g, explicit] = field.split(':');
    if (!Object.hasOwn(regular, g) || (introduction[g] && id < introduction[g])) {
      throw new Error(id + ' · graphème non enseigné : ' + field);
    }
    const ipa = explicit ?? regular[g];
    if (ipa !== regular[g] && (!alternateValues[field] || id < alternateValues[field])) {
      throw new Error(id + ' · valeur non enseignée : ' + field);
    }
    if ((field === 'e:-' && fields[index + 1] && fields[index + 1] !== '|') ||
        (g === 'er' || g === 'ez') && fields[index + 1] ||
        (g === 'c' && (ipa === 's') !== /^[iéeêè]/.test(fields[index + 1] ?? '')) ||
        (g === 'g' && (ipa === 'ʒ') !== /^[iéeêè]/.test(fields[index + 1] ?? '')) ||
        (g === 'gu' && !/^[iéeêè]/.test(fields[index + 1] ?? ''))) {
      throw new Error(id + ' · contexte incohérent : ' + notation);
    }
    return { g: g === '|' ? ' ' : g, ipa: ipa === '-' ? '' : ipa };
  });
  return { text: segments.map(part => part.g).join(''), ipa: segments.map(part => part.ipa).join(''), segments };
}

const oralContrast = {
  'C2-U02':['i', '10101'], 'C2-U03':['œ','01010'], 'C2-U07':['p','01010'], 'C2-U09':['t','01010'],
  'C2-U13':['o','01010'], 'C3-U08':['s','01010'], 'C3-U09':['k','01010'], 'C3-U10':['ʒ','01010'],
  'C3-U13':['n','01010'], 'C3-U14':['l','00011'], 'C3-U17':['œj','01111']
};
const revisionSounds = {
  'C2-U14':['a','i','e','o','y'], 'C3-U18':['ɔ̃','ɑ̃','ɛ̃','wa','ɲ']
};

const instruction = {
  oral_initial:'Écoute le mot. Quel son entends-tu au début ?',
  oral_contrast:'Écoute le mot. Lequel de ces sons entends-tu ?',
  sound_to_grapheme:'Écoute le mot et repère le son. Choisis le graphème qui lui correspond.',
  grapheme_to_sound:'Regarde le graphème, puis choisis le son qui correspond.',
  grapheme_highlight:'Dans le mot, repère le groupe de lettres étudié.',
  rule_context:'Regarde les lettres voisines et choisis le son du groupe encadré.',
  word_family:'Lis la forme proposée et choisis le mot de la même famille.',
  blend_cv:'Assemble les graphèmes et choisis la syllabe que tu obtiens.',
  blend_cvc:'Assemble les graphèmes et choisis ce que tu obtiens.',
  blend_syllables:'Assemble les parties et choisis le mot que tu obtiens.',
  decode_word_audio:'Lis la forme écrite, puis choisis ce que tu as lu.',
  decode_pseudoword_audio:'Lis ce mot inventé, puis choisis ce que tu as lu.'
};

const phonemes = Object.fromEntries(PHONEMES.map(({ ipa, audioKey }) => [ipa, audioKey]));
const forcedOral = { agneau:'aɲo', fenouil:'fənuj' };
const oralAlternates = { 'C2-U11':'f', 'C3-U11':'k', 'C3-U18':'y' };
const oralGraphs = { 'C3-U03':['in','ain','ain','ein','ein'] };
const family = ['ri','fil','jura','lavé','roula'];
const focused = {
  'C2-U02':['e','e','e','e','e'],
  'C3-U03':['in','ain','ein','in','ain'],
  'C3-U05':['au','eau','eau','eau','eau'],
  'C3-U06':['è','ê','ai','ei','è'],
  'C3-U07':['er','ez','ez','er','er'],
  'C3-U08':['s','ss','s','s','z'],
  'C3-U09':['c','ç','c','ç','c'],
  'C3-U11':['g','g','g','g','g'],
  'C3-U17':['ouil','euil','euil','euil','euil'],
  'C3-U18':['ph','gu','c','s','ill']
};

function otherGrapheme(form, target, backup) {
  return form.segments.find(part => part.g !== target && part.g.trim())?.g ?? backup;
}

export function createCodeQuestions(unit, seed) {
  const [focus, graph, alternative, oral, training, transfer] = codeUnits[unit.id];
  const words = oral.split('/');
  const forms = training.split('/').map(row => parseCodeForm(row.toLowerCase(), unit.id));
  const reads = transfer.split('/').map(row => parseCodeForm(row, unit.id));
  return unit.blocks.flatMap((block, blockIndex) => {
    const type = block.exerciseType;
    if ([words, forms, reads].some(pool => pool.length !== block.questionCount)) throw new Error(block.id);
    return words.map((word, position) => {
      const form = forms[position];
      const read = reads[position];
      const g = focused[unit.id]?.[position] ?? graph;
      const part = form.segments.find(part => part.g === g);
      const q = {
        id: block.id + '-Q' + (position + 1), blockIndex, position, type, choices: [], audio: {},
        instruction: instruction[type]
      };
      const clip = (text, ipa) => {
        const key = 'C23:' + (ipa ? 'écrit:' + ipa + ':' : 'oral:') + text;
        q.audio[key] = { text, ...(ipa ? { ipa } : {}) };
        return key;
      };
      const sound = ipa => phonemes[ipa] ?? clip(ipa, ipa);
      const select = (field, yes, no) => {
        if (!yes || !no || yes === no) throw new Error(q.id + ' · options identiques ou absentes');
        q[field] = (seed + position) % 2 ? [no, yes] : [yes, no];
        q.answer = q[field].indexOf(yes);
      };
      switch (type) {
        case 'oral_initial':
        case 'oral_contrast': {
          const contrast = oralContrast[unit.id];
          const answer = revisionSounds[unit.id]?.[position] ?? (contrast?.[1][position] === '1' ? contrast[0] : focus);
          const wrong = contrast ? (answer === focus ? contrast[0] : focus)
            : oralAlternates[unit.id] ?? (answer === 'i' ? 'a' : 'i');
          q.prompt = clip(word, forcedOral[word]);
          q.oralExpected = answer;
          q.oralDistractor = wrong;
          select('choices', sound(answer), sound(wrong));
          break;
        }
        case 'sound_to_grapheme': {
          const target = unit.id === 'C2-U11' && position >= 2 ? 'k' : (oralGraphs[unit.id]?.[position] ?? g);
          const revision = unit.id === 'C3-U18';
          const pronunciation = revision ? (part?.ipa || focus) : unit.id === 'C2-U03' && position % 2 ? 'œ' : focus;
          q.prompt = revision ? clip(form.text, form.ipa) : clip(word, forcedOral[word]);
          q.reference = sound(pronunciation);
          select('labels', target.toUpperCase(), (target === alternative ? graph : alternative).toUpperCase());
          break;
        }
        case 'grapheme_to_sound': {
          const target = unit.id === 'C2-U14' ? ['a','i','é','o','u'][position] : g;
          const answer = regular[target];
          q.display = position >= 3 ? target.toUpperCase() : target;
          select('choices', sound(answer), sound(answer === 'i' ? 'a' : 'i'));
          break;
        }
        case 'grapheme_highlight': {
          const target = unit.id === 'C2-U13' ? ['l','o','o','o','r'][position] : g;
          q.display = form.text;
          q.prompt = clip(form.text, form.ipa);
          if (!form.segments.some(part => part.g === target)) throw new Error(q.id + ' · graphème absent');
          select('labels', target.toUpperCase(), otherGrapheme(form, target, alternative).toUpperCase());
          break;
        }
        case 'rule_context': {
          if (!part?.ipa) throw new Error(q.id + ' · règle sans cible');
          const rival = { s:'z', z:'s', k:'s', ɡ:'ʒ', ʒ:'ɡ', ij:'il', il:'ij' }[part.ipa] ?? 'a';
          q.display = form.segments.map(segment => segment === part ? '[' + segment.g + ']' : segment.g).join('');
          select('choices', sound(part.ipa), sound(rival));
          break;
        }
        case 'word_family': {
          q.display = read.text;
          select('labels', family[position], family[(position + 2) % family.length]);
          break;
        }
        case 'blend_cv':
        case 'blend_cvc':
        case 'blend_syllables':
        case 'decode_word_audio':
        case 'decode_pseudoword_audio': {
          const reading = type.startsWith('decode_');
          const pool = reading ? (unit.id === 'C2-U14' && blockIndex === 2 || unit.id === 'C2-U02' ? forms : reads) : forms;
          const answer = pool[position];
          const distractor = pool.find((candidate, index) => index > position && candidate.ipa !== answer.ipa) ??
            pool.find(candidate => candidate.ipa !== answer.ipa);
          if (!distractor) throw new Error(q.id + ' · contraste manquant');
          q.written = answer;
          q.readFirst = reading;
          q.display = reading ? answer.text : answer.segments.map(segment => segment.g).join(' + ');
          if (!reading) q.parts = answer.segments.filter(segment => segment.ipa.trim()).map(segment => sound(segment.ipa));
          select('choices', clip(answer.text, answer.ipa), clip(distractor.text, distractor.ipa));
          break;
        }
        default: throw new Error(block.id + ' · exercice inconnu : ' + type);
      }
      return q;
    });
  });
}
