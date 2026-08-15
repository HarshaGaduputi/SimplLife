import { exportImportRepository } from "../repositories/exportImport.repository.js";
import { ApiError } from "../utils/helpers.js";
import type { ExportData } from "../../shared/types.js";

export class ExportImportService {
  static async export(userId: string): Promise<{ data: ExportData; filename: string }> {
    const data = await exportImportRepository.export(userId);
    if (!data) {
      throw new ApiError("User data not found", 404);
    }
    const todayStr = new Date().toISOString().split("T")[0];
    const filename = `tasknest-export-${todayStr}.json`;
    return { data, filename };
  }

  private static validateImportBody(body: unknown): ExportData {
    let bodyData: ExportData | null = null;

    if (typeof body === "object" && body !== null) {
      const obj = body as Record<string, unknown>;
      if (Array.isArray(obj.groups)) {
        bodyData = body as ExportData;
      } else if (typeof obj.file === "string") {
        try {
          bodyData = JSON.parse(obj.file);
        } catch {
          /* invalid JSON string */
        }
      }
    }

    if (!bodyData || !Array.isArray(bodyData.groups)) {
      throw new ApiError(
        "Invalid file format. Must contain a 'groups' array.",
        400,
      );
    }

    for (const g of bodyData.groups) {
      if (typeof g.name !== "string" || !g.name.trim()) {
        throw new ApiError(
          "Invalid file format: Each group must have a valid name string.",
          400,
        );
      }
      if (Array.isArray(g.tasks)) {
        for (const t of g.tasks) {
          if (typeof t.name !== "string" || !t.name.trim()) {
            throw new ApiError(
              "Invalid file format: Each task must have a valid name string.",
              400,
            );
          }
        }
      }
    }

    return bodyData;
  }

  static async import(
    userId: string,
    body: unknown,
  ): Promise<{
    groupsCount: number;
    tasksCount: number;
    subtasksCount: number;
  }> {
    const data = this.validateImportBody(body);
    const summary = await exportImportRepository.import(userId, data);
    return summary;
  }
}
