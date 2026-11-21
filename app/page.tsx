"use client";

import { useEffect, useState } from "react";
import {
  Bookmark, Box, Braces, Check, ChevronRight, CircleAlert, Database,
  FolderClosed, Gamepad2, Grid2X2, Image as ImageIcon, Layers3,
  LayoutDashboard, List, Menu, Palette, PanelLeft, Pencil, Plus, ScrollText,
  Search, Sparkles, Swords, X,
} from "lucide-react";
import { ProjectEditor, AssetEditor } from "../components/Editors";
import {
  assets, loadWorkspace, saveProject, savePrompt, setActiveProject,
  type AssetId, type AssetTemplate, type Project, type SavedPrompt, type Workspace,
} from "../lib/builder";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
const artwork = (id: string) => base + "/art/" + id + ".webp";
type View = "overview" | "library" | "saved";
type Filter = "All" | AssetTemplate["category"];
const categories: { value: Filter; label: string; icon: typeof Box }[] = [
  { value: "All", label: "All types", icon: Grid2X2 },
  { value: "2D", label: "2D assets", icon: ImageIcon },
  { value: "3D", label: "3D assets", icon: Box },
  { value: "Scripts", label: "Scripts", icon: Braces },
];
const navigation = [
  { value: "overview", label: "Project overview", icon: LayoutDashboard },
  { value: "library", label: "Asset library", icon: Layers3 },
  { value: "saved", label: "Saved prompts", icon: Bookmark },
] as const;
type Editor = { kind: "project"; project?: Project } | { kind: "asset"; projectId: string; id?: AssetId; prompt?: SavedPrompt };

function AssetBadge({ category }: { category: AssetTemplate["category"] }) {
  const Icon = category === "2D" ? ImageIcon : category === "3D" ? Box : Braces;
  return <span className={"asset-badge badge-" + category.toLowerCase()}><Icon size={12} />{category === "Scripts" ? "Script" : category + " asset"}</span>;
}

function Library({ compact, open }: { compact: boolean; open: (id: AssetId) => void }) {
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [list, setList] = useState(false);
  const filtered = assets.filter((item) => (filter === "All" || item.category === filter)
    && (item.title + " " + item.description + " " + item.category).toLowerCase().includes(search.trim().toLowerCase()));
  const Heading = compact ? "h2" : "h1";
  return <section aria-labelledby="library-title" className={"library" + (compact ? " overview-library" : "")}>
    <div className="section-heading">
      <div><div className="heading-row"><Layers3 className="section-icon" size={23} /><Heading id="library-title">Asset library</Heading></div>
        <p>Choose an asset type to build a prompt for your project.</p></div>
      <div className="view-switch" aria-label="Library view">
        <button title="Grid view" aria-label="Grid view" aria-pressed={!list} onClick={() => setList(false)}><Grid2X2 size={16} /></button>
        <button title="List view" aria-label="List view" aria-pressed={list} onClick={() => setList(true)}><List size={17} /></button>
      </div>
    </div>
    <div className="library-toolbar">
      <div className="filters" aria-label="Filter asset types">
        {categories.map(({ value, label, icon: Icon }) => <button aria-pressed={filter === value} className="filter-btn" key={value} onClick={() => setFilter(value)}>
          <Icon size={15}/><span>{label}</span>{value === "All" && <span className="filter-count">{assets.length}</span>}
        </button>)}
      </div>
      <label className="search-field"><Search size={16}/><input aria-label="Search asset types" type="search" placeholder="Search assets…" value={search} onChange={(event) => setSearch(event.target.value)}/></label>
    </div>
    {filtered.length ? <div className={list ? "template-grid list-view" : "template-grid"}>
      {filtered.map(item => <button className="asset-card" key={item.id} onClick={() => open(item.id)} aria-label={"Create " + item.title + " prompt"}>
        <div className="card-art"><img src={artwork(item.id)} alt="" loading={assets.indexOf(item) < 3 ? "eager" : "lazy"}/><AssetBadge category={item.category}/></div>
        <div className="card-info"><div className="card-title-row"><h3>{item.title}</h3><span className="card-add" aria-hidden="true"><Plus size={15}/></span></div><p>{item.description}</p></div>
      </button>)}
    </div> : <div className="empty-panel"><Search/><h3>No matching asset types</h3><button className="quiet-button" onClick={() => { setSearch(""); setFilter("All"); }}>Clear filters</button></div>}
  </section>;
}

