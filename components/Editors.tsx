"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Box, Check, ChevronDown, Clipboard, Folder, Layers, Settings2, Sparkles, X,
} from "lucide-react";
import {
  assets, generatePrompt, newProject, newPrompt,
  type AssetId, type Project, type SavedPrompt,
} from "../lib/builder";
import "./editors.css";

type SaveHandler<T> = (value: T) => void | Promise<void>;

type ProjectEditorProps = {
  project?: Project | null;
  onSave: SaveHandler<Project>;
  onClose: () => void;
};

type AssetEditorProps = {
  project: Project;
  typeId?: AssetId;
  asset?: SavedPrompt | null;
  onSave: SaveHandler<SavedPrompt>;
  onClose: () => void;
};

function EditorDialog({ title, subtitle, icon, onClose, children }: {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    const previouslyFocused = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="builder-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}
    >
      <header className="editor-header">
        <span className="editor-heading-icon" aria-hidden="true">{icon}</span>
        <div className="editor-heading">
          <h2 id={titleId}>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <button type="button" className="editor-close" aria-label="Close editor" onClick={onClose}><X size={19} /></button>
      </header>
      {children}
    </dialog>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return <label className={wide ? "editor-field editor-wide" : "editor-field"}><span>{label}</span>{children}</label>;
}

function ErrorMessage({ message }: { message: string }) {
  return message ? <p className="editor-error" role="alert">{message}</p> : null;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Saving failed. Please try again.";
}

export function ProjectEditor({ project, onSave, onClose }: ProjectEditorProps) {
  const [draft, setDraft] = useState<Project>(() => project ? { ...project } : newProject({}));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const change = (field: keyof Project, value: string) => setDraft((current) => ({ ...current, [field]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    if (!draft.name.trim()) { setError("Enter a project name."); return; }
    setSaving(true);
    setError("");
    try {
      await onSave({ ...draft, name: draft.name.trim(), updatedAt: new Date().toISOString() });
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  }

  return (
    <EditorDialog title={project ? "Edit project" : "New project"} subtitle="These details guide every asset prompt in this project." icon={<Folder size={21} />} onClose={onClose}>
      <form className="editor-form" onSubmit={submit}>
        <div className="editor-body editor-grid">
          <Field label="Project name" wide>
            <input required autoFocus value={draft.name} onChange={(e) => change("name", e.target.value)} placeholder="Give your game a name" />
          </Field>
          <Field label="Game type">
            <input value={draft.genre} onChange={(e) => change("genre", e.target.value)} placeholder="e.g. Action RPG" />
          </Field>
          <Field label="Theme">
            <input value={draft.theme} onChange={(e) => change("theme", e.target.value)} placeholder="e.g. A wilderness reclaiming a lost city" />
          </Field>
          <Field label="Game description" wide>
            <textarea rows={3} value={draft.description} onChange={(e) => change("description", e.target.value)} placeholder="Describe the world, the player’s role, and the core gameplay loop." />
          </Field>
          <Field label="Art direction" wide>
            <input value={draft.artStyle} onChange={(e) => change("artStyle", e.target.value)} placeholder="e.g. Hand-painted low poly with warm, earthy colors" />
          </Field>
          <Field label="Game engine">
            <input value={draft.engine} onChange={(e) => change("engine", e.target.value)} placeholder="e.g. Godot 4" />
          </Field>
          <Field label="Target platform">
            <input value={draft.platform} onChange={(e) => change("platform", e.target.value)} placeholder="e.g. PC and Steam Deck" />
          </Field>
          <ErrorMessage message={error} />
        </div>
        <footer className="editor-footer">
          <button type="button" className="editor-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="editor-primary" disabled={saving}>{saving ? "Saving…" : project ? "Save project" : "Create project"}</button>
        </footer>
      </form>
    </EditorDialog>
  );
}

export function AssetEditor({ project, typeId, asset, onSave, onClose }: AssetEditorProps) {
  const [draft, setDraft] = useState<SavedPrompt>(() => asset
    ? { ...asset, details: { ...asset.details } }
    : newPrompt(project.id, typeId || assets[0].id));
  const [review, setReview] = useState(Boolean(asset));
  const [lastGenerated, setLastGenerated] = useState<SavedPrompt | null>(asset ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const output = useRef<HTMLTextAreaElement>(null);
  const template = assets.find((item) => item.id === draft.assetId)!;
  const targetId = useId();

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  function setField<K extends keyof SavedPrompt>(field: K, value: SavedPrompt[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
    setError("");
    setCopied(false);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    if (!draft.name.trim()) { setError("Enter an asset name."); return; }
    if (!review) {
      const next = { ...draft, name: draft.name.trim(), text: generatePrompt(project, draft.assetId, draft) };
      setDraft(next);
      setLastGenerated(next);
      setReview(true);
      setCopied(false);
      setError("");
      return;
    }
    if (!draft.text.trim()) { setError("Enter a prompt before saving."); return; }
    setSaving(true);
    setError("");
    try {
      await onSave({ ...draft, updatedAt: new Date().toISOString() });
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  }

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(draft.text);
      } else {
        output.current?.focus();
        output.current?.select();
        if (!document.execCommand("copy")) throw new Error("copy");
      }
      setError("");
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      output.current?.focus();
      output.current?.select();
      setError("Use your device’s Copy command to copy the selected prompt.");
    }
  }

  const title = review ? draft.name : asset ? "Edit asset brief" : "New asset prompt";
  const description = review ? template.title + " · " + draft.target : project.name;
  return (
    <EditorDialog title={title} subtitle={description} icon={review ? <Layers size={21} /> : <Box size={21} />} onClose={onClose}>
      <form className="editor-form" onSubmit={submit}>
        <div className="editor-body" key={review ? "review" : "brief"}>
          {review ? (
            <div className="editor-review">
              <div className="editor-review-toolbar">
                <label htmlFor={targetId + "-output"}>Prompt text</label>
                <button type="button" className="editor-small-action" aria-label={copied ? "Copied" : "Copy"} onClick={copy} disabled={!draft.text.trim()}>
                  {copied ? <Check size={15} /> : <Clipboard size={15} />}<span role="status">{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <textarea
                ref={output} id={targetId + "-output"} aria-describedby={targetId + "-hint"}
                className="editor-output" required rows={15} value={draft.text}
                onChange={(e) => setField("text", e.target.value)}
              />
              <p id={targetId + "-hint"} className="editor-note">Edit this text before saving or paste it into {draft.target}.</p>
            </div>
          ) : (
            <div className="editor-grid">
              <Field label="Asset type" wide>
                <span className="editor-select">
                  <select value={draft.assetId} onChange={(e) => setField("assetId", e.target.value as AssetId)}>
                    {(["2D", "3D", "Scripts"] as const).map((category) => (
                      <optgroup key={category} label={category}>
                        {assets.filter((item) => item.category === category).map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  <ChevronDown size={16} aria-hidden="true" />
                </span>
              </Field>
              <Field label="Asset name" wide>
                <input autoFocus required value={draft.name} onChange={(e) => setField("name", e.target.value)} placeholder="Name this asset" />
              </Field>
              <Field label="Creative brief" wide>
                <textarea rows={3} value={draft.brief} onChange={(e) => setField("brief", e.target.value)} placeholder="Describe the asset, its role in your game, and any constraints." />
              </Field>
              <fieldset className="editor-target editor-wide">
                <legend>Prompt destination</legend>
                <div>
                  {(["ChatGPT", "Codex"] as const).map((target) => (
                    <label key={target}>
                      <input type="radio" name={targetId} value={target} checked={draft.target === target} onChange={() => setField("target", target)} />
                      <span>{target}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="editor-specs editor-wide">
                <legend>Asset specifications</legend>
                <div className="editor-grid">
                  {template.fields.map((field) => (
                    <Field key={field.key} label={field.label}>
                      <input value={draft.details[field.key] ?? ""} placeholder={field.placeholder}
                        onChange={(e) => setField("details", { ...draft.details, [field.key]: e.target.value })} />
                    </Field>
                  ))}
                </div>
              </fieldset>
              {lastGenerated && <p className="editor-note editor-wide">Regenerating will replace the current prompt text using this brief.</p>}
            </div>
          )}
          <ErrorMessage message={error} />
        </div>
        <footer className="editor-footer">
          {review ? (
            <button type="button" className="editor-secondary" onClick={() => {
              setLastGenerated(draft); setReview(false); setError("");
            }}><Settings2 size={16} />Edit brief</button>
          ) : lastGenerated ? (
            <button type="button" className="editor-secondary" onClick={() => {
              setDraft(lastGenerated); setReview(true); setError("");
            }}>Back to prompt</button>
          ) : <button type="button" className="editor-secondary" onClick={onClose}>Cancel</button>}
          <button className="editor-primary" type="submit" disabled={saving}>
            {!review && <Sparkles size={16} />}
            {saving ? "Saving…" : review ? "Save prompt" : lastGenerated ? "Regenerate prompt" : "Generate prompt"}
          </button>
        </footer>
      </form>
    </EditorDialog>
  );
}
