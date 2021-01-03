import { splitFilenameIntoFileAndExt } from "./split-filename-into-file-and-ext";

fdescribe("splitFilenameIntoFileAndExt", () => {
    it("shoud split a.txt into ['a', 'txt'] ", () => {
        expect(splitFilenameIntoFileAndExt("a.txt")).toEqual(["a", "txt"]);
    });
    it("shoud split a.b.c.txt into ['a.b.c', 'txt'] ", () => {
        expect(splitFilenameIntoFileAndExt("a.b.c.txt")).toEqual(["a.b.c", "txt"]);
    });
    it("shoud split .gitignore into ['', 'gitignore'] ", () => {
        expect(splitFilenameIntoFileAndExt(".gitignore")).toEqual(["", "gitignore"]);
    });
    it("shoud split `nameWithoutExt` into ['nameWithoutExt', ''] ", () => {
        expect(splitFilenameIntoFileAndExt("nameWithoutExt")).toEqual(["nameWithoutExt", ""]);
    });
});
