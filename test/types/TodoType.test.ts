import assert from "assert";
import { TodoType } from "../../src/types/TodoType";
import { FileType } from "../../src/types/FileType";
import { LanguageType, LanguageName } from "../../src/types/LanguageType";

const JAVA = LanguageName.JAVA; // using JAVA regex for testing purposes

const createMockFile = (): FileType => ({
  getFile: () => ({
    uri: {
      toString: () => "/test.ts"
    }
  }),
  toString: () => "MockFile"
} as unknown as FileType);

suite("TodoType", () => {

  test("getContent returns correct content", () => {
    const file = createMockFile();
    const todo = new TodoType(file, "Test content", 5, "TODO");
    assert.strictEqual(todo.getContent(), "Test content");
  });

  test("getLineNumber returns correct line", () => {
    const file = createMockFile();
    const todo = new TodoType(file, "Test content", 42, "TODO");
    assert.strictEqual(todo.getLineNumber(), 42);
  });

  test("getFile returns correct file instance", () => {
    const file = createMockFile();
    const todo = new TodoType(file, "Test content");
    assert.strictEqual(todo.getFile(), file);
  });

  test("getType returns correct marker", () => {
    const file = createMockFile();
    const todo = new TodoType(file, "Test content", 0, "FIXME");
    assert.strictEqual(todo.getType(), "FIXME");
  });

  test("getSeverity returns a number", () => {
    const file = createMockFile();
    const todo = new TodoType(file, "Test content", 0, "TODO");
    const severity = todo.getSeverity();
    assert.strictEqual(typeof severity, "number");
  });

  test("getDisplayString formats correctly for normal file", () => {
    const fakeFile: any = {
      getFile: () => ({
        uri: {
          scheme: "file",
          fsPath: "/test.ts",
          toString: () => "file:///test.ts"
        }
      })
    };

    const todo = new TodoType(fakeFile, "Hello World", 10, "TODO");
    const display = todo.getDisplayString();
    console.log(display)
    assert.ok(display.includes("/test.ts:10"));
    assert.ok(display.includes("Hello World"));
  });

  test("getDisplayString formats correctly for untitled file", () => {
    const fakeFile: any = {
      getFile: () => ({
        uri: {
          scheme: "untitled",
          toString: () => "untitled:Untitled-1"
        }
      })
    };

    const todo = new TodoType(fakeFile, "Hello World", 3, "TODO");
    const display = todo.getDisplayString();

    assert.ok(display.includes("untitled:Untitled-1; Line Number: 3"));
    assert.ok(display.includes("Hello World"));
  });

  test("toString combines file and content", () => {
    const fakeFile: any = {
      toString: () => "FakeFile"
    };

    const todo = new TodoType(fakeFile, "Some content", 0, "TODO");
    const result = todo.toString();

    assert.ok(result.includes("FakeFile"));
    assert.ok(result.includes("Some content"));
  });

});
