// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { regexNavigation } from './modules/regexnavigation';

export function activate(context: vscode.ExtensionContext) {
    const modulesToLoad = [
        regexNavigation
    ]

    modulesToLoad.forEach((module) => {
        module(context);
    })
}

// This method is called when your extension is deactivated
export function deactivate() {}
