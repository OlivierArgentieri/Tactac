
import * as vscode from 'vscode';


const getRegex = (languageID: string): RegExp | undefined => {
    switch (languageID) {
        case 'python':
            return /(def \w+[\(|:])/g;
        default:
            return undefined
    }
}

// this module he used to navigate to the next and previous definition of a function
const getNextDefinition = (document: vscode.TextDocument, current_position: vscode.Position): vscode.Range | undefined => {

    const regex = getRegex(document.languageId);
    if (!regex) {
        vscode.window.showInformationMessage('Sorry, this language is not supported yet.');
        return;
    }

	for (let line = current_position.line + 1; line < document.lineCount; line++) {
		const text = document.lineAt(line).text;
		if (/def \w+[\(|:]/g.test(text)) {
			return new vscode.Range(new vscode.Position(line, 0), new vscode.Position(line, 0));
		}
	}
}

const getPreviousDefinition = (document: vscode.TextDocument, current_position: vscode.Position): vscode.Range | undefined => {
    
    const regex = getRegex(document.languageId);
    if (!regex) {
        vscode.window.showInformationMessage('Sorry, this language is not supported yet.');
        return;
    }

	for (let line = current_position.line-1; line >= 0; line--) {
		const text = document.lineAt(line).text;
		if (/def \w+[\(|:]/g.test(text)) {
			return new vscode.Range(new vscode.Position(line, 0), new vscode.Position(line, 0));
		}
	}
}

const revealNewDefinition = (editor: vscode.TextEditor, newDefiniton: vscode.Range | undefined) => {
	if (!editor) {
		return;
	}

	if (!newDefiniton) {
		return;
	}

	const newPosition = new vscode.Position(newDefiniton.start.line, 0);
	editor.selection = new vscode.Selection(newPosition, newPosition);

	// also move view to the start of the function
	editor.revealRange(newDefiniton);
}

export function regexNavigation(context: vscode.ExtensionContext) {
    const previousDefCommand = vscode.commands.registerTextEditorCommand("vsharm.previousDef", async () => {
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			return;
		}

		const document = editor.document;
		const position = editor.selection.active;
		
		const previousDef = getPreviousDefinition(document, position);
		if (previousDef) {
			// Move the cursor to the start of the nearest function.
			const newPosition = new vscode.Position(previousDef.start.line, 0);
			editor.selection = new vscode.Selection(newPosition, newPosition);

			// also move view to the start of the function
			editor.revealRange(previousDef);
		}
	})

	const nextDefCommand = vscode.commands.registerTextEditorCommand("vsharm.nextDef", async () => {
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			return;
		}

		const document = editor.document;
		const position = editor.selection.active;
		
		revealNewDefinition(editor, getNextDefinition(document, position))
	})

    context.subscriptions.push(
        previousDefCommand,
        nextDefCommand,
    );
}
