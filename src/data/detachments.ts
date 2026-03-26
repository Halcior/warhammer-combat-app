import detachmentsRaw from "./normalized/detachments.json";
import type { NormalizedDetachment } from "../types/wahapedia";

export const detachments = detachmentsRaw as NormalizedDetachment[];