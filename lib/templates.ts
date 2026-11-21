import type { AssetId, AssetTemplate, Project, PromptInput, TemplateField } from "./types";

interface TemplateDefinition extends AssetTemplate {
  deliverables: string[];
}

function field(key: string, label: string, placeholder: string): TemplateField {
  return { key, label, placeholder };
}

const definitions: TemplateDefinition[] = [
  {
    id: "sprite-sheet",
    title: "2D Sprite Sheet",
    category: "2D",
    description: "Design frame-by-frame character and object animations.",
    fields: [
      field("frames", "Animations & frames", "Idle 4 frames, run 8 frames, 12 fps"),
      field("layout", "Sheet layout", "32 × 32 px cells, one animation per row"),
      field("view", "Views & orientation", "Side view, character facing right"),
      field("palette", "Palette & rendering", "16 colors, crisp pixels, transparent background"),
    ],
    deliverables: [
      "Produce a game-ready sprite atlas with consistent cell sizes, baseline, anchor point, silhouette, lighting, and scale throughout every animation.",
      "Keep artwork inside its cell and export the atlas as a transparent PNG. Keep text, guides, and annotations outside the exported artwork.",
      "Supply a frame map with row, first and last column, frame duration, and looping behavior for each clip. Check for clipping, accidental duplicates, and foot sliding.",
    ],
  },
  {
    id: "particle-2d",
    title: "2D Particle Effect",
    category: "2D",
    description: "Shape bursts, trails, and atmospheric effects in 2D.",
    fields: [
      field("trigger", "Trigger & timing", "A brief puff when the player lands"),
      field("appearance", "Particle appearance", "Warm dust motes fading from ochre to gray"),
      field("motion", "Emitter & motion", "Low fan shape, light gravity, 0.4 s lifetime"),
      field("budget", "Limits & blending", "Up to 24 sprites per burst, alpha blended"),
    ],
    deliverables: [
      "Create the particle sprite or flipbook and a reusable 2D emitter configuration. Describe emission shape, particle count, lifetime, direction, speed, and acceleration with units.",
      "Define color, size, opacity, and optional rotation over normalized lifetime. Specify pivot, draw order, blend mode, and transparent-edge handling.",
      "Include a preview trigger and a short import and tuning guide for the project engine. Verify the final frame fades cleanly and the effect stays within its particle budget.",
    ],
  },
  {
    id: "model-sheet",
    title: "3D Model Sheet",
    category: "3D",
    description: "Create aligned reference views for a Blender model.",
    fields: [
      field("subject", "Subject type", "Character, creature, or environment piece"),
      field("views", "Views & pose", "Front, side, and back in a neutral pose"),
      field("scale", "Scale & proportions", "1.8 m tall, long coat, compact shoulders"),
      field("materials", "Materials & callouts", "Weathered leather, brass buckles, stitch detail"),
    ],
    deliverables: [
      "Create a modeling reference sheet with aligned orthographic views at the same scale. Match landmarks, contours, and material boundaries across views.",
      "Include dimensions, a scale reference, and detail callouts for occluded or ambiguous construction. Choose a neutral pose for animate subjects or measured elevations for architecture.",
      "Provide clean, separately croppable view panels for Blender reference planes, plus palette and material swatches. Check bilateral features and mark intentional asymmetries.",
    ],
  },
  {
    id: "humanoid",
    title: "3D Humanoid Character",
    category: "3D",
    description: "Build a rigged and skinned humanoid in Blender.",
    fields: [
      field("anatomy", "Silhouette & costume", "Lean traveler with a short cloak and boots"),
      field("geometry", "Mesh & textures", "12k triangles, single 2K PBR atlas"),
      field("rig", "Rig requirements", "Biped rig, IK legs, FK arms, finger bones"),
      field("export", "Export requirements", "Blender source and GLB, meters, neutral A-pose"),
    ],
    deliverables: [
      "Deliver an editable Blender character mesh with deformation-friendly topology around shoulders, elbows, pelvis, and knees, plus clean UVs and assigned materials.",
      "Create a named humanoid armature with a clear root, bone hierarchy, consistent rest pose, and documented controls. Bind and normalize skin weights, including clothing.",
      "Test a crouch, elbow bend, and arms-raised pose for joint collapse, clipping, and unweighted vertices. Supply the Blender source and engine-ready export with import settings and scale.",
    ],
  },
  {
    id: "creature",
    title: "3D Creature",
    category: "3D",
    description: "Build a creature with a custom rig and skin weights.",
    fields: [
      field("anatomy", "Anatomy & proportions", "Stocky quadruped with a flexible tail"),
      field("movement", "Locomotion & articulation", "Low stalking gait and a fast pounce"),
      field("rig", "Rig controls", "IK paws, spline spine, segmented tail"),
      field("budget", "Mesh & export", "8k triangles, 1K texture atlas, GLB"),
    ],
    deliverables: [
      "Construct an editable Blender creature with readable anatomy, clean UVs, and topology that supports its locomotion and range of motion.",
      "Build a species-appropriate armature. Name and parent the root, spine, limbs, and appendages, add the requested controls, and bind the mesh with normalized skin weights.",
      "Test a weight-bearing stance, an extended stride, and an extreme appendage bend. Fix detached vertices, joint collapse, or floor penetration. Supply Blender source, engine export, and import settings.",
    ],
  },
  {
    id: "animation",
    title: "3D Animation",
    category: "3D",
    description: "Animate a humanoid or creature rig for gameplay.",
    fields: [
      field("subject", "Subject & source rig", "Humanoid or creature, armature name, bone map"),
      field("action", "Action & key poses", "Anticipation, leap, airborne hold, landing"),
      field("timing", "Timing & loop", "24 fps, 30 frames, one-shot clip"),
      field("motion", "Root motion & export", "In place with foot contacts, export as GLB"),
    ],
    deliverables: [
      "Author a named Blender Action on the specified humanoid or creature rig. Match its rest pose, bone axes, scale, and the requested root-motion convention.",
      "Specify frame rate, clip range, key poses, contact frames, easing, and event markers. Preserve planted contacts and smooth center-of-mass movement.",
      "Deliver the editable Action and a baked engine-ready clip. Check loop seams for looping actions, clean transitions for one-shots, and verify exported timing against the source.",
    ],
  },
  {
    id: "environment",
    title: "3D Environment Piece",
    category: "3D",
    description: "Model modular scenery, architecture, and props.",
    fields: [
      field("piece", "Piece & gameplay role", "A ruined archway marking a level entrance"),
      field("dimensions", "Scale & snapping", "4 m wide, 1 m grid, pivot at floor center"),
      field("surfaces", "Materials & surfaces", "Mossy stone, chipped edges, tileable textures"),
      field("budget", "Performance & collision", "5k triangles, simple walk-through collider"),
    ],
    deliverables: [
      "Build an editable Blender environment mesh matching the specified dimensions, grid, and silhouette. Place the origin and snap points so level designers can position the piece consistently.",
      "Provide clean normals, UVs, materials, and appropriate collision geometry. Name meshes, materials, and colliders clearly and document any LODs.",
      "Deliver Blender source and an engine-ready export. Verify scale, collision, and modular seams by placing the piece in a small example arrangement.",
    ],
  },
  {
    id: "particle-3d",
    title: "3D Particle Effect",
    category: "3D",
    description: "Create spatial effects with reusable 3D emitters.",
    fields: [
      field("effect", "Effect & trigger", "A looping swirl over a checkpoint"),
      field("volume", "Volume & motion", "1 m radius spiral rising 2 m in world space"),
      field("look", "Materials & lighting", "Soft emissive sparks and a dim smoke layer"),
      field("budget", "Lifetime & limits", "2 s lifetime, 200 live particles, distance fade"),
    ],
    deliverables: [
      "Build a reusable 3D particle effect for the project engine. Define emitter space, shape, sub-emitters, rates, forces, velocity, and lifetime with units.",
      "Specify billboard or mesh rendering, materials, color and scale curves, soft intersections, bounds, and camera-distance behavior.",
      "Provide the effect resources and a preview scene or trigger. Test pause, restart, culling, and density at peak emission while respecting the particle and overdraw budget.",
    ],
  },
  {
    id: "base-script",
    title: "Base Gameplay Script",
    category: "Scripts",
    description: "Implement the systems that run your core game loop.",
    fields: [
      field("system", "System responsibilities", "Player movement, input, and locomotion state"),
      field("language", "Language & runtime", "GDScript for Godot 4"),
      field("interfaces", "Scene dependencies & inputs", "CharacterBody3D, input map, camera basis"),
      field("validation", "Expected behavior", "Consistent speed, stable slopes, responsive stop"),
    ],
    deliverables: [
      "Implement the core gameplay system in the project's engine and scripting language. Identify the owning node or component, lifecycle hooks, input contracts, and configurable parameters.",
      "Separate input capture, simulation, and presentation where appropriate. Handle initialization, restart, missing dependencies, and frame-rate-independent timing.",
      "Deliver complete source files, attachment and configuration steps, and a minimal playable example. Give observable checks for startup, normal operation, and restart.",
    ],
  },
  {
    id: "feature-script",
    title: "Gameplay Feature Script",
    category: "Scripts",
    description: "Add a focused player ability or game mechanic.",
    fields: [
      field("mechanic", "Mechanic & player controls", "A short directional dash on button press"),
      field("rules", "Rules & tuning", "0.18 s duration, 1 s cooldown"),
      field("integration", "Existing systems", "Movement controller, stamina, animation events"),
      field("cases", "Edge cases", "Blocked paths, pause, repeated input, low stamina"),
    ],
    deliverables: [
      "Implement the requested mechanic as a discrete component or module. Specify its activation preconditions, state transitions, cancellation rules, and exposed tuning values.",
      "Integrate through explicit calls, signals, or events with the named gameplay systems. Keep ownership clear and clean up temporary state on interruption or restart.",
      "Provide complete source, integration steps, and a small example. Include acceptance checks for first activation, repeated activation, boundary conditions, and cancellation.",
    ],
  },
  {
    id: "event-script",
    title: "Game Event Script",
    category: "Scripts",
    description: "Connect gameplay triggers, conditions, and responses.",
    fields: [
      field("trigger", "Trigger & conditions", "Player enters the shrine carrying a relic"),
      field("response", "Event response", "Open gate, play glow effect, update quest"),
      field("repeat", "Repeat & persistence", "Once per save, retain across scene reloads"),
      field("connections", "Scene connections", "Shrine trigger, inventory, gate, quest tracker"),
    ],
    deliverables: [
      "Implement the trigger, condition checks, and ordered event responses. Define the event payload, sender, listeners, and ownership of completion state.",
      "Respect repeat and persistence rules, handle overlapping entries and missing targets, and register and release listeners through the engine lifecycle.",
      "Supply complete source, scene wiring, and an example firing the event. Verify unmet conditions, a valid trigger, duplicate triggers, and a scene reload.",
    ],
  },
  {
    id: "sequence-script",
    title: "Game Sequence Script",
    category: "Scripts",
    description: "Orchestrate timed gameplay and cinematic sequences.",
    fields: [
      field("beats", "Sequence beats", "Lock input, pan to shrine, show dialogue, return"),
      field("timing", "Timing & transitions", "2 s pan, wait for dialogue confirmation"),
      field("interrupt", "Skip & interruption", "Skip to resolved state and restore player input"),
      field("bindings", "Scene bindings", "Main camera, dialogue UI, player controller"),
    ],
    deliverables: [
      "Implement the sequence as named, ordered beats with explicit timing, dependencies, and transition conditions. Separate sequence data from playback where practical.",
      "Define start, completion, skip, cancellation, and restart behavior. Restore player controls, cameras, time scale, and temporary scene state on each exit path.",
      "Deliver complete source, resource or scene bindings, and an example sequence. Verify uninterrupted playback, skip during a wait, and unloading the scene midway.",
    ],
  },
];

