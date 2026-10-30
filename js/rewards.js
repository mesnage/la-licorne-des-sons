import { createRewards, PRIZES, SEGMENTS } from './reward-store.js';
import { unicornSVG } from './unicorn.js';

const $ = s => document.querySelector(s);
// Access to localStorage itself can be blocked by browser privacy settings.
let storage;
try { storage = window.localStorage; } catch(e){ storage = { getItem(){ throw new Error('Storage unavailable'); } }; }
const rewards = createRewards(storage);
let turning = false, rotation = 0;
function refresh(){
  const state = rewards.snapshot();
  $('#rewardPending').textContent = state.pending ? `🎡 ${state.pending} tour${state.pending > 1 ? 's' : ''} de roue` : '🎁 Mes cadeaux du jour';
  $('#spinReward').disabled = turning || !state.pending;
  $('#spinReward').textContent = turning ? 'La roue tourne…' : state.pending ? 'Tourner la roue !' : 'Termine une aventure pour tourner !';
  $('#dailyPrizes').innerHTML = PRIZES.map((p,i) => `<li><span>${p.icon} ${p.label}</span><strong>${state.counts[i]}</strong></li>`).join('');
  $('#dailyTotal').textContent = state.counts.reduce((a,b) => a+b, 0);
  document.querySelectorAll('.reward-storage-note').forEach(el => {
    el.textContent = state.persistent ? 'Enregistré sur cet appareil, dans ce navigateur.' : 'La sauvegarde est bloquée : les cadeaux seront perdus en quittant cette page.';
  });
}
function openRewards(){ refresh(); $('#rewardsDialog').showModal(); }
export function earnReward(){ rewards.earn(); refresh(); }
export function showReward(){ openRewards(); }
export function initRewards(){
  const wheel = $('#rewardWheel');
  wheel.innerHTML = SEGMENTS.map((p,i) => `<span style="--angle:${(i+.5)*360/SEGMENTS.length}deg" aria-hidden="true">${PRIZES[p].icon}</span>`).join('');
  $('#fartUnicorn').innerHTML = unicornSVG();
  $('#rewardPending').addEventListener('click', openRewards);
  $('#winReward').addEventListener('click', openRewards);
  $('#wordReward').addEventListener('click', openRewards);
  document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => {
    if(!turning) button.closest('dialog').close();
  }));
  $('#rewardsDialog').addEventListener('cancel', e => { if(turning) e.preventDefault(); });
  $('#spinReward').addEventListener('click', () => {
    if(turning) return;
    const result = rewards.spin();
    if(!result) return;
    turning = true;
    $('#rewardResult').textContent = '';
    $('#fartScene').hidden = true;
    $('#rewardsClose').disabled = true;
    refresh();
    // The selected segment's centre ends up directly beneath the top pointer.
    const target = 360 - (result.segment + .5) * 360 / SEGMENTS.length;
    rotation += 360 * 5 + ((target - rotation % 360 + 360) % 360);
    wheel.style.transform = `rotate(${rotation}deg)`;
    // A timer also completes the reveal if transitionend is suppressed or the tab was hidden.
    setTimeout(() => {
      turning = false;
      $('#rewardResult').textContent = `${result.prize.icon} ${result.prize.label}`;
      $('#fartScene').hidden = result.prize.id !== 'unicorn';
      $('#rewardsClose').disabled = false;
      refresh();
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 100 : 4200);
  });
  // Refresh the date when returning to a tab or reopening the daily counter.
  document.addEventListener('visibilitychange', refresh);
  refresh();
}
