import { generatePrompt } from "./templates";
import { newProject, newPrompt } from "./types";
import type { AssetId, PromptInput, Workspace } from "./types";

export function exampleWorkspace(): Workspace {
  const project = newProject({
    id: "emberfall",
    name: "Emberfall",
    genre: "Action RPG",
    theme: "Dark fantasy",
    artStyle: "Pixel art",
    engine: "Godot 4",
    platform: "PC",
    description: "Explore the ruins of a fallen kingdom, battle ash-born creatures, and rekindle the ancient flame.",
  });

  const examples: Array<PromptInput & { assetId: AssetId }> = [
    {
      assetId: "sprite-sheet",
      name: "Ember Knight",
      brief: "Create a small cloaked guardian for the game's pixel-art bestiary and animated inventory portraits. A single ember glows through the visor.",
      target: "ChatGPT",
      details: {
        frames: "Idle, 6 frames at 8 fps, seamless loop",
        layout: "64 × 64 px cells in one horizontal row",
        view: "Three-quarter front view, facing right",
        palette: "Slate armor, rust-red cloak, warm amber visor, transparent background",
      },
    },
    {
      assetId: "particle-2d",
      name: "Cinder Sparks",
      brief: "A soft drift of cinders around the active inventory relic, with a subtle bright pulse at the end of each cycle.",
      target: "ChatGPT",
      details: { trigger: "Loop while the selected relic is active", motion: "Slow upward drift", budget: "12 live motes" },
    },
    {
      assetId: "environment",
      name: "Ruined Watchtower",
      brief: "A broken watchtower that frames the path into the abandoned citadel. Keep the ground-level arch open for the player.",
      target: "Codex",
      details: { dimensions: "6 m footprint, 9 m high, 1 m grid", surfaces: "Soot-stained basalt, worn brass, dark moss" },
    },
    {
      assetId: "creature",
      name: "Ashen Warden",
      brief: "A heavy quadrupedal sentinel formed from charcoal bark with glowing fissures across its shoulders.",
      target: "Codex",
      details: { movement: "Slow patrol and a single grounded lunge", rig: "Four planted paws, articulated spine and neck", budget: "12k triangles, GLB for Godot" },
    },
    {
      assetId: "feature-script",
      name: "Dash Ability",
      brief: "Give the guardian a quick evasive dash that spends stamina and respects collision along the travel path.",
      target: "Codex",
      details: { rules: "0.2 s dash, 0.9 s cooldown, 15 stamina", integration: "Godot CharacterBody3D and the stamina component" },
    },
    {
      assetId: "event-script",
      name: "Shrine Awakening",
      brief: "Light the ruined shrine on the player's first visit with an ember shard. Restore the sanctuary checkpoint as the flame returns.",
      target: "Codex",
      details: { trigger: "Interact inside the shrine area with an ember shard", repeat: "Once per shrine per save file" },
    },
  ];

  const now = Date.parse(project.createdAt);
  const prompts = examples.map(({ assetId, ...input }, index) => {
    const date = new Date(now - index * 60_000).toISOString();
    return {
      ...newPrompt(project.id, assetId),
      ...input,
      text: generatePrompt(project, assetId, input),
      createdAt: date,
      updatedAt: date,
    };
  });
  return { projects: [project], prompts, activeProjectId: project.id };
}
