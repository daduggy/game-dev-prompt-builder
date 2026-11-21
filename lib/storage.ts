import { exampleWorkspace } from "./example";
import type { Project, SavedPrompt, Workspace } from "./types";

const databaseName = "game-dev-prompt-builder";
let connection: Promise<IDBDatabase> | undefined;

function openDatabase(): Promise<IDBDatabase> {
  if (connection) return connection;
  connection = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore("projects", { keyPath: "id" });
      const prompts = db.createObjectStore("prompts", { keyPath: "id" });
      prompts.createIndex("projectId", "projectId");
      db.createObjectStore("settings");
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => {
        connection = undefined;
        db.close();
      };
      db.onclose = () => { connection = undefined; };
      resolve(db);
    };
  }).catch((error: unknown) => {
    connection = undefined;
    throw error;
  });
  return connection;
}

function read<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function transact<T>(
  stores: string[],
  work: (transaction: IDBTransaction) => Promise<T> | T,
): Promise<T> {
  const db = await openDatabase();
  const transaction = db.transaction(stores, "readwrite");
  const committed = new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error("Browser storage canceled the transaction."));
  });
  try {
    const result = await work(transaction);
    await committed;
    return result;
  } catch (error) {
    try { transaction.abort(); } catch { /* A failed request may already have aborted the transaction. */ }
    await committed.catch(() => undefined);
    throw error;
  }
}

export function loadWorkspace(): Promise<Workspace> {
  return transact(["projects", "prompts", "settings"], async (tx) => {
    const projectStore = tx.objectStore("projects");
    const promptStore = tx.objectStore("prompts");
    const settings = tx.objectStore("settings");
    const [initialized, selection, projects, prompts] = await Promise.all([
      read(settings.get("initialized")),
      read(settings.get("activeProjectId")),
      read<Project[]>(projectStore.getAll()),
      read<SavedPrompt[]>(promptStore.getAll()),
    ]);

    if (!initialized) {
      settings.put(true, "initialized");
      if (projects.length === 0) {
        const example = exampleWorkspace();
        for (const project of example.projects) projectStore.add(project);
        for (const prompt of example.prompts) promptStore.add(prompt);
        settings.put(example.activeProjectId, "activeProjectId");
        return example;
      }
    }

    projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    prompts.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const activeProjectId = projects.find((project) => project.id === selection)?.id ?? projects[0]?.id ?? null;
    if (activeProjectId !== selection) settings.put(activeProjectId, "activeProjectId");
    return { projects, prompts, activeProjectId };
  });
}

export function saveProject(project: Project): Promise<Project> {
  const saved = { ...project, updatedAt: new Date().toISOString() };
  return transact(["projects"], (tx) => {
    tx.objectStore("projects").put(saved);
    return saved;
  });
}

export function savePrompt(prompt: SavedPrompt): Promise<SavedPrompt> {
  return transact(["projects", "prompts"], async (tx) => {
    const projectExists = await read(tx.objectStore("projects").count(prompt.projectId));
    if (!projectExists) throw new Error("This project was removed. Reopen the workspace to select a project.");
    const saved = { ...prompt, updatedAt: new Date().toISOString() };
    tx.objectStore("prompts").put(saved);
    return saved;
  });
}

export function deletePrompt(id: string): Promise<void> {
  return transact(["prompts"], (tx) => { tx.objectStore("prompts").delete(id); });
}

export function deleteProject(id: string): Promise<void> {
  return transact(["projects", "prompts", "settings"], async (tx) => {
    const projects = tx.objectStore("projects");
    const prompts = tx.objectStore("prompts");
    const settings = tx.objectStore("settings");
    projects.delete(id);
    const [promptIds, activeId] = await Promise.all([
      read(prompts.index("projectId").getAllKeys(id)),
      read(settings.get("activeProjectId")),
    ]);
    for (const promptId of promptIds) prompts.delete(promptId);
    if (activeId === id) {
      const remaining = await read<Project[]>(projects.getAll());
      remaining.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      settings.put(remaining[0]?.id ?? null, "activeProjectId");
    }
  });
}

export function setActiveProject(id: string | null): Promise<void> {
  return transact(["settings", "projects"], async (tx) => {
    if (id && !(await read(tx.objectStore("projects").count(id)))) {
      throw new Error("This project was removed. Reopen the workspace to select a project.");
    }
    tx.objectStore("settings").put(id, "activeProjectId");
  });
}
