/** Offline inventory; metadata proves provenance, never pronunciation quality. */
import {readFileSync,existsSync,readdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const main=read('audio/manifest.json');
const failures=[],legacy=[];
const shortPath='audio/short-robin-provenance.json';
const short=existsSync(shortPath)?read(shortPath).clips:{};
for(const [key,track] of Object.entries(short)){
 if(track.voice_id!=='ZLsOpArVEayz7qulwa9E'||track.provider!=='elevenlabs'||main[key]!==track.file||!existsSync('audio/'+track.file)||hash('audio/'+track.file)!==track.sha256)failures.push({key,error:'short Robin provenance or checksum mismatch'});
 const source=track.source_file??track.source_comparison?.source;
 const sourceHash=track.source_file?track.source_sha256:track.source_comparison?.source_sha256;
 if(!source||!existsSync('audio/'+source)||hash('audio/'+source)!==sourceHash)failures.push({key,error:'short Robin source mismatch'});
}
for(const [key,file] of Object.entries(main)){
 if(!existsSync('audio/'+file)){failures.push({key,file,error:'missing'});continue;}
 if(/^(LN|PS):/.test(key)&&!file.includes('robin'))legacy.push({key,file,status:'legacy generator: Robin excerpt or Piper fallback; verify before declaring Robin-only'});
}
let curriculumTracks=0;
for(const file of readdirSync('audio').filter(f=>/^curriculum-c\d-robin\.json$/.test(f))){
 for(const [key,track] of Object.entries(read('audio/'+file))){
 curriculumTracks++;
 if(track.speaker!=='robin'||track.provider!=='elevenlabs'||!existsSync('audio/'+track.file)||hash('audio/'+track.file)!==track.sha256)failures.push({manifest:file,key,error:'voice metadata, missing file or checksum mismatch'});
 }
}
const report={mainTracks:Object.keys(main).length,curriculumTracks,verifiedShortRobinTracks:Object.keys(short).length,failures,legacyShortClips:legacy,
 note:'Robin filenames alone are not proof of voice identity. Curriculum checks use speaker/provider metadata and file hashes; human pronunciation review is separate.'};
if(process.argv.includes('--write'))writeFileSync('docs/voice-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(failures.length)process.exitCode=1;
