/* La Licorne des Sons — les sons et les mots */
/* Chaque son : S(graphème, son prononcé, [ancien champ, inutilisé], 'mot emoji|mot emoji|…')
   - [..] dans un mot = la partie à surligner (le son cherché)
   - deux graphèmes qui se prononcent pareil ont le même « son prononcé » (ex. 'an' et 'en' -> 'AN')
     et ne sont jamais proposés ensemble.
   Après avoir ajouté un mot, générez sa voix : python3 tools/voice/build_voice.py */
const S = (g, p, say, list) => ({ g, p, say, words: list.split('|').map(x => { x = x.trim(); const i = x.lastIndexOf(' '); return { w: x.slice(0, i), e: x.slice(i + 1) }; }) });

const VOYELLES = [
  S('a','A','a',   '[a]nanas 🍍|[a]beille 🐝|[a]rbre 🌳|[a]vion ✈️|ch[a]t 🐱|v[a]che 🐮|c[a]rotte 🥕|s[a]lade 🥗'),
  S('e','E0','e',  'ch[e]val 🐴|r[e]quin 🦈|ch[e]mise 👕|f[e]nêtre 🪟|m[e]lon 🍈|r[e]nard 🦊|c[e]rise 🍒|gr[e]nouille 🐸'),
  S('i','I','i',   'sour[i]s 🐭|l[i]t 🛏️|r[i]z 🍚|p[i]zza 🍕|g[i]rafe 🦒|b[i]scuit 🍪|l[i]on 🦁'),
  S('o','O','o',   '[o]range 🍊|m[o]to 🏍️|r[o]bot 🤖|p[o]mme 🍎|t[o]mate 🍅|c[o]chon 🐷|[o]reille 👂|v[o]lcan 🌋'),
  S('u','U','u',   'l[u]ne 🌙|l[u]nettes 👓|pl[u]me 🪶|b[u]s 🚌|t[u]lipe 🌷|tort[u]e 🐢|m[u]r 🧱'),
  S('é','EE','é',  '[é]toile ⭐|[é]léphant 🐘|b[é]bé 👶|f[é]e 🧚|[é]cureuil 🐿️|cl[é] 🔑|caf[é] ☕|v[é]lo 🚲|d[é] 🎲'),
  S('è','EH','ait','z[è]bre 🦓|ch[è]vre 🐐|fl[è]che 🏹|pi[è]ce 🪙|P[è]re Noël 🎅|sorci[è]re 🧙|cuill[è]re 🥄'),
];
const CONSONNES = [
  S('m','M',null,  '[m]oto 🏍️|[m]aison 🏠|[m]ain ✋|[m]outon 🐑|[m]iel 🍯|[m]ouche 🪰|[m]ontagne ⛰️|[m]elon 🍈'),
  S('l','L',null,  '[l]ion 🦁|[l]une 🌙|[l]apin 🐰|[l]oup 🐺|[l]ait 🥛|[l]it 🛏️|[l]icorne 🦄|[l]ivre 📖'),
  S('s','S',null,  '[s]oleil ☀️|[s]erpent 🐍|[s]apin 🎄|[s]alade 🥗|[s]ouris 🐭|[s]inge 🐒|[s]ac 🎒|[s]ucette 🍭'),
  S('r','R',null,  '[r]obot 🤖|[r]enard 🦊|[r]ose 🌹|[r]oi 👑|[r]aisin 🍇|[r]equin 🦈|[r]at 🐀|[r]adio 📻'),
  S('f','F',null,  '[f]ée 🧚|[f]raise 🍓|[f]leur 🌸|[f]eu 🔥|[f]usée 🚀|[f]ourmi 🐜|[f]romage 🧀|[f]antôme 👻|[f]rite 🍟'),
  S('p','P',null,  '[p]apillon 🦋|[p]omme 🍎|[p]oisson 🐟|[p]ain 🍞|[p]oule 🐔|[p]izza 🍕|[p]anda 🐼|[p]arapluie ☂️|[p]oire 🍐'),
  S('t','T',null,  '[t]ortue 🐢|[t]omate 🍅|[t]rain 🚂|[t]igre 🐯|[t]ambour 🥁|[t]ente ⛺|[t]éléphone 📱|[t]racteur 🚜'),
  S('b','B',null,  '[b]allon 🎈|[b]anane 🍌|[b]ateau ⛵|[b]ébé 👶|[b]onbon 🍬|[b]us 🚌|[b]aleine 🐳|[b]iberon 🍼|[b]ougie 🕯️'),
  S('n','N',null,  '[n]uage ☁️|[n]ez 👃|[n]eige ❄️|[n]oisette 🌰|[n]ounours 🧸|[n]ote 🎵|[n]œud 🎀|[n]uit 🌃'),
  S('v','V',null,  '[v]ache 🐮|[v]élo 🚲|[v]oiture 🚗|[v]olcan 🌋|[v]iolon 🎻|[v]alise 🧳|[v]er 🪱|[v]ague 🌊'),
  S('d','D',null,  '[d]auphin 🐬|[d]é 🎲|[d]inosaure 🦕|[d]ragon 🐉|[d]ent 🦷|[d]indon 🦃|[d]rapeau 🚩|[d]ouche 🚿'),
  S('g','G',null,  '[g]âteau 🎂|[g]ant 🧤|[g]orille 🦍|[g]uitare 🎸|[g]renouille 🐸|[g]lace 🍦|[g]obelet 🥤'),
  S('c','K',null,  '[c]anard 🦆|[c]arotte 🥕|[c]ochon 🐷|[c]adeau 🎁|[c]amion 🚚|[c]lown 🤡|[c]rabe 🦀|[c]oq 🐓|[c]œur ❤️'),
  S('k','K',null,  '[k]oala 🐨|[k]angourou 🦘|[k]ayak 🛶|[k]araté 🥋'),
  S('j','J',null,  '[j]us 🧃|[j]ournal 📰|[j]eu 🎮|[j]ongleur 🤹|[j]ardin 🏡|[j]oue 😊|[j]aguar 🐆'),
  S('ch','CH',null,'[ch]at 🐱|[ch]ien 🐕|[ch]apeau 🎩|[ch]ocolat 🍫|[ch]ampignon 🍄|[ch]âteau 🏰|[ch]eval 🐴|[ch]aussure 👟|[ch]ouette 🦉'),
];
const SONS = [
  S('ou','OU','ou',  'l[ou]p 🐺|p[ou]le 🐔|b[ou]gie 🕯️|s[ou]ris 🐭|f[ou]rmi 🐜|[ou]rs 🐻|c[ou]ronne 👑|m[ou]ton 🐑|hib[ou] 🦉|gen[ou] 🦵'),
  S('on','ON','on',  'b[on]bon 🍬|mout[on] 🐑|c[on]combre 🥒|ball[on] 🎈|cami[on] 🚚|coch[on] 🐷|p[on]t 🌉|poiss[on] 🐟|drag[on] 🐉|citr[on] 🍋'),
  S('an','AN','an',  'éléph[an]t 🐘|m[an]gue 🥭|p[an]da 🐼|k[an]gourou 🦘|[an]ge 👼|or[an]ge 🍊|p[an]talon 👖|ch[an]teur 🎤'),
  S('in','IN','hein','lap[in] 🐰|s[in]ge 🐒|pouss[in] 🐤|dauph[in] 🐬|rais[in] 🍇|sap[in] 🎄|requ[in] 🦈|jard[in] 🏡'),
  S('oi','OI','oie', 'r[oi] 👑|p[oi]re 🍐|p[oi]sson 🐟|[oi]seau 🐦|ét[oi]le ⭐|v[oi]ture 🚗|b[oi]te 📦|n[oi]sette 🌰|d[oi]gt ☝️'),
  S('eu','EU','eux', 'f[eu] 🔥|bl[eu] 🔵|n[eu]f 9️⃣|d[eu]x 2️⃣|j[eu] 🎮|f[eu]ille 🍃|chev[eu]x 💇'),
  S('au','O','au',   'ch[au]ssette 🧦|d[au]phin 🐬|s[au]terelle 🦗|[au]to 🚗|ch[au]ssure 👟|j[au]ne 💛|g[au]fre 🧇'),
];
const EXPERTS = [
  S('en','AN','en',  'd[en]t 🦷|t[en]te ⛺|serp[en]t 🐍|v[en]t 🌬️|[en]veloppe ✉️|[en]fant 🧒'),
  S('ain','IN','hein','p[ain] 🍞|m[ain] ✋|tr[ain] 🚂|b[ain] 🛁'),
  S('eau','O','eau', 'bat[eau] ⛵|gât[eau] 🎂|chap[eau] 🎩|ois[eau] 🐦|cad[eau] 🎁|chât[eau] 🏰|s[eau] 🪣|drap[eau] 🚩|pinc[eau] 🖌️'),
  S('ai','EH','ait', 'l[ai]t 🥛|r[ai]sin 🍇|m[ai]son 🏠|fr[ai]se 🍓|[ai]gle 🦅|ch[ai]se 🪑|bal[ai] 🧹'),
  S('ph','F',null,   '[ph]oque 🦭|[ph]oto 📷|dau[ph]in 🐬|élé[ph]ant 🐘|télé[ph]one 📱'),
  S('qu','K',null,   '[qu]ille 🎳|re[qu]in 🦈|co[qu]illage 🐚|[qu]atre 4️⃣|mas[qu]e 🎭'),
  S('gn','GN',null,  'monta[gn]e ⛰️|cy[gn]e 🦢|a[gn]eau 🐑|arai[gn]ée 🕷️'),
  S('ill','ILL',null,'chen[ill]e 🐛|gor[ill]e 🦍|pap[ill]on 🦋|f[ill]e 👧|qu[ill]e 🎳|coqu[ill]age 🐚'),
];
const LEVELS = { voyelles:VOYELLES, consonnes:CONSONNES, sons:SONS, experts:EXPERTS, tout:[...VOYELLES,...CONSONNES,...SONS,...EXPERTS] };
const ALL = LEVELS.tout;
/** nombre d'étapes jusqu'au château */
const STEPS = 20;

export { S, VOYELLES, CONSONNES, SONS, EXPERTS, LEVELS, ALL, STEPS };
