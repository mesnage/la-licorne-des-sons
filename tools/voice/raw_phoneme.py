#!/usr/bin/env python3
"""Render an explicit eSpeak French phoneme (not its letter name) to a WAV.
Uses the eSpeak library already bundled with the existing Piper build environment.
Run in a separate process: Piper's text-only eSpeak initialization has different output settings.
"""
import ctypes, pathlib, sys
import numpy as np
import soundfile as sf
import piper

def main():
    code,destination=sys.argv[1:]
    root=pathlib.Path(piper.__file__).parent
    lib=ctypes.CDLL(str(root/'espeakbridge.so'))
    lib.espeak_Initialize.argtypes=[ctypes.c_int,ctypes.c_int,ctypes.c_char_p,ctypes.c_int]
    sr=lib.espeak_Initialize(2,0,str(root/'espeak-ng-data').encode(),0)
    if sr<=0:raise RuntimeError('Cannot initialize French phoneme voice')
    callback_type=ctypes.CFUNCTYPE(ctypes.c_int,ctypes.POINTER(ctypes.c_short),ctypes.c_int,ctypes.c_void_p)
    chunks=[]
    @callback_type
    def collect(samples,length,events):
        if samples and length:chunks.append(np.ctypeslib.as_array(samples,shape=(length,)).copy())
        return 0
    lib.espeak_SetSynthCallback.argtypes=[callback_type];lib.espeak_SetSynthCallback(collect)
    lib.espeak_SetVoiceByName.argtypes=[ctypes.c_char_p]
    if lib.espeak_SetVoiceByName(b'fr')!=0:raise RuntimeError('French voice unavailable')
    lib.espeak_SetParameter(1,105,0)
    lib.espeak_Synth.argtypes=[ctypes.c_char_p,ctypes.c_size_t,ctypes.c_uint,ctypes.c_int,ctypes.c_uint,ctypes.c_uint,ctypes.c_void_p,ctypes.c_void_p]
    text=('[[ '+code+' ]]').encode()
    if lib.espeak_Synth(text,len(text)+1,0,1,0,0x101,None,None)!=0:raise RuntimeError('Cannot synthesize phoneme')
    lib.espeak_Synchronize()
    if not chunks:raise RuntimeError('Empty phoneme')
    a=np.concatenate(chunks).astype(np.float32)/32768
    active=np.where(np.abs(a)>.003)[0]
    if not len(active):raise RuntimeError('Silent phoneme '+code)
    a=a[max(0,active[0]-int(sr*.02)):active[-1]+int(sr*.05)]
    sf.write(destination,a,sr)
if __name__=='__main__':main()
