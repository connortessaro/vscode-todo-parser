import { FileType } from "./FileType";
import { languages, Uri } from "vscode";
import { SCHEME } from "../const/all";
import { UserSettings } from "../classes/UserSettings";

export class TodoType {
  content: string;
  private lineNumber: number;
  private file: FileType;
  private marker: string;

  constructor(file: FileType, content: string, line = 0, marker = "TODO") {
    this.file = file;
    this.content = content;
    this.lineNumber = line;
    this.marker = marker;
  }

  getContent(): string {
    return this.content;
  }

  getLineNumber(): number {
    return this.lineNumber;
  }

  getFile(): FileType {
    return this.file;
  }

  getType(): string {
    return this.marker;
  }

  getSeverity(): number {
    return UserSettings.getInstance().Markers.getPriorityOf(this.marker);
  }

  getDisplayString(): string {
    const url = this.getFile().getFile().uri;
    let location;

    if (url.scheme == ("untitled")) {
      location = `${url.toString()}, Line Number: ${this.getLineNumber()}`;
    } else {
      location = `${url.fsPath}:${this.getLineNumber()}`;
    }
    return `${location}\n${this.getContent()}`;
  }

  toString(): string {
    return this.getFile() + "\n" + this.getContent();
  }
}
