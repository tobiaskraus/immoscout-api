/**
 * @param filename e.g. "a.b.c.txt"
 * @return e.g. ["a.b.c", "txt"]
 */
export function splitFilenameIntoFileAndExt(filename: string) {
    if (filename.indexOf(".") === -1) {
        return [filename, ""];
    }
    return [
        filename.substring(0, filename.lastIndexOf(".")),
        filename.substring(filename.lastIndexOf(".") + 1),
    ];
}
