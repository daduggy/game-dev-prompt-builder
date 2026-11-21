export type AssetId =
  | "sprite-sheet"
  | "particle-2d"
  | "model-sheet"
  | "humanoid"
  | "creature"
  | "animation"
  | "environment"
  | "particle-3d"
  | "base-script"
  | "feature-script"
  | "event-script"
  | "sequence-script";

export type PromptTarget = "ChatGPT" | "Codex";

export interface Project {
  id: string;
  name: string;
  genre: string;
  theme: string;
  description: string;
  artStyle: string;
  engine: string;
  platform: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromptInput {
  name: string;
  brief: string;
  details: Record<string, string>;
  target: PromptTarget;
}

export interface SavedPrompt extends PromptInput {
  id: string;
  projectId: string;
  assetId: AssetId;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateField {
  key: string;
  label: string;
  placeholder: string;
}

export interface AssetTemplate {
  id: AssetId;
  title: string;
  description: string;
  category: "2D" | "3D" | "Scripts";
  fields: TemplateField[];
}

export interface Workspace {
  projects: Project[];
  prompts: SavedPrompt[];
  activeProjectId: string | null;
}

export function newProject(values: Partial<Project> = {}): Project {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: "",
    genre: "",
    theme: "",
    description: "",
    artStyle: "",
    engine: "",
    platform: "",
    createdAt: now,
    updatedAt: now,
    ...values,
  };
}

export function newPrompt(projectId: string, assetId: AssetId): SavedPrompt {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    projectId,
    assetId,
    name: "",
    brief: "",
    details: {},
    target: "ChatGPT",
    text: "",
    createdAt: now,
    updatedAt: now,
  };
}