export const assets: AssetTemplate[] = definitions;

export function generatePrompt(project: Project, assetId: AssetId, input: PromptInput): string {
  const template = definitions.find((definition) => definition.id === assetId);
  if (!template) throw new Error("Choose an available asset template.");

  const context = [
    ["Project", project.name],
    ["Game type", project.genre],
    ["Theme", project.theme],
    ["Game description", project.description],
    ["Art direction", project.artStyle],
    ["Engine", project.engine],
    ["Target platform", project.platform],
  ];
  const contextLines = context.filter(([, value]) => value.trim()).map(([label, value]) => label + ": " + value.trim());
  const specifications = template.fields.flatMap(({ key, label }) => {
    const value = input.details[key]?.trim();
    return value ? [label + ": " + value] : [];
  });
  const delivery = input.target === "Codex"
    ? "Inspect the available project files and follow their conventions. Implement the requested deliverables in the workspace. If an authoring tool is unavailable, supply a reproducible generation script and exact run instructions. List the output paths and the checks you performed."
    : "Produce the requested asset or implementation using the tools available in this chat. If you cannot attach a required file, provide complete source or a reproducible creation procedure with export settings. Identify any assumptions and explain how to import and verify the result.";

  return [
    "Create a " + template.title + (input.name.trim() ? ' named "' + input.name.trim() + '"' : "") + ".",
    contextLines.length ? ["Game project", ...contextLines].join("\n") : "",
    input.brief.trim() ? "Asset brief\n" + input.brief.trim() : "",
    specifications.length ? ["Asset specifications", ...specifications].join("\n") : "",
    ["Deliverables and acceptance checks", ...template.deliverables.map((line, index) => (index + 1) + ". " + line)].join("\n"),
    "Delivery for " + input.target + "\n" + delivery,
  ].filter(Boolean).join("\n\n");
}
