import { addSuffixToFileNameIfExists } from "./add-suffix-to-filename-if-exists";

describe("addSuffixToFileNameIfExists", () => {
    it("an available filename should return it's name", () => {
        expect(addSuffixToFileNameIfExists("abc.txt", ["a.txt", "b.txt"], 10)).toEqual("abc.txt");
    });
    it("an existing filename should return `{filename}_1.{ext}`", () => {
        expect(addSuffixToFileNameIfExists("b.txt", ["a.txt", "b.txt"], 10)).toEqual("b_1.txt");
    });
    it("should return `{filename}_4.{ext}` if 3 suffixes are also being used", () => {
        expect(
            addSuffixToFileNameIfExists("a.txt", ["a.txt", "a_1.txt", "a_2.txt", "a_3.txt"], 10)
        ).toEqual("a_4.txt");
    });
    const existingFileNames: string[] = ["a.txt"];
    while (existingFileNames.length <= 1000) {
        existingFileNames.push(`a_${existingFileNames.length}.txt`);
    }
    it("should return `undefined` if filename exists and its suffixes from 1 - 1000 as well", () => {
        expect(addSuffixToFileNameIfExists("a.txt", existingFileNames, 1000)).toEqual(undefined);
    });
});
