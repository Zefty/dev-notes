import * as vscode from "vscode";
import { DevNotesTreeViewProvider } from "./devNotesTreeViewProvider";
import { NoteCommand } from "../entities/Note";

export class DevNotesWebviewViewProvider implements vscode.WebviewViewProvider {
  private currentNote?: NoteCommand;
  private webview?: vscode.WebviewView;

  constructor(
    private context: vscode.ExtensionContext,
    private tree: DevNotesTreeViewProvider
  ) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    // Save reference to the webview
    this.webview = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = this.getWebviewContent();

    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case "saveNote":
          this.saveCurrentNote(message.content);
          break;
      }
    });
  }

  private saveCurrentNote(content: string) {
    if (this.currentNote?.noteId) {
      this.tree.updateNote(this.currentNote?.noteId, content);
    }
  }

  public showNote(note: NoteCommand) {
    const updatedNote = this.tree.getNoteById(note.noteId);
    if (!updatedNote) {
      return;
    }

    this.currentNote = {
      noteId: updatedNote.noteId,
      label: updatedNote.label,
      content: updatedNote.content,
    };

    if (this.webview) {
      this.webview.webview.html = this.getWebviewContent();
    }
  }

  public sendMessageToWebview(message: any) {
    if (this.webview) {
      this.webview.webview.postMessage(message);
    }
  }

  private getWebviewContent(): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          html, body {
            margin: 0;
            padding: 0;
            height: 100vh;
            width: 100vw;
            overflow: hidden;
            background-color: var(--vscode-sideBar-background);
            color: var(--vscode-sideBar-foreground);
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
          }

          textarea {
            width: 100%;
            height: 100%;
            padding: 10px;
            box-sizing: border-box;
            border: none;
            outline: none;
            resize: none;
            background-color: var(--vscode-sideBar-background);
            color: var(--vscode-sideBar-foreground);
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
          }
        </style>
      </head>
      <body>
        <textarea id="noteInput" placeholder="Write your note here...">${
          this.currentNote?.content ?? ""
        }</textarea>
        <script>
          const vscode = acquireVsCodeApi();
          const textarea = document.getElementById('noteInput');

          // Auto-save when typing (throttled to once every 300ms)
          let timeout;
          textarea.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              vscode.postMessage({
                command: 'saveNote',
                content: textarea.value
              });
            }, 300);
          });
        </script>
      </body>
    </html>
  `;
  }
}
