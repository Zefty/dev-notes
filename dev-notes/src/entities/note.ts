import * as vscode from "vscode";

export type NoteCommand = { noteId: string; label: string; content?: string };

export class Note extends vscode.TreeItem {
  constructor(
    public readonly noteId: string,
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode
      .TreeItemCollapsibleState.None,
    public content?: string
  ) {
    super(label, collapsibleState);
    this.command = {
      command: "dev-notes.setSelectedNote",
      title: "Set Selected Note",
      arguments: [
        { noteId: this.noteId, label: this.label, content: this.content },
      ],
    };
  }

  public setContent(newContent: string) {
    this.content = newContent;

    this.command = {
      command: "dev-notes.setSelectedNote",
      title: "Set Selected Note",
      arguments: [
        {
          noteId: this.noteId,
          label: this.label,
          content: this.content,
        },
      ],
    };

    console.log("[LOG] Updated note content:", this.content, this.command);
  }
}
