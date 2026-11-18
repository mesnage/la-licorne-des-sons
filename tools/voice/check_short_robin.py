"""Offline French ASR smoke check; isolated phoneme identity still needs listening."""
import json, subprocess
from pathlib import Path
import numpy as np
import sherpa_onnx
root=Path(__file__).resolve().parents[2]
model=root/'tools/voice/models/sherpa-onnx-whisper-small'
r=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=str(model/'small-encoder.int8.onnx'),decoder=str(model/'small-decoder.int8.onnx'),tokens=str(model/'small-tokens.txt'),language='fr',task='transcribe',num_threads=4)
p=root/'audio/short-robin-provenance.json';data=json.loads(p.read_text())
for k,row in data['clips'].items():
 raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(root/'audio'/row['file']),'-f','f32le','-ac','1','-ar','16000','-'])
 samples=np.frombuffer(raw,dtype=np.float32);stream=r.create_stream();stream.accept_waveform(16000,samples);r.decode_stream(stream)
 row['asr']={'engine':'local Whisper small (French)','transcript':stream.result.text.strip(),'note':'Isolated letters and phonemes can be mis-transcribed; human listening remains pending.'}
 print(k,repr(row['asr']['transcript']),flush=True)
 p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
