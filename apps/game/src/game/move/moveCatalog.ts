import moveCatalogData from './data/moves.json';
import type { MoveDefinitionCatalog } from './moveDefinitionTypes';
import { assertValidMoveStickCueTracks } from './stickCueTracks';

assertValidMoveStickCueTracks(moveCatalogData.moves);

export const moveCatalog = moveCatalogData as unknown as MoveDefinitionCatalog;
