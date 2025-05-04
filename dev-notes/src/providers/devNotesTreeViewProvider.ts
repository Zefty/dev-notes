import * as vscode from "vscode";
import { v4 as uuidv4 } from "uuid";
import { Note } from "../entities/Note";

export class DevNotesTreeViewProvider implements vscode.TreeDataProvider<Note> {
  private _notes: Map<string, Note> = new Map<string, Note>();
  private _onDidChangeTreeData: vscode.EventEmitter<Note | undefined | void> =
    new vscode.EventEmitter<Note | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<Note | undefined | void> =
    this._onDidChangeTreeData.event;

  constructor(private _context: vscode.ExtensionContext) {
    this.loadNotesFromGlobalState();
  }

  private loadNotesFromGlobalState() {
    const notesFromGlobalState = this._context.globalState.get<
      Map<string, Note>
    >("dev-notes", new Map<string, Note>());

    const notes = new Map(
      Object.entries(notesFromGlobalState).map(([key, value]) => [
        key,
        new Note(
          value.noteId,
          value.label,
          value.collapsibleState,
          value.content
        ),
      ])
    );
    this._notes = notes;

    console.log("[LOG] Loaded notes from global state:", this._notes);
  }

  private saveNotesToGlobalState() {
    const obj = Object.fromEntries(this._notes);
    console.log("[LOG] Saving notes to global state:", obj);

    this._context.globalState.update("dev-notes", obj);
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Note): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Note): Thenable<Note[]> {
    if (element) {
      return Promise.resolve([]);
    }
    return Promise.resolve(Array.from(this._notes.values()));
  }

  addNote(label: string) {
    const noteId = uuidv4();
    const newNote = new Note(noteId, label);
    this._notes.set(noteId, newNote);
    this.saveNotesToGlobalState();
  }

  updateNote(noteId: string, content: string) {
    const note = this._notes.get(noteId);

    console.log("[LOG] Updating note:", noteId, content);

    if (note) {
      note.setContent(content);
      this.saveNotesToGlobalState();
    }
  }

  getNoteById(noteId: string): Note | undefined {
    return this._notes.get(noteId);
  }

  clearAllNotes() {
    this._notes = new Map<string, Note>();
    this.saveNotesToGlobalState();
  }
}
