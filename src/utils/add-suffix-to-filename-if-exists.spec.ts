import { addSuffixToFileNameIfExists } from "./add-suffix-to-filename-if-exists";

describe("addSuffixToFileNameIfExists", () => {
    it("an available filename should return it's name", () => {
        expect(addSuffixToFileNameIfExists("abc.txt", ["a.txt", "b.txt"], 10)).toEqual("abc.txt");
    });
    it("an existing filename should return `{filename}_1`", () => {
        expect(addSuffixToFileNameIfExists("b.txt", ["a.txt", "b.txt"], 10)).toEqual("b.txt_1");
    });
    it("should return `{filename}_4` if 3 suffixes are also being used", () => {
        expect(
            addSuffixToFileNameIfExists("a.txt", ["a.txt", "a.txt_1", "a.txt_2", "a.txt_3"], 10)
        ).toEqual("a.txt_4");
    });
    const existingFileNames: string[] = ["a.txt"];
    while (existingFileNames.length <= 1000) {
        existingFileNames.push(`a.txt_${existingFileNames.length}`);
    }
    it("should return `undefined` if filename exists and its suffixes from 1 - 1000 as well", () => {
        expect(addSuffixToFileNameIfExists("a.txt", existingFileNames, 1000)).toEqual(undefined);
    });
});
