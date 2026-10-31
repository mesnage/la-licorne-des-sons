#!/usr/bin/env python3
"""Build offline phoneme prompts: Piper narration + explicit French eSpeak phoneme + example.
ASR checks the example/context. Educator listening is still required for isolated phoneme fidelity.
Requires the project's existing Piper/Whisper model environment; no browser TTS is used.
"""
import argparse, hashlib, json, os, subprocess, sys, tempfile, unicodedata
import numpy as np
import soundfile as sf
from build_voice import Voice, Ear, ROOT, AUDIO, MANIFEST, STRIP
CODES={'m':'m','a':'a','l':'l','i':'i','s':'s','f':'f','u':'u','v':'v','y':'y','n':'n','ʁ':'r','e':'e','p':'p','b':'b','t':'t','d':'d','k':'k','ɡ':'g','z':'z','ʃ':'S','ʒ':'Z','o':'o','ɔ':'O','ɛ':'E','ə':'@','ø':'Y','œ':'W','ɑ̃':'A~','ɔ̃':'O~','ɛ̃':'E~','ɲ':'n^'}
STOPS={'p','b','t','d','k','ɡ'}
def normalized(text):
    return ''.join(c for c in unicodedata.normalize('NFD',text.lower()) if c.isalnum())
def phone(voice,text):return ''.join(p for p in voice.phon(text) if p not in STRIP)
def balanced(audio):
    return audio*min(.12/(float(np.sqrt(np.mean(audio*audio)))+1e-9),.85/(float(np.max(np.abs(audio)))+1e-9))
def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--redo',action='store_true');parser.add_argument('--only',default='');args=parser.parse_args();only=set(filter(None,args.only.split(',')))
    data=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {PHONEMES} from './js/data/phonemes.js';process.stdout.write(JSON.stringify(PHONEMES));"],cwd=ROOT,text=True))
    manifest=json.load(open(MANIFEST,encoding='utf8'));voice=Voice();ear=Ear()
    report_path=os.path.join(AUDIO,'phoneme-review.json');report=json.load(open(report_path,encoding='utf8')) if os.path.exists(report_path) else []
    intro=voice.synth(voice.phon('Écoute ce son.'),.85);failures=[]
    with tempfile.TemporaryDirectory() as temporary:
        for item in data:
            # Synthesis of isolated sounds is kept independent from neural narration to avoid extra vowels.
            raw_file=os.path.join(temporary,item['id']+'.wav');code=CODES[item['ipa']]+(':' if item['ipa'] not in STOPS else '_')
            def render_raw(code):
                subprocess.run([sys.executable,os.path.join(ROOT,'tools/voice/raw_phoneme.py'),code,raw_file],check=True,stderr=subprocess.DEVNULL)
                raw,sr=sf.read(raw_file,dtype='float32')
                if sr!=voice.sr:raise RuntimeError('Unexpected phoneme sample rate')
                return raw
            raw=render_raw(code)
            if len(raw)/voice.sr<.2 and item['ipa'] not in STOPS:
                code=' '.join([code]*3);raw=render_raw(code)
            for i,word in enumerate(item['examples']):
                key=item['audio'][i]
                if only and key not in only:continue
                if not args.redo and not only and key in manifest and os.path.exists(os.path.join(AUDIO,manifest[key])):continue
                context_key='w:'+word;context_source=manifest.get(context_key)
                if context_source:
                    pcm=subprocess.check_output(['ffmpeg','-v','error','-i',os.path.join(AUDIO,context_source),'-f','f32le','-ac','1','-ar',str(voice.sr),'-'])
                    context=np.frombuffer(pcm,dtype=np.float32).copy()
                else:context=voice.synth(voice.phon('Comme dans, '+word+' !'),.85)
                heard=ear.hear(context,voice.sr)
                # Match the end of the context, not a substring such as lapin in la peinture.
                contains=phone(voice,heard).endswith(phone(voice,word))
                if not contains and normalized(heard).endswith(normalized(word)):contains=True
                if not contains:
                    for attempt in range(4):
                        context=voice.synth(voice.phon('Dans le mot, '+word+' !'),.85-attempt*.03)
                        context_source=None;heard=ear.hear(context,voice.sr)
                        contains=phone(voice,heard).endswith(phone(voice,word)) or normalized(heard).endswith(normalized(word))
                        if contains:break
                if not contains:
                    failures.append((key,word,heard));print('REVIEW',key,word,heard,flush=True);continue
                audio=np.concatenate([balanced(intro),np.zeros(int(voice.sr*.18)),balanced(raw),np.zeros(int(voice.sr*.25)),balanced(context)])
                filename='phoneme-'+item['id']+'-'+hashlib.sha1(key.encode()).hexdigest()[:6]+'.mp3'
                voice.save_mp3(audio,os.path.join(AUDIO,filename),1);manifest[key]=filename
                report=[entry for entry in report if entry['key']!=key]
                report.append({'key':key,'ipa':item['ipa'],'phonemeCode':code,'phonemeEngine':'eSpeak NG French, explicit phoneme input','phonemeDuration':round(len(raw)/voice.sr,3),'componentRmsTarget':.12,'example':word,'contextSource':context_source or 'Piper French','heardContext':heard,'isolatedSoundReview':'human listening required'})
                with open(MANIFEST,'w',encoding='utf8') as out:json.dump(manifest,out,ensure_ascii=False,indent=1,sort_keys=True)
                with open(report_path,'w',encoding='utf8') as out:json.dump(report,out,ensure_ascii=False,indent=2)
                print(key,'/'+item['ipa']+'/',word,'→',heard,flush=True)
    if failures:raise RuntimeError('Contexts needing review: '+repr(failures))
    print('All phoneme contexts verified. Listen to isolated phonemes before release.')
if __name__=='__main__':main()
