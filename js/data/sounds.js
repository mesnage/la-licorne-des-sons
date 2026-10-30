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
  S('m','M',null,  '[m]oto 🏍️|[m]aison 🏠|[m]ain ✋|[m]outon 🐑|[m]iel 🍯|[m]ouche 🪰|[m]ontagne ⛰️|[m]elon 🍈|[m]oufle 🧤|[m]arteau 🔨|[m]iroir 🪞|[m]onstre 👾|[m]armotte 🦫|[m]anège 🎠|[m]agicien 🧙|[m]oustache 🥸'),
  S('l','L',null,  '[l]ion 🦁|[l]une 🌙|[l]apin 🐰|[l]oup 🐺|[l]ait 🥛|[l]it 🛏️|[l]icorne 🦄|[l]ivre 📖|[l]ampe 💡|[l]oupe 🔎|[l]ac 🏞️|[l]angue 👅|[l]éopard 🐆|[l]ama 🦙|[l]égume 🥦|[l]ocomotive 🚂|[l]utin 🧝|[l]uge 🛷'),
  S('s','S',null,  '[s]oleil ☀️|[s]erpent 🐍|[s]apin 🎄|[s]alade 🥗|[s]ouris 🐭|[s]inge 🐒|[s]ac 🎒|[s]ucette 🍭|[s]avon 🧼|[s]irène 🧜|[s]ifflet 📣|[s]tylo 🖊️|[s]andale 🩴|[s]cie 🪚|[s]el 🧂|[s]oupe 🥣'),
  S('r','R',null,  '[r]obot 🤖|[r]enard 🦊|[r]ose 🌹|[r]oi 👑|[r]aisin 🍇|[r]equin 🦈|[r]at 🐀|[r]adio 📻|[r]adis 🥬|[r]oue 🛞|[r]ègle 📏|[r]uban 🎀|[r]uche 🐝|[r]ame 🛶|[r]ideau 🪟|[r]ivière 🏞️|[r]aquette 🏸|[r]ouge 🔴'),
  S('f','F',null,  '[f]ée 🧚|[f]raise 🍓|[f]leur 🌸|[f]eu 🔥|[f]usée 🚀|[f]ourmi 🐜|[f]romage 🧀|[f]antôme 👻|[f]rite 🍟|[f]orêt 🌲|[f]arine 🌾|[f]ourchette 🍴|[f]oulard 🧣|[f]locon ❄️|[f]ontaine ⛲|[f]enouil 🥬|[f]ramboise 🍓|[f]aucon 🦅'),
  S('p','P',null,  '[p]apillon 🦋|[p]omme 🍎|[p]oisson 🐟|[p]ain 🍞|[p]oule 🐔|[p]izza 🍕|[p]anda 🐼|[p]arapluie ☂️|[p]oire 🍐|[p]ie 🐦|[p]irate 🏴‍☠️|[p]ingouin 🐧|[p]erroquet 🦜|[p]ince 🦀|[p]êche 🍑|[p]otiron 🎃|[p]rune 🟣|[p]oupée 🪆|[p]lage 🏖️'),
  S('t','T',null,  '[t]ortue 🐢|[t]omate 🍅|[t]rain 🚂|[t]igre 🐯|[t]ambour 🥁|[t]ente ⛺|[t]éléphone 📱|[t]racteur 🚜|[t]asse ☕|[t]apis 🧶|[t]aupe 🐾|[t]oupie 🌀|[t]rousse ✏️|[t]rompette 🎺|[t]abouret 🪑|[t]orchon 🧻|[t]ablier 👨‍🍳'),
  S('b','B',null,  '[b]allon 🎈|[b]anane 🍌|[b]ateau ⛵|[b]ébé 👶|[b]onbon 🍬|[b]us 🚌|[b]aleine 🐳|[b]iberon 🍼|[b]ougie 🕯️|[b]iche 🦌|[b]ijou 💎|[b]ouquet 💐|[b]rouette 🛒|[b]rosse 🪮|[b]rique 🧱|[b]ol 🥣|[b]ulle 🫧|[b]outon 🔘|[b]iscotte 🍞'),
  S('n','N',null,  '[n]uage ☁️|[n]ez 👃|[n]eige ❄️|[n]oisette 🌰|[n]ounours 🧸|[n]ote 🎵|[n]œud 🎀|[n]uit 🌃|[n]arval 🐳|[n]id 🪺|[n]appe 🍽️|[n]énuphar 🪷|[n]avet 🥬|[n]ougat 🍬|[n]ouille 🍜|[n]iche 🐕'),
  S('v','V',null,  '[v]ache 🐮|[v]élo 🚲|[v]oiture 🚗|[v]olcan 🌋|[v]iolon 🎻|[v]alise 🧳|[v]er 🪱|[v]ague 🌊|[v]oile ⛵|[v]ase 🏺|[v]is 🔩|[v]este 🧥|[v]illage 🏘️|[v]iolette 🌸|[v]eau 🐮|[v]entilateur 🌀|[v]erre 🥛|[v]igne 🍇'),
  S('d','D',null,  '[d]auphin 🐬|[d]é 🎲|[d]inosaure 🦕|[d]ragon 🐉|[d]ent 🦷|[d]indon 🦃|[d]rapeau 🚩|[d]ouche 🚿|[d]entifrice 🪥|[d]omino 🁣|[d]romadaire 🐪|[d]oudou 🧸|[d]ame 👸|[d]uvet 🛏️|[d]essert 🍰|[d]anse 💃|[d]écor 🎭'),
  S('g','G',null,  '[g]âteau 🎂|[g]ant 🧤|[g]orille 🦍|[g]uitare 🎸|[g]renouille 🐸|[g]lace 🍦|[g]obelet 🥤|[g]alette 🥞|[g]arage 🚗|[g]omme 🧽|[g]ourde 🥤|[g]rue 🏗️|[g]uêpe 🐝|[g]raine 🌱|[g]riffe 🐾|[g]roseille 🔴|[g]rappe 🍇'),
  S('c','K',null,  '[c]anard 🦆|[c]arotte 🥕|[c]ochon 🐷|[c]adeau 🎁|[c]amion 🚚|[c]lown 🤡|[c]rabe 🦀|[c]oq 🐓|[c]œur ❤️|[c]ube 🧊|[c]abane 🛖|[c]asserole 🍲|[c]artable 🎒|[c]asque ⛑️|[c]ollier 📿|[c]occinelle 🐞|[c]anapé 🛋️|[c]rayon 🖍️'),
  S('k','K',null,  '[k]oala 🐨|[k]angourou 🦘|[k]ayak 🛶|[k]araté 🥋|[k]aléidoscope 🔭|[k]imono 🥋|[k]ilomètre 🛣️|[k]ebab 🥙|[k]art 🏎️|[k]laxon 📣'),
  S('j','J',null,  '[j]us 🧃|[j]ournal 📰|[j]eu 🎮|[j]ongleur 🤹|[j]ardin 🏡|[j]oue 😊|[j]aguar 🐆|[j]ouet 🧸|[j]ambon 🍖|[j]onquille 🌼|[j]udo 🥋|[j]umelles 🔭|[j]eton 🪙|[j]ument 🐎|[j]uin 📅'),
  S('ch','CH',null,'[ch]at 🐱|[ch]ien 🐕|[ch]apeau 🎩|[ch]ocolat 🍫|[ch]ampignon 🍄|[ch]âteau 🏰|[ch]eval 🐴|[ch]aussure 👟|[ch]ouette 🦉|[ch]ou 🥬|[ch]emin 🛤️|[ch]arrette 🛒|[ch]ausson 🥿|[ch]evalier 🛡️|[ch]asseur 🏹|[ch]ameau 🐫|[ch]eminée 🔥|[ch]evreuil 🦌'),
  S('h','H',null,'[h]aricot 🫘|[h]érisson 🦔|[h]ibou 🦉|[h]ippopotame 🦛|[h]élicoptère 🚁|[h]amac 🛏️|[h]ache 🪓|[h]otte 🎅'),
  S('q','K',null,'[q]uatre 4️⃣|[q]uille 🎳|mas[q]ue 🎭|re[q]uin 🦈|[q]uestion ❓|[q]uiche 🥧'),
  S('w','W',null,'[w]agon 🚃|ki[w]i 🥝|[w]apiti 🦌|[w]eek-end 📅|[w]estern 🤠'),
  S('x','KS',null,'ta[x]i 🚕|bo[x]e 🥊|sa[x]ophone 🎷|mi[x]eur 🥤|e[x]plorateur 🧭|e[x]traterrestre 👽'),
  S('y','ILL',null,'[y]aourt 🥣|[y]oga 🧘|[y]oyo 🪀|[y]eux 👀|[y]ak 🦬'),
  S('z','Z',null,'[z]èbre 🦓|[z]éro 0️⃣|[z]oo 🦁|[z]igzag ⚡|ga[z]elle 🦌|lé[z]ard 🦎'),
  S('ç','S',null,'gar[ç]on 👦|gla[ç]on 🧊|balan[ç]oire 🛝|fa[ç]ade 🏠|le[ç]on 📖|re[ç]u 🧾'),
];
const SONS = [
  S('ou','OU','ou',  'l[ou]p 🐺|p[ou]le 🐔|b[ou]gie 🕯️|s[ou]ris 🐭|f[ou]rmi 🐜|[ou]rs 🐻|c[ou]ronne 👑|m[ou]ton 🐑|hib[ou] 🦉|gen[ou] 🦵|m[ou]choir 🤧|c[ou]ette 🛏️|r[ou]e 🛞|p[ou]pée 🪆|c[ou]teau 🍴|m[ou]lin 🌬️|r[ou]leau 🧻|s[ou]rire 😊'),
  S('on','ON','on',  'b[on]bon 🍬|mout[on] 🐑|c[on]combre 🥒|ball[on] 🎈|cami[on] 🚚|coch[on] 🐷|p[on]t 🌉|poiss[on] 🐟|drag[on] 🐉|citr[on] 🍋|bout[on] 🔘|cray[on] 🖍️|avi[on] ✈️|mais[on] 🏠|hériss[on] 🦔|viol[on] 🎻|papill[on] 🦋|pantal[on] 👖'),
  S('an','AN','an',  'éléph[an]t 🐘|m[an]gue 🥭|p[an]da 🐼|k[an]gourou 🦘|[an]ge 👼|or[an]ge 🍊|p[an]talon 👖|ch[an]teur 🎤|rub[an] 🎀|g[an]t 🧤|volc[an] 🌋|br[an]che 🌿|bal[an]çoire 🛝|mél[an]ge 🥣|gr[an]d 🦒|p[an]thère 🐈‍⬛'),
  S('in','IN','hein','lap[in] 🐰|s[in]ge 🐒|pouss[in] 🐤|dauph[in] 🐬|rais[in] 🍇|sap[in] 🎄|requ[in] 🦈|jard[in] 🏡|pat[in] ⛸️|chem[in] 🛤️|moul[in] 🌬️|mar[in] ⚓|coqu[in] 😜|couss[in] 🛋️|dess[in] 🎨|lut[in] 🧝'),
  S('oi','OI','oie', 'r[oi] 👑|p[oi]re 🍐|p[oi]sson 🐟|[oi]seau 🐦|ét[oi]le ⭐|v[oi]ture 🚗|b[oi]te 📦|n[oi]sette 🌰|d[oi]gt ☝️|mouch[oi]r 🤧|tir[oi]r 🗄️|mir[oi]r 🪞|arros[oi]r 🚿|n[oi]r ⚫|v[oi]le ⛵|p[oi]vre 🧂'),
  S('eu','EU','eux', 'f[eu] 🔥|bl[eu] 🔵|n[eu]f 9️⃣|d[eu]x 2️⃣|j[eu] 🎮|f[eu]ille 🍃|chev[eu]x 💇|coul[eu]r 🎨|b[eu]rre 🧈|fl[eu]r 🌸|p[eu]r 😮|tract[eu]r 🚜|aspirat[eu]r 🧹|ordinat[eu]r 💻'),
  S('au','O','au',   'ch[au]ssette 🧦|d[au]phin 🐬|s[au]terelle 🦗|[au]to 🚗|ch[au]ssure 👟|j[au]ne 💛|g[au]fre 🧇|[au]truche 🪶|ch[au]d ☀️|ch[au]dron 🥘|f[au]teuil 🪑|[au]tobus 🚌|[au]tomne 🍂'),
  S('ui','UI','oui','n[ui]t 🌃|pl[ui]e 🌧️|fr[ui]t 🍎|c[ui]sine 🍳|p[ui]ts 🪣|parapl[ui]e ☂️|h[ui]t 8️⃣|bisc[ui]t 🍪'),
  S('oin','OIN','oin','c[oin] 📐|p[oin]t ⚫|f[oin] 🌾|p[oin]g ✊|gr[oin] 🐷|tém[oin] 👀'),
  S('ei','EH','ait','r[ei]ne 👸|n[ei]ge ❄️|p[ei]gne 🪮|bal[ei]ne 🐳|s[ei]ze 🔢|tr[ei]ze 🔢'),
  S('er','EE','é','pani[er] 🧺|boulang[er] 🧑‍🍳|jou[er] 🎮|goût[er] 🍪|roch[er] 🪨|cloch[er] ⛪|fraisi[er] 🍓|cerisi[er] 🌸'),
  S('ez','EE','é','n[ez] 👃|ass[ez] 🛑|ch[ez] 🏠|r[ez]-de-chaussée 🏢'),
  S('un','IN','hein','l[un]di 📅|br[un] 🟤|chac[un] 🧒|auc[un] 🚫|comm[un] 🤝|[un] 1️⃣'),
];
const EXPERTS = [
  S('en','AN','en',  'd[en]t 🦷|t[en]te ⛺|serp[en]t 🐍|v[en]t 🌬️|[en]veloppe ✉️|[en]fant 🧒|par[en]t 👨‍👩‍👧|arg[en]t 🪙|c[en]tre 🎯|v[en]dredi 📅|cal[en]drier 🗓️|v[en]tre 👕'),
  S('ain','IN','hein','p[ain] 🍞|m[ain] ✋|tr[ain] 🚂|b[ain] 🛁|cop[ain] 🧒|hum[ain] 🧑|n[ain] 🧙|dem[ain] 📅|s[ain] 💪|rom[ain] 🏛️'),
  S('eau','O','eau', 'bat[eau] ⛵|gât[eau] 🎂|chap[eau] 🎩|ois[eau] 🐦|cad[eau] 🎁|chât[eau] 🏰|s[eau] 🪣|drap[eau] 🚩|pinc[eau] 🖌️'),
  S('ai','EH','ait', 'l[ai]t 🥛|r[ai]sin 🍇|m[ai]son 🏠|fr[ai]se 🍓|[ai]gle 🦅|ch[ai]se 🪑|bal[ai] 🧹'),
  S('ph','F',null,   '[ph]oque 🦭|[ph]oto 📷|dau[ph]in 🐬|élé[ph]ant 🐘|télé[ph]one 📱'),
  S('qu','K',null,   '[qu]ille 🎳|re[qu]in 🦈|co[qu]illage 🐚|[qu]atre 4️⃣|mas[qu]e 🎭'),
  S('gn','GN',null,  'monta[gn]e ⛰️|cy[gn]e 🦢|a[gn]eau 🐑|arai[gn]ée 🕷️|pei[gn]e 🪮|li[gn]e 📏|ba[gn]oire 🛁|vi[gn]e 🍇|poi[gn]et ✋|tro[gn]on 🍎'),
  S('ill','ILL',null,'chen[ill]e 🐛|gor[ill]e 🦍|pap[ill]on 🦋|f[ill]e 👧|qu[ill]e 🎳|coqu[ill]age 🐚|citrou[ill]e 🎃|b[ill]e 🔮|van[ill]e 🍦|jonqu[ill]e 🌼|fam[ill]e 👨‍👩‍👧|br[ill]er ✨'),
  S('ein','IN','hein','c[ein]ture 🥋|p[ein]ture 🎨|fr[ein] 🚲|pl[ein] 🪣|t[ein]ture 🎨|p[ein]tre 🧑‍🎨'),
  S('ien','YIN','ien','ch[ien] 🐕|b[ien] 👍|r[ien] 🚫|music[ien] 🎵|magic[ien] 🧙|coméd[ien] 🎭|pharmac[ien] 💊'),
  S('eil','EIL','eil','sol[eil] ☀️|rév[eil] ⏰|ort[eil] 🦶|par[eil] 👯|cons[eil] 💬|appar[eil] 📷'),
  S('ail','AIL','ail','[ail] 🧄|trav[ail] 🛠️|vitr[ail] 🪟|r[ail] 🛤️|port[ail] 🚪|épouvant[ail] 🌾'),
  S('ouil','OUIL','ouil','fen[ouil] 🥬|gren[ouil]le 🐸|citr[ouil]le 🎃|chat[ouil]le 🤭|n[ouil]le 🍜|r[ouil]le 🟠|b[ouil]lon 🍲'),
  S('euil','EUIL','euil','faut[euil] 🪑|écur[euil] 🐿️|f[euil]le 🍃|s[euil] 🚪|chevr[euil] 🦌|tr[euil] 🏗️'),
  S('tion','SION','sion','addi[tion] ➕|soustrac[tion] ➖|opéra[tion] 🧮|décora[tion] 🎀|invita[tion] 💌|récréa[tion] 🛝'),
];
const LEVELS = { voyelles:VOYELLES, consonnes:CONSONNES, sons:SONS, experts:EXPERTS, tout:[...VOYELLES,...CONSONNES,...SONS,...EXPERTS] };
const ALL = LEVELS.tout;
/** nombre d'étapes jusqu'au château */
const STEPS = 20;

export { S, VOYELLES, CONSONNES, SONS, EXPERTS, LEVELS, ALL, STEPS };
