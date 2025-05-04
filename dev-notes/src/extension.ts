// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { NoteCommand } from "./entities/Note";
import { DevNotesTreeViewProvider } from "./providers/devNotesTreeViewProvider";
import { DevNotesWebviewViewProvider } from "./providers/devNotesWebviewViewProvider";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('✅ Congratulations, your extension "dev-notes" is now active!');

  const session = await vscode.authentication.getSession(
    "github",
    ["read:user"],
    { createIfNone: true }
  );
  const userId = session.account.id; // Unique GitHub user ID
  const data = context.globalState.get("dev-notes");
  vscode.window.showInformationMessage(
    `Data from global state: ${JSON.stringify(data)}`
  );

  //   context.globalState.update("dev-notes", undefined);

  const notesProvider = new DevNotesTreeViewProvider(context);
  vscode.window.registerTreeDataProvider(
    "devNotesNotesTreeView",
    notesProvider
  );

  const noteWebviewProvider = new DevNotesWebviewViewProvider(
    context,
    notesProvider
  );
  const noteWebviewProviderDisposable =
    vscode.window.registerWebviewViewProvider(
      "devNotesSelectedNoteWebview",
      noteWebviewProvider
    );
  context.subscriptions.push(noteWebviewProviderDisposable);

  context.subscriptions.push(
    vscode.commands.registerCommand("dev-notes.newNote", async () => {
      const title = await vscode.window.showInputBox({
        prompt: "Enter title of new note",
      });
      if (title) {
        notesProvider.addNote(title);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "dev-notes.setSelectedNote",
      (note: NoteCommand) => {
        noteWebviewProvider.showNote(note); // Show note in sidebar
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("dev-notes.clearAllNotes", () => {
      vscode.window
        .showWarningMessage(
          "Are you sure you want to delete all notes?",
          "Yes",
          "Cancel"
        )
        .then((choice) => {
          if (choice === "Yes") {
            notesProvider.clearAllNotes();
          }
        });
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
