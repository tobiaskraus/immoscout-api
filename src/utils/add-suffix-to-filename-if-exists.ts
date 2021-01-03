/**
 * @param filename name of file (with file extension)
 * @param existingFilenames (with file extensions)
 * @param maxSuffix (after which suffix number, it should stop trying to find an available filename (return undefined))
 *
 * @return available filename (eventually with suffix) or undefined if no available filename was found
 */
export function addSuffixToFileNameIfExists(
    filename: string,
    existingFilenames: string[],
    maxSuffix: number
) {
    // filename doesn't exist
    if (existingFilenames.find((name) => name === filename) === undefined) {
        return filename;
    }
    // filename exists -> try multiple suffixes until available found
    let foundAvailableFilename = false;
    for (let suffix = 1; !foundAvailableFilename && suffix < maxSuffix; suffix++) {
        let tempFilename = `${filename}_${suffix}`;
        if (!existingFilenames.find((name) => name === tempFilename)) {
            // filename with this suffix does not exist ...
            filename = tempFilename;
            foundAvailableFilename = true;
            return filename;
        }
    }
    if (!foundAvailableFilename) {
        return;
    }
}