function Hero({ project, edit }: { project: Project; edit: () => void }) {
  const tags = [
    { icon: Swords, value: project.genre },
    { icon: Sparkles, value: project.theme },
    { icon: Palette, value: project.artStyle },
  ];
  return <section className={"project-hero " + (project.id === "emberfall" ? "emberfall" : "custom-project")} aria-labelledby="project-name">
    {project.id === "emberfall" && <img className="hero-art" src={artwork("emberfall")} alt="" fetchPriority="high" />}
    <div className="hero-shading"/>
    <div className="hero-titlebar"><span className="eyebrow hero-label"><span className="active-spark"/>Active project</span>
      <button className="edit-project" onClick={edit}><Pencil size={13}/>Edit project</button></div>
    <div className="hero-content"><h1 id="project-name">{project.name}</h1>
      {project.description && <p>{project.description}</p>}
      <div className="hero-tags">
        {tags.map(({ icon: Icon, value }, i) => value && <span key={i} className="hero-tag"><Icon size={13}/>{value}</span>)}
      </div>
    </div>
  </section>;
}

function SavedPrompts({ prompts, project, edit, create }: {
  prompts: SavedPrompt[]; project: Project; edit: (prompt: SavedPrompt) => void; create: () => void;
}) {
  const [query, setQuery] = useState("");
  const matching = prompts.filter(prompt => (prompt.name + " " + prompt.target + " " + assets.find(asset => asset.id === prompt.assetId)?.title).toLowerCase().includes(query.trim().toLowerCase()));
  return <section>
    <div className="section-heading"><div><div className="heading-row"><Bookmark className="section-icon" size={23}/><h1>Saved prompts</h1></div><p>Open, edit, or copy a prompt from {project.name}.</p></div>
      <button className="quiet-button" onClick={create}><Plus size={16}/>New prompt</button></div>
    {prompts.length > 0 && <label className="search-field saved-search"><Search size={16}/><input type="search" aria-label="Search saved prompts" placeholder="Search saved prompts…" value={query} onChange={event => setQuery(event.target.value)}/></label>}
    {matching.length ? <div className="saved-list">{matching.map(prompt => {
      const asset = assets.find(item => item.id === prompt.assetId)!;
      return <button className="saved-row" key={prompt.id} onClick={() => edit(prompt)}>
        <img src={artwork(asset.id)} alt=""/><span className="saved-title"><strong>{prompt.name}</strong><span>{asset.title}</span></span>
        <span className="saved-target"><ScrollText size={14}/>{prompt.target}</span><Pencil size={16} className="saved-edit"/>
      </button>;
    })}</div> : <div className="empty-panel"><Bookmark/><h3>{query ? "No matching prompts" : "Your saved prompts will appear here"}</h3>
      <button className="quiet-button" onClick={query ? () => setQuery("") : create}>{query ? "Clear search" : "Create your first prompt"}</button></div>}
  </section>;
}

