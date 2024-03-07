import * as vscode from 'vscode';
import { Language } from '../models/language';

const languages : Language[] = [
    { regex: /((def|class) \w+[\(|:])/g, name: 'python', indentationBased: false },
    { regex: /(#+\s)/g, name: 'markdown', indentationBased: false },
    { regex: /([\[|\]|\{|\}])/g, name: 'json', indentationBased: false },
    { regex: /(\w+\s*\{)/g, name: 'qml', indentationBased: false },
    { regex: /(\w+\s*\:)/g, name: 'yaml', indentationBased: true}
];

const getLanguage = (languageID: string): Language | undefined => {
    return languages.find((language) => language.name === languageID) || undefined;
};

// this module he used to navigate to the next and previous definition of a function
const getNextDefinition = (document: vscode.TextDocument, current_position: vscode.Position): vscode.Range | undefined => {
    const lang = getLanguage(document.languageId);
    if (!lang) {
        vscode.window.showInformationMessage('Sorry, this language is not supported yet.');
        return;
    }

    const currentLine = document.lineAt(current_position.line).text;
    for (let line = current_position.line + 1; line < document.lineCount; line++) {
        const nextLine = document.lineAt(line).text;
        
        if (lang.indentationBased) {
            const currentLineIndentation: number = currentLine.search(/\S/);
            const nextLineIndentation: number = nextLine.search(/\S/);
            
            if (currentLineIndentation > 0 && nextLineIndentation <= currentLineIndentation) {
                continue;
            }
        }

        // reset the regex
        lang.regex.lastIndex = 0;
        if (lang.regex.test(nextLine)) {
            return new vscode.Range(new vscode.Position(line, 0), new vscode.Position(line, 0));
        }
    }

    return new vscode.Range(new vscode.Position(document.lineCount-1, 0), new vscode.Position(document.lineCount-1, 0));
};

const getPreviousDefinition = (document: vscode.TextDocument, current_position: vscode.Position): vscode.Range | undefined => {
    const lang = getLanguage(document.languageId);
    if (!lang) {
        vscode.window.showInformationMessage('Sorry, this language is not supported yet.');
        return;
    }
    
    const currentLine = document.lineAt(current_position.line).text;
    for (let line = current_position.line-1; line >= 0; line--) {
        const previousLine = document.lineAt(line).text;

        if (lang.indentationBased) {
            const currentLineIndentation: number = currentLine.search(/\S/);
            const previousLineIndentation: number = previousLine.search(/\S/);

            if (currentLineIndentation > 0 && previousLineIndentation >= currentLineIndentation) {
                continue;
            }
        }

        // reset the regex
        lang.regex.lastIndex = 0;
        if (lang.regex.test(previousLine)) {
            return new vscode.Range(new vscode.Position(line, 0), new vscode.Position(line, 0));
        }
    }
    return new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0));
};

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
};

export function regexNavigation(context: vscode.ExtensionContext) {
    const previousDefCommand = vscode.commands.registerTextEditorCommand("tactac.previousDef", async () => {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            return;
        }

        const document = editor.document;
        const position = editor.selection.active;
        
        revealNewDefinition(editor, getPreviousDefinition(document, position));
    });

    const nextDefCommand = vscode.commands.registerTextEditorCommand("tactac.nextDef", async () => {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            return;
        }

        const document = editor.document;
        const position = editor.selection.active;
        
        revealNewDefinition(editor, getNextDefinition(document, position));
    });

    context.subscriptions.push(
        previousDefCommand,
        nextDefCommand,
    );
}
