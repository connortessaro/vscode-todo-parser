import {workspace, window, TextDocument, Uri, CancellationToken, RelativePattern, FileType as VSCodeFileType} from 'vscode';
import {FileType} from '../types/all';
import {UserSettings} from './UserSettings';
import {READ_FILE_CHUNK_SIZE} from '../const/all';
import {sliceArray, getFolderName, getFileExtension} from '../utils/all';

type ReadFilesCallback = (readFiles: FileType[], progress: number, error?:any) => void;
type FinishCallback = () => void;

export class FileReader {
  /**
   * The turn the file opened by the current text editor (or tab)
   */
  static readCurrentFile(): Promise<FileType[]> {
    return new Promise(function (resolve, reject) {
      if(!window.activeTextEditor) {
        reject("Failed to get active editor");
        return;
      }
      let doc = window.activeTextEditor.document;
      if(doc)
        resolve([new FileType(doc)]);
      else
        reject("Cannot get current document");
    });
  }

  /**
   * Return a list of files found in the root folder (project folder).
   * @param callback  A callback that receives a list of recent read files.
   * @param token     Token telling the method to stop.
   */
  static readProjectFiles(callback: ReadFilesCallback, finish: FinishCallback, token?: CancellationToken) {
      let roots = UserSettings.getInstance().getExecutablePaths();
      if (!roots || roots.length === 0)
        roots = FileReader.getWorkspaceRoots();
      if (!roots || roots.length === 0) {
        callback([], 0, "Cannot get root folder.");
        finish();
        return;
      }

      Promise.all(roots.map((root) => FileReader.findFilesInPath(root, token))).then(
        (filesByRoot: string[][]) => {
          if (token && token.isCancellationRequested) {
            finish();
            return;
          }

          let fileNames: string[] = [];
          for (let i = 0; i < filesByRoot.length; i++) {
            fileNames = fileNames.concat(filesByRoot[i]);
          }

          let slices = sliceArray(fileNames, READ_FILE_CHUNK_SIZE);
          FileReader.readFileLoop(slices, 0, callback, finish, token);
        },
        (reason) => {
          callback([], 0, reason);
          finish();
        }
      );
  }

  static readProjectFilesInDir(root: string, callback: ReadFilesCallback, finish: FinishCallback, token?: CancellationToken) {
      if (!root) {
        callback([], 0, "Cannot get root folder.");
        finish();
        return;
      }

      FileReader.findFilesInPath(root, token).then(
        (fileNames: string[]) => {
          if (token && token.isCancellationRequested) {
            finish();
            return;
          }

          let slices = sliceArray(fileNames, READ_FILE_CHUNK_SIZE);
          FileReader.readFileLoop(slices, 0, callback, finish, token);
        },
        (reason) => {
          callback([], 0, reason);
          finish();
        }
      );
  }

  /**
   * Continuously reads files into TextDocument objects.
   * @param slices    Array of document name arrays.
   * @param index     Current index of @slices.
   * @param callback  A callback that receives a list of recent read files.
   * @param token     Token telling the method to stop.
   */
  private static readFileLoop(slices: Array<string[]>, index: number, callback: ReadFilesCallback, finish: FinishCallback, token?: CancellationToken) {
    if (index >= slices.length || (token && token.isCancellationRequested)) {
      finish();
      return;
    }
    let fileNames = slices[index];
    let progress = (index / slices.length * 100) | 0;
    FileReader.readFileFromNames(fileNames).then(
      function (files: FileType[]) {
        callback(files, progress);
        FileReader.readFileLoop(slices, index + 1, callback, finish,  token);
      },
      function (reason) {
        callback([], progress, reason);
        FileReader.readFileLoop(slices, index + 1, callback, finish, token);
      });
  }

  /**
   * Return files found in a directory. Each item is a full path 
   * of a file.
   * @param root  Find starting point.
   */
  private static findFilesInPath(root: string, token?: CancellationToken): Thenable<string[]> {
    if (!root || (!FileReader.isWorkspaceRoot(root) && !UserSettings.getInstance().isFolderEligible(getFolderName(root)))) {
      return Promise.resolve([]);
    }

    return workspace.fs.stat(Uri.file(root)).then(
      (stat) => {
        if ((stat.type & VSCodeFileType.Directory) === 0) {
          return [];
        }

        return workspace.findFiles(new RelativePattern(root, '**/*'), undefined, undefined, token).then((uris) => {
          const names: string[] = [];
          const settings = UserSettings.getInstance();
          const excludedFolders = new Set(settings.FolderExclusions.getValue());

          for (let i = 0; i < uris.length; i++) {
            const fileName = uris[i].fsPath;
            if (FileReader.isInExcludedFolder(fileName, excludedFolders)) {
              continue;
            }

            const ext = getFileExtension(fileName);
            if (settings.isFileEligible(ext)) {
              names.push(fileName);
            }
          }
          return names;
        });
      },
      () => []
    );
  }

  private static isInExcludedFolder(fileName: string, excludedFolders: Set<string>): boolean {
    if (excludedFolders.size === 0) {
      return false;
    }

    const segments = fileName.replace(/\\/g, '/').split('/');
    for (let i = 0; i < segments.length - 1; i++) {
      if (excludedFolders.has(segments[i])) {
        return true;
      }
    }
    return false;
  }

  /**
   * Read files given full file paths. Returns a list of file read successfully.
   * @param uris_or_strings File paths as string or Uri array.
   */
  private static readFileFromNames(uris_or_strings: Array<Uri | string>): Promise<FileType[]> {
    return new Promise(function (resolve, reject) {
      let docs: FileType[] = [];
      // Count of successfully opened files
      let openedCount = 0;
      // Count of files which failed to load
      let failedCount = 0;

      function totalCount() { return openedCount + failedCount; }

      for (let uri of uris_or_strings) {
        let docPrm: Thenable<TextDocument>;
        if (typeof uri === "string") {
          docPrm = workspace.openTextDocument(uri);
        }
        else {
          docPrm = workspace.openTextDocument(uri);
        }
        docPrm.then(
          function (doc: TextDocument) {
            if(doc) // File maybe corrupted
              docs.push(new FileType(doc));

            openedCount++;
            // Detect and end the function early
            if (totalCount() == uris_or_strings.length) {
              resolve(docs);
            }
          },
          function (reason) {
            // Keep going, try other files.
            failedCount++;
            // Detect and end the function early
            if (failedCount == uris_or_strings.length) {
              // All files failed to open, so we reject
              reject("No file has been read successfully.");
            }
            else if (totalCount() == uris_or_strings.length) {
              resolve(docs);
            }
          });
      }
      if (uris_or_strings.length == 0)
        resolve(docs); // no URIs at all
    });
  }

  private static getWorkspaceRoots(): string[] {
    return (workspace.workspaceFolders || []).map(folder => folder.uri.fsPath);
  }

  private static isWorkspaceRoot(root: string): boolean {
    return FileReader.getWorkspaceRoots().indexOf(root) >= 0;
  }
}
