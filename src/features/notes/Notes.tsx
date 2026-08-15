import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Trash2, Edit2, Tag, Save, Eye, Sparkles, RefreshCw, X as XIcon, CheckSquare } from "lucide-react";
import { notesService, aiApiService, groupsService, tasksService } from "@/services/api";
import type { Note } from "../../../shared/types";
import { Button, Input, Card, Badge, Loader } from "@/components/ui";
import { useToastStore } from "@/stores/toastStore";
import ReactMarkdown from 'react-markdown';


export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  
  // Note Form Fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteTags, setNoteTags] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiSummary, setAiSummary] = useState<{ summary: string; topics: string[]; tags: string[] } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const toast = useToastStore((s) => s.toast);

  // Autosave
  useEffect(() => {
    if (!selectedNote || isPreview) return;
    
    // Check if anything actually changed
    const tagsArr = noteTags.split(",").map((t) => t.trim()).filter((t) => t !== "");
    const tagsChanged = JSON.stringify(tagsArr) !== JSON.stringify(selectedNote.tags);
    const hasChanges = title !== selectedNote.title || content !== selectedNote.content || tagsChanged;
    
    if (!hasChanges) return;

    const timer = setTimeout(async () => {
      setSaving(true);
      try {
        const res = await notesService.update(selectedNote.id, {
          title: title.trim() || 'Untitled Note',
          content,
          tags: tagsArr,
        });
        setNotes((prev) => prev.map((n) => (n.id === selectedNote.id ? res.note : n)));
        setSelectedNote(res.note);
      } catch (e) {
        // silent error for autosave
      } finally {
        setSaving(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [title, content, noteTags, selectedNote, isPreview]);

  const loadNotes = useCallback(async () => {
    try {
      const res = await notesService.list();
      setNotes(res.notes);
      if (res.notes.length > 0) {
        selectNote(res.notes[0]);
      }
    } catch {
      toast({ kind: "error", message: "Failed to load notes" });
    } finally {
      setLoading(false);
    }
  // selectNote is stable (no external deps)
   
  }, [toast]);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  function selectNote(note: Note) {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setNoteTags(note.tags.join(", "));
    setIsPreview(false);
    setIsTodoList(false);
  }

  function handleCreateNewNote() {
    setSelectedNote(null);
    setTitle("");
    setContent("");
    setNoteTags("");
    setIsPreview(false);
    setIsTodoList(false);
  }

  async function handleSaveNote(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    
    const tagsArr = noteTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");

    try {
      if (selectedNote) {
        // Update Note
        const res = await notesService.update(selectedNote.id, {
          title: title.trim(),
          content,
          tags: tagsArr,
        });
        setNotes((prev) => prev.map((n) => (n.id === selectedNote.id ? res.note : n)));
        setSelectedNote(res.note);
        toast({ kind: "success", message: "Note updated!" });
      } else {
        // Create Note
        const res = await notesService.create({
          title: title.trim(),
          content,
          tags: tagsArr,
        });
        setNotes((prev) => [res.note, ...prev]);
        setSelectedNote(res.note);
        toast({ kind: "success", message: "Note saved!" });
      }
    } catch {
      toast({ kind: "error", message: "Failed to save note" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteNote(id: string) {
    try {
      await notesService.delete(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (selectedNote?.id === id) {
        handleCreateNewNote();
      }
      toast({ kind: "success", message: "Note deleted" });
    } catch {
      toast({ kind: "error", message: "Failed to delete note" });
    }
  }

  const [isTodoList, setIsTodoList] = useState(false);

  function renderText(text: string) {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part));
  }

  function handleContentKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const textarea = e.currentTarget;
    const { selectionStart, selectionEnd, value } = textarea;

    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    const lineEnd = value.indexOf("\n", selectionStart);
    const currentLine = value.substring(lineStart, lineEnd === -1 ? value.length : lineEnd);

    if (e.key === "Enter") {
      const bulletMatch = currentLine.match(/^(\s*)([-*•])\s/);
      const numberedMatch = currentLine.match(/^(\s*)(\d+)\.\s/);

      if (bulletMatch) {
        e.preventDefault();
        const [, indent, bullet] = bulletMatch;
        const lineContent = currentLine.slice(bulletMatch[0].length);
        if (!lineContent.trim()) {
          const newValue = value.substring(0, lineStart) + value.substring(lineEnd === -1 ? value.length : lineEnd);
          setContent(newValue.trimEnd());
          return;
        }
        const insertion = `\n${indent}${bullet} `;
        const newValue = value.substring(0, selectionStart) + insertion + value.substring(selectionEnd);
        setContent(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + insertion.length;
        }, 0);
        return;
      }

      if (numberedMatch) {
        e.preventDefault();
        const [, indent, numStr] = numberedMatch;
        const lineContent = currentLine.slice(numberedMatch[0].length);
        if (!lineContent.trim()) {
          const newValue = value.substring(0, lineStart) + value.substring(lineEnd === -1 ? value.length : lineEnd);
          setContent(newValue.trimEnd());
          return;
        }
        const nextNum = parseInt(numStr, 10) + 1;
        const insertion = `\n${indent}${nextNum}. `;
        const newValue = value.substring(0, selectionStart) + insertion + value.substring(selectionEnd);
        setContent(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + insertion.length;
        }, 0);
        return;
      }
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const insertion = "  ";
      const newValue = value.substring(0, selectionStart) + insertion + value.substring(selectionEnd);
      setContent(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + insertion.length;
      }, 0);
      return;
    }
  }

  async function handleConvertToTodo() {
    if (!content.trim()) return;
    
    const lines = content.split("\n")
      .map(line => line.replace(/^[-*•]\s+/, "").replace(/^\d+\.\s+/, "").replace(/^#+\s+/, "").trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) return;

    const groupName = title.trim() || "Note To-Do";
    
    try {
      const gRes = await groupsService.create(groupName);
      const groupId = gRes.group.id;
      
      for (const line of lines) {
        await tasksService.create(groupId, { title: line });
      }
      
      setIsTodoList(true);
      toast({ kind: "success", message: `Created "${groupName}" task list with ${lines.length} items! Find it in your dashboard.` });
    } catch {
      toast({ kind: "error", message: "Failed to convert to to-do list" });
    }
  }

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-8 lg:p-12 space-y-8 max-w-7xl mx-auto h-[90vh] flex flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <Badge variant="info" size="md">
            Productivity Workspace
          </Badge>
          <h1 className="mt-3 text-h1 font-bold text-text-strong tracking-tight">Personal Notes</h1>
          <p className="mt-2 text-body text-text-muted">
            Organize thoughts, ideas, checklists, and documentation. Supports Markdown previews.
          </p>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Sidebar Notes List */}
        <div className="md:col-span-1 flex flex-col gap-4 min-h-0">
          <div className="flex gap-2 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <Input
                className="pl-9"
                placeholder="Search notes or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="primary" onClick={handleCreateNewNote} title="New Note">
              <Plus size={16} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2">
            {loading ? (
              <div className="py-12 flex items-center justify-center">
                <Loader size="md" />
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center text-text-muted py-8 text-sm font-medium">
                No notes found.
              </div>
            ) : (
              filteredNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => selectNote(note)}
                  className={`w-full text-left p-4 rounded-card border transition-all duration-200 block ${
                    selectedNote?.id === note.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/20 hover:bg-surface-alt"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-text-strong truncate flex-1">{note.title || "Untitled"}</span>
                    <span className="text-[10px] text-text-muted shrink-0">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-1 truncate leading-relaxed">
                    {note.content || "Empty content..."}
                  </p>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.map((t) => (
                        <span key={t} className="text-[9px] font-bold uppercase tracking-wider text-text bg-surface-alt px-1.5 py-0.5 rounded-sm border border-border-subtle">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Note Editor */}
        <div className="md:col-span-2 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col min-h-0 p-6">
            <form onSubmit={handleSaveNote} className="flex-1 flex flex-col min-h-0 space-y-4">
              {/* Form Toolbar */}
              <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-4 shrink-0">
                <Input
                  required
                  placeholder="Note Title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-transparent hover:border-border focus:border-primary font-bold text-lg max-w-md"
                />

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsPreview(!isPreview)}
                    leftIcon={isPreview ? <Edit2 size={16} /> : <Eye size={16} />}
                  >
                    {isPreview ? "Edit" : "Preview"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={async () => {
                      if (!content.trim()) return;
                      setSummaryLoading(true);
                      try {
                        const res = await aiApiService.summarizeNote(content);
                        setAiSummary({ summary: res.summary, topics: res.topics, tags: res.tags });
                        // Auto-fill tags if empty
                        if (!noteTags && res.tags.length > 0) setNoteTags(res.tags.join(", "));
                      } catch {
                        toast({ kind: "error", message: "Failed to summarize note" });
                      } finally {
                        setSummaryLoading(false);
                      }
                    }}
                    leftIcon={summaryLoading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    disabled={summaryLoading || !content.trim()}
                    title="AI Summarize"
                  >
                    AI
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleConvertToTodo}
                    disabled={!content.trim() || isTodoList}
                    leftIcon={<CheckSquare size={16} />}
                    title="Convert this note into a task group in your dashboard"
                  >
                    {isTodoList ? "Converted ✓" : "Convert to To-Do"}
                  </Button>
                  <Button type="submit" variant="primary" disabled={saving} leftIcon={<Save size={16} />}>
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  {selectedNote && (
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(selectedNote.id)}
                      className="h-10 w-10 border border-border hover:border-danger/30 hover:bg-danger/5 hover:text-danger rounded-input flex items-center justify-center transition-all duration-200"
                      title="Delete Note"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Editor Workspace */}
              <div className="flex-1 min-h-0 flex flex-col">
                {isPreview ? (
                  <div className="flex-1 overflow-y-auto p-6 bg-surface-alt border border-border-subtle rounded-input text-sm leading-relaxed prose prose-sm max-w-none text-text">
                    {content ? (
                      <ReactMarkdown>{content}</ReactMarkdown>
                    ) : (
                      <span className="italic text-text-muted">No content to preview.</span>
                    )}
                  </div>
                ) : (
                  <textarea
                    className="flex-1 w-full p-4 rounded-input border border-border bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm resize-none transition-all duration-200"
                    placeholder="Write note contents... (Supports basic headers starting with '# ' and list bullet lines with '- ')"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleContentKeyDown}
                  />
                )}
              </div>

              {/* AI Summary Results Panel */}
              {aiSummary && (
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2 relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setAiSummary(null)}
                    className="absolute top-3 right-3 text-text-muted hover:text-text"
                  >
                    <XIcon size={14} />
                  </button>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                    <Sparkles size={12} />
                    <span>AI Note Summary</span>
                  </div>
                  <p className="text-xs text-text-strong leading-relaxed">{aiSummary.summary}</p>
                  {aiSummary.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-[10px] uppercase font-bold text-text-muted mr-1">Key Topics:</span>
                      {aiSummary.topics.map((topic) => (
                        <span
                          key={topic}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-surface border border-border-subtle text-text font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tags Input */}
              <div className="flex items-center gap-3 shrink-0 pt-2 border-t border-border-subtle">
                <Tag size={16} className="text-text-muted" />
                <Input
                  placeholder="Tags (separated by comma, e.g. meeting, brainstorm, simpllife)"
                  value={noteTags}
                  onChange={(e) => setNoteTags(e.target.value)}
                  className="flex-1"
                />
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
