import { trashRepository, type TrashItemType } from "../repositories/trash.repository.js";
import { ApiError } from "../utils/helpers.js";
import type { TrashData } from "../../shared/types.js";

const VALID_TYPES: TrashItemType[] = ["group", "task", "subtask"];

function validateType(type: string): TrashItemType {
  if (!VALID_TYPES.includes(type as TrashItemType)) {
    throw new ApiError("Invalid entity type", 400);
  }
  return type as TrashItemType;
}

export class TrashService {
  static async list(userId: string): Promise<TrashData> {
    return trashRepository.list(userId);
  }

  static async restore(
    userId: string,
    typeParam: string,
    id: string,
  ): Promise<void> {
    const type = validateType(typeParam);
    const ok = await trashRepository.restore(userId, type, id);
    if (!ok) {
      throw new ApiError("Item not found in trash", 404);
    }
  }

  static async empty(userId: string): Promise<number> {
    return trashRepository.empty(userId);
  }

  static async deleteItem(
    userId: string,
    typeParam: string,
    id: string,
  ): Promise<void> {
    const type = validateType(typeParam);
    const ok = await trashRepository.deleteItem(userId, type, id);
    if (!ok) {
      throw new ApiError("Item not found", 404);
    }
  }

  static async autoEmpty(days = 30): Promise<number> {
    return trashRepository.autoEmptyOlderThanDays(days);
  }
}
