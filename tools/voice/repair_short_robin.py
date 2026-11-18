#!/usr/bin/env python3
"""Install verified Robin excerpts and contextual replacements. No pronunciation markup.
Requires the approved generation batch and its source comparisons. Paid requests are cached without retries.
"""
import argparse,base64,hashlib,html,json,subprocess
from pathlib import Path
from build_curriculum_robin import ROOT,VOICE,MODEL,normalize,load_key,request
CACHE=ROOT/'tools/voice/previews/robin-short-20261118'
CONTEXTS={
 'LN:w':('Double vé','Double vé, comme le nom de la lettre W.',0,9),
 'LN:y':('I grec','I grec, comme le nom de la lettre Y.',0,6),
 'PS:ail':('Ail','Ail, comme une gousse d’ail.',0,3),
 'PS:eil':('Paye','Paye, comme dans la paye.',1,4),
 'PS:euil':('Œil','Œil, comme un œil qui regarde.',0,3),
 'PS:ien':('Bien','Bien, comme dans bien joué.',1,4),
 'PS:oi':('Oie','Oie, comme l’oiseau de la ferme.',0,3),
 'PS:oin':('Loin','Loin, comme dans très loin.',1,4),
 'PS:ouil':('Rouille','Rouille, comme la rouille sur le métal.',1,7),
 'PS:tion':('Attention','Attention, comme dans fais attention.',5,9),
 'PS:ui':('Huis','Huis, comme dans à huis clos.',0,4),
 'PS:x':('Axe','Axe, comme un axe de rotation.',1,3)
}
def save(path,value):
 temp=path.with_suffix('.tmp');temp.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n');temp.replace(path)
def digest(data):return hashlib.sha256(data).hexdigest()
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--generate',action='store_true');args=ap.parse_args()
 if not args.generate:print('19 verified existing excerpts; up to 12 contextual Robin requests.');return
 path=ROOT/'audio/short-robin-provenance.json';provenance=json.loads(path.read_text());manifest=json.loads((ROOT/'audio/manifest.json').read_text());records={}
 key=load_key(ROOT/'.env.local')
 for clip,row in provenance['clips'].items():
  comparison=row.get('legacy_source_comparison',{})
  previous=row['previous_file']
  record={k:v for k,v in row.items() if k not in ('asr','pronunciation_dictionary','raw_sha256')}
  if comparison.get('correlation',0)>.95:
   raw=(ROOT/'audio'/previous).read_bytes();record.pop('speechSeconds',None);record.update(method='verified excerpt of existing Robin source',source_comparison=comparison)
  else:
   word,text,start,end=CONTEXTS[clip];cache=CACHE/('context-'+clip.replace(':','-')+'.json')
   if not cache.exists():cache.write_bytes(request(key,text,with_timing=True))
   result=json.loads(cache.read_bytes());alignment=result['alignment'];chars=''.join(alignment['characters'])
   if not chars.casefold().startswith(word.casefold()):raise ValueError('Unexpected alignment for '+clip)
   starts=alignment['character_start_times_seconds'];ends=alignment['character_end_times_seconds']
   a=max(0,starts[start]-(.025 if start==0 else .005));b=max(ends[end-1],starts[end])+.015
   source=base64.b64decode(result['audio_base64']);source_name='short-robin-sources/'+digest(source)[:20]+'.mp3'
   source_path=ROOT/'audio'/source_name;source_path.parent.mkdir(exist_ok=True);source_path.write_bytes(source)
   cut=subprocess.run(['ffmpeg','-v','error','-i','pipe:0','-ss',str(a),'-t',str(b-a),'-f','mp3','pipe:1'],input=source,capture_output=True,check=True).stdout
   target=CACHE/(clip.replace(':','-')+'-context.mp3');seconds=normalize(cut,target)
   if not .10<=seconds<=1.5:raise ValueError('Unexpected duration for '+clip)
   raw=target.read_bytes();record.update(method='excerpt from contextual Robin speech',text=text,source_file=source_name,source_sha256=digest(source),crop_seconds=[a,b],speechSeconds=seconds)
  filename='court-robin-'+digest(raw)[:20]+'.mp3';(ROOT/'audio'/filename).write_bytes(raw)
  record.update(file=filename,sha256=digest(raw),review='pending_human_listening')
  records[clip]=record;print(f'{len(records)}/31 {clip}: '+record['method'],flush=True)
  save(CACHE/'context-progress.json',records)
 provenance['clips']=records;save(path,provenance);manifest.update({k:r['file'] for k,r in records.items()});save(ROOT/'audio/manifest.json',manifest)
 cards=''
 for k,r in records.items():
  source=r.get('source_file') or r.get('source_comparison',{}).get('source')
  cards+='<article><h2>'+html.escape(k)+'</h2><p>/'+html.escape(r['ipa'])+'/</p><audio controls preload="none" src="audio/'+r['file']+'"></audio><details><summary>Écouter le contexte d’origine</summary><audio controls preload="none" src="audio/'+source+'"></audio></details></article>'
 (ROOT/'voice-review.html').write_text('''<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Robin · Lettres et sons</title><style>body{font:18px system-ui;max-width:1000px;margin:auto;padding:24px;background:#fff8ed;color:#39483c}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}article{background:white;padding:16px;border-radius:16px}audio{max-width:100%}details{margin-top:12px}</style><h1>Robin · Lettres et sons</h1><p>31 extraits de la voix Robin. LN : nom de lettre. PS : son composé. Les originaux sont disponibles pour comparer la prononciation ; la validation finale à l’écoute reste à faire.</p><p><a href="index.html?version=robin-17">Jouer avec Paillette</a></p><main>'''+cards+'</main></html>')
 print('Installed verified/contextual replacements.',flush=True)
if __name__=='__main__':
 try:main()
 except Exception as error:
  print('Stopped:',str(error) if isinstance(error,ValueError) else type(error).__name__,flush=True);raise SystemExit(1)
