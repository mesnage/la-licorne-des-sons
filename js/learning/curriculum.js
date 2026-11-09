const chapterSizes = [12, 14, 18, 12, 6, 6, 6];
const blocksPerUnit = 4;
const questionsPerBlock = 5;
const unitCount = chapterSizes.reduce((total, size) => total + size, 0);
const blockCount = unitCount * blocksPerUnit;

function requireValid(condition, context) {
  if (!condition) throw new Error('Catalogue V2 invalide : ' + context);
}

export function createCurriculum(data) {
  const { chapters, units, exerciseTypeDefinitions } = data;
  requireValid(data.schemaVersion === '2.0-draft', 'version du schéma');
  requireValid(Array.isArray(chapters) && chapters.length === chapterSizes.length &&
    data.chapterCount === chapters.length, 'nombre de chapitres');
  requireValid(Array.isArray(units) && units.length === unitCount && data.unitCount === unitCount &&
    data.blockCount === blockCount && data.questionSlotsPerPass === blockCount * questionsPerBlock,
  'nombre d’unités, de blocs ou de questions');

  const chaptersById = new Map();
  const unitsById = new Map();
  let previousUnitId = null;
  let index = 0;

  for (const [chapterIndex, chapter] of chapters.entries()) {
    const chapterId = 'C' + (chapterIndex + 1);
    const size = chapterSizes[chapterIndex];
    requireValid(chapter?.id === chapterId && chapter.units === size, chapterId);
    const chapterUnits = [];
    for (let position = 1; position <= size; position++) {
      const unit = units[index++];
      const unitId = chapterId + '-U' + String(position).padStart(2, '0');
      requireValid(unit?.id === unitId && unit.chapterId === chapterId && unit.position === position &&
        unit.prerequisiteUnitId === previousUnitId && Array.isArray(unit.blocks) &&
        unit.blocks.length === blocksPerUnit, unitId);

      for (const [blockIndex, block] of unit.blocks.entries()) {
        const blockPosition = blockIndex + 1;
        const blockId = unitId + '-B' + blockPosition;
        requireValid(block?.id === blockId && block.position === blockPosition &&
          block.questionCount === questionsPerBlock && block.isHomogeneous === true &&
          typeof block.goal === 'string' && block.goal.trim().length > 0 &&
          Object.hasOwn(exerciseTypeDefinitions ?? {}, block.exerciseType), blockId);
      }
      chapterUnits.push(unit);
      unitsById.set(unitId, unit);
      previousUnitId = unitId;
    }
    chaptersById.set(chapterId, { ...chapter, units: chapterUnits });
  }

  return {
    chapters: [...chaptersById.values()],
    getChapter: id => chaptersById.get(id),
    getUnit: id => unitsById.get(id),
    getUnitStatus(id, completedUnits) {
      const unit = unitsById.get(id);
      if (!unit) return undefined;
      if (completedUnits.has(id)) return 'completed';
      return !unit.prerequisiteUnitId || completedUnits.has(unit.prerequisiteUnitId)
        ? 'available'
        : 'upcoming';
    }
  };
}
