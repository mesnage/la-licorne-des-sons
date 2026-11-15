const ease = t => t*t*(3-2*t);

// Each animal rests at both ends. The heading changes during the rest,
// before the first step in the new direction.
export function animalPatrol(seconds, period, range) {
  const halfTrips=(seconds/period)*2;
  const returning=Math.floor(halfTrips)%2===1;
  const fraction=halfTrips%1;
  const progress=Math.min(1,Math.max(0,(fraction-.12)/.76));
  const distance=ease(progress)*2*range;
  return {
    facing:returning?-1:1,
    offset:returning?range-distance:distance-range,
    walked:distance,
    effort:4*progress*(1-progress)
  };
}