export default function WorkspacePage() {
  const [data, setData] = useState<Workspace | null>(null);
  const [error, setError] = useState("");
  const [view, setView] = useState<View>("overview");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [menu, setMenu] = useState(false);
  const [notice, setNotice] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let current = true;
    const refresh = () => {
      loadWorkspace().then(result => { if (current) { setData(result); setError(""); } })
        .catch(() => { if (current) setError("Browser storage could not be opened. Enable IndexedDB for this site and try again."); });
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => { current = false; window.removeEventListener("focus", refresh); };
  }, [attempt]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (!menu) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setMenu(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menu]);

  const project = data?.projects.find(item => item.id === data.activeProjectId);
  const editingProject = editor?.kind === "asset" ? data?.projects.find(item => item.id === editor.projectId) : null;
  const prompts = data?.prompts.filter(item => item.projectId === project?.id) ?? [];
  function navigate(next: View) {
    setView(next); setMenu(false); window.scrollTo(0, 0);
  }
  const createProject = () => { setMenu(false); setEditor({ kind: "project" }); };
  async function selectProject(id: string) {
    try {
      await setActiveProject(id);
      setData(await loadWorkspace()); navigate("overview");
    } catch { setError("This project could not be opened. Reload your workspace and try again."); }
  }
  async function storeProject(item: Project) {
    const isNew = !data?.projects.some(existing => item.id === existing.id);
    await saveProject(item); await setActiveProject(item.id);
    setData(await loadWorkspace()); navigate("overview");
    setNotice(isNew ? "Project created" : "Project updated");
  }
  async function storePrompt(item: SavedPrompt) {
    await savePrompt(item);
    setData(await loadWorkspace()); setNotice("Prompt saved");
  }
  return <div className="app-shell">
    <a className="skip-link" href="#workspace">Skip to workspace</a>
    {menu && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMenu(false)}/>}
    <aside className={"sidebar" + (menu ? " opened" : "")} aria-label="Project sidebar">
      <div className="brand"><img src={base + "/gamepad.svg"} alt="" width={40} height={40}/><div>Game Dev<span>Prompt Builder</span></div><button className="mobile-close icon-button" aria-label="Close menu" onClick={() => setMenu(false)}><X size={18}/></button></div>
      <div className="side-content">
        <div className="side-label">Workspace</div>
        <nav aria-label="Workspace">{navigation.map(({ value, label, icon: Icon }) => <button className={"nav-item" + (view === value ? " selected" : "")} key={value} aria-current={view === value ? "page" : undefined} disabled={!project} onClick={() => navigate(value)}>
          <Icon size={18}/><span>{label}</span>{value === "saved" && <span className="nav-count">{prompts.length}</span>}
        </button>)}</nav>
        <div className="side-divider"/>
        <div className="side-label projects-label">My projects<button className="side-plus" aria-label="Add project" title="Add project" disabled={!data} onClick={createProject}><Plus size={16}/></button></div>
        <div className="project-list">{data?.projects.map(item => <button className={"project-item" + (item.id === project?.id ? " active" : "")} aria-pressed={item.id === project?.id} key={item.id} onClick={() => void selectProject(item.id)}>
          {item.id === "emberfall" ? <span className="project-avatar"><img src={artwork("emberfall")} alt=""/></span> : <span className="project-avatar generic-avatar"><Gamepad2 size={15}/></span>}
          <span>{item.name}</span>{item.id === project?.id && <span className="project-dot"/>}
        </button>)}</div>
      </div>
      <div className="storage-status"><div className="db-icon"><Database size={18}/></div><div><strong>Local workspace</strong><small><i/>Stored in this browser</small></div></div>
    </aside>
    <div className="main-panel">
      <header className="topbar"><div className="breadcrumb">
        <button className="mobile-menu icon-button" aria-label="Open navigation" aria-expanded={menu} onClick={() => setMenu(true)}><Menu size={21}/></button>
        <PanelLeft size={16} className="crumb-icon"/><span className="workspace-crumb">Workspace</span><ChevronRight size={13} className="crumb-chevron"/><strong>{navigation.find(item => item.value === view)?.label}</strong>
      </div><button className="new-button" onClick={createProject} disabled={!data}><Plus size={16}/>New project</button></header>
      <main id="workspace" className="main-content" tabIndex={-1}>
        {error ? <div className="empty-panel" role="alert"><CircleAlert/><h2>Workspace unavailable</h2><p>{error}</p><button className="quiet-button" onClick={() => setAttempt(value => value + 1)}>Reload workspace</button></div>
        : !data ? <p className="loading" role="status">Opening workspace…</p>
        : !project ? <div className="empty-panel"><FolderClosed/><h1>Create a game project</h1><p>Add your game’s theme and art direction to get started.</p><button className="new-button" onClick={createProject}><Plus size={16}/>New project</button></div>
        : <>{view === "overview" && <Hero project={project} edit={() => setEditor({ kind: "project", project })}/>}
          {view !== "saved" ? <Library compact={view === "overview"} open={id => setEditor({ kind: "asset", projectId: project.id, id })}/>
          : <SavedPrompts key={project.id} prompts={prompts} project={project} edit={prompt => setEditor({ kind: "asset", projectId: project.id, prompt })} create={() => setEditor({ kind: "asset", projectId: project.id })}/>}</>}
      </main>
    </div>
    {editor?.kind === "project" && <ProjectEditor project={editor.project} onSave={storeProject} onClose={() => setEditor(null)}/>}
    {editor?.kind === "asset" && editingProject && <AssetEditor project={editingProject} typeId={editor.id} asset={editor.prompt} onSave={storePrompt} onClose={() => setEditor(null)}/>}
    {notice && <div className="toast" role="status"><Check size={16}/>{notice}</div>}
  </div>;
}
