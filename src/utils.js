const fs = require("fs");
const path = require("path");
const util = require("util");
const remark = require("remark");
const remarkHtml = require("remark-html");

/* Using a kludge here to allow:
 * 1) importing this as a module with the `import` statement
 * 2) importing this into non-modules with the `require` function
 * 3) easily referencing these functions from other functions in the same file
 * That's the `module.exports.slugify = slugify` pattern.
 */

/** Template literal tag that converts all embedded values to their literal representations.
 *  Uses `util.inspect()` for the conversions.
 *  Alternatively, this can be used as a (single-argument) alias for `util.inspect`.
 *  Just call it as a regular function with one argument (E.g. `repr(obj)`).
 */
function repr(strParts, ...values) {
    if (strParts.length === undefined && values.length === 0) {
        // Being used as a util.inspect alias.
        return util.inspect(strParts);
    }
    let outParts = [];
    for (let i = 0; i < strParts.length || i < values.length; i++) {
        if (i < strParts.length) {
            outParts.push(strParts[i]);
        }
        if (i < values.length) {
            outParts.push(util.inspect(values[i]));
        }
    }
    return outParts.join("");
}
module.exports.repr = repr;

function contains(iterable, element) {
    return !!(iterable.indexOf(element) > -1);
}
module.exports.contains = contains;

// Set operations from https://exploringjs.com/impatient-js/ch_sets.html#missing-set-operations

/** Get the union of two arrays (or any other spreadable iterable).
 *  The elements are deduplicated by `Set`, so they must work as `Set` keys.
 */
function getUnion(list1, list2) {
    let unionSet = new Set([...list1, ...list2]);
    return [...unionSet];
}
module.exports.getUnion = getUnion;

/** Get the intersection of two iterables.
 *  The elements are identified by `Set`, so they must work as `Set` keys.
 */
function getIntersection(list1, list2) {
    let set1 = new Set(list1);
    let set2 = new Set(list2);
    let interSet = new Set([...set1].filter((e) => set2.has(e)));
    return [...interSet];
}
module.exports.getIntersection = getIntersection;

function slugify(string) {
    return string
        .toLowerCase()
        .replace(/[^\w\d -]/g, "")
        .replace(/[ -]+/g, "-");
}
module.exports.slugify = slugify;

function splitlines(text) {
    return text.split(/\r\n|\r|\n/);
}
module.exports.splitlines = splitlines;

/** Turn a string containing only a date in ISO 8601 format into a `Date` in the local system's
 *  timezone.
 *  @param {string} dateStr A date in ISO 8601 (YYYY-MM-DD) format.
 */
function strToDate(dateStr) {
    return new Date(dateStr + "T00:00:00");
}
module.exports.strToDate = strToDate;

/** Turn a `Date` object into a string showing only the date portion.
 *  @param {Date} date       A Javascript `Date`. This should be produced using `strToDate()`.
 *  @param {string} [format='iso'] The style of string representation for the `date`:
 *    `'iso'`: `"2021-03-12"`
 *    `'long'`: `"March 3, 2021"`
 *    `'D MMMM YYYY'`: `"3 March 2021"`
 */
function dateToStr(date, format = "iso") {
    if (format === "iso") {
        return date.toISOString().slice(0, 10);
    } else if (format === "long") {
        return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    } else if (format === "D MMMM YYYY") {
        return date.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
    }
}
module.exports.dateToStr = dateToStr;

/** Get the difference, in whole days, between two date strings.
 *  E.g. `dateStrDiff('2021-04-16', '2021-04-14') === 2`
 */
function dateStrDiff(date1, date2) {
    let date1date = strToDate(date1);
    let date2date = strToDate(date2);
    return Math.round((date1date - date2date) / 1000 / 60 / 60 / 24);
}
module.exports.dateStrDiff = dateStrDiff;

function getImage(imagePath, images) {
    if (!imagePath) {
        return imagePath;
    }
    if (startswith(imagePath, "/src/images/")) {
        return imagePath.substring(4);
    } else if (startswith(imagePath, "/images/")) {
        return imagePath;
    }
    let fields = imagePath.split("/");
    let filename = fields[fields.length - 1];
    let assetPath = images[filename];
    if (!assetPath) {
        console.error(repr`Image ${filename} not found in asset store.`);
        return imagePath;
    }
    return assetPath;
}
module.exports.getImage = getImage;

function mdToHtml(md) {
    //TODO: Fix links (E.g. `/src/main/index.md` -> `/main/`)
    let rawHtml;
    remark()
        .use(remarkHtml)
        .process(md, (err, file) => {
            if (err) {
                console.error(err);
            } else {
                rawHtml = String(file);
            }
        });
    return rmPrefix(rmSuffix(rawHtml.trim(), "</p>"), "<p>");
}
module.exports.mdToHtml = mdToHtml;

function matchesPrefixes(string, prefixes) {
    for (let prefix of prefixes) {
        if (string.indexOf(prefix) === 0) {
            return true;
        }
    }
    return false;
}
module.exports.matchesPrefixes = matchesPrefixes;

function ensurePrefix(string, char) {
    if (string.startsWith(char)) {
        return string;
    } else {
        return char + string;
    }
}
module.exports.ensurePrefix = ensurePrefix;

function rmPrefix(rawString, prefix) {
    if (rawString.indexOf(prefix) === 0) {
        return rawString.slice(prefix.length);
    } else {
        return rawString;
    }
}
module.exports.rmPrefix = rmPrefix;

function rmSuffix(rawString, suffix) {
    let suffixIndex = rawString.length - suffix.length;
    if (rawString.slice(suffixIndex) === suffix) {
        return rawString.slice(0, suffixIndex);
    } else {
        return rawString;
    }
}
module.exports.rmSuffix = rmSuffix;

function startswith(string, query) {
    return string.indexOf(query) === 0;
}
module.exports.startswith = startswith;

function endswith(string, query) {
    return string.indexOf(query) === string.length - query.length;
}
module.exports.endswith = endswith;

function titlecase(rawString) {
    return rawString.charAt(0).toUpperCase() + rawString.substring(1, rawString.length);
}
module.exports.titlecase = titlecase;

/** Create the same effect as adding a tab to the string, except use spaces. */
function spaceTab(rawStr, tabWidth = 8) {
    let tabStop = tabWidth * (1 + Math.floor(rawStr.length / tabWidth));
    return rawStr.padEnd(tabStop);
}
module.exports.spaceTab = spaceTab;

function rmPathPrefix(path, depth, absolute = null) {
    let inputIsAbsolute = path.startsWith("/");
    if (inputIsAbsolute) {
        depth++;
    }
    if (absolute === null) {
        absolute = inputIsAbsolute;
    }
    let fields = path.split("/");
    let newPath = fields.slice(depth).join("/");
    if (absolute) {
        return "/" + newPath;
    } else {
        return newPath;
    }
}
module.exports.rmPathPrefix = rmPathPrefix;

/**
 * Find all the children of `rootDir`.
 * Arguments:
 *   `rootDir` (`String`): An absolute or relative path of a directory.
 * Returns:
 *   `files` (`Array`): An array of paths relative to the same directory as the `rootDir`.
 *     Returns only the paths to files (tested by `isFile()`).
 */
function getFilesDeep(rootDir) {
    let files = [];
    let children = fs.readdirSync(rootDir, { withFileTypes: true });
    for (let child of children) {
        let childPath = path.join(rootDir, child.name);
        if (child.isDirectory()) {
            let descendents = getFilesDeep(childPath);
            files = files.concat(descendents);
        } else if (child.isFile()) {
            files.push(childPath);
        }
    }
    return files;
}
module.exports.getFilesDeep = getFilesDeep;

function getFilesShallow(dirPath, excludeExt = null) {
    let files = [];
    let children = fs.readdirSync(dirPath, { withFileTypes: true });
    for (let child of children) {
        //TODO: If it's a link, check that the target is a file.
        //      Looks like I'll have to use `fs.readlink()` with a callback.
        if (child.isFile() || child.isSymbolicLink()) {
            if (excludeExt === null || path.parse(child.name).ext !== excludeExt) {
                files.push(child.name);
            }
        }
    }
    return files;
}
module.exports.getFilesShallow = getFilesShallow;

function describeObject(obj, indent = "", maxWidth = 100) {
    for (let [name, value] of Object.entries(obj)) {
        let type = typeof value;
        let valueStr;
        if (type === "string") {
            valueStr = util.inspect(value);
        } else if (type === "number" || type === "boolean" || value === null) {
            valueStr = value;
        } else {
            valueStr = `(${type})`;
        }
        let nameStr = spaceTab(name + ":");
        let rawLine = `${indent}${nameStr}${valueStr}`;
        let line;
        if (rawLine.length > maxWidth) {
            line = rawLine.substring(0, maxWidth - 1) + "…";
        } else {
            line = rawLine;
        }
        console.log(line);
    }
}
module.exports.describeObject = describeObject;

function logTree(root, depth, indent) {
    let idStr = "";
    if (root.id) {
        idStr = ` id="${root.id}`;
    }
    let classStr = "";
    if (root.className) {
        classStr = ` class="${root.className}"`;
    }
    console.log(`${indent}<${root.tagName.toLowerCase()}${idStr}${classStr}>`);
    depth -= 1;
    indent = "  " + indent;
    if (depth > 0) {
        root.children.forEach((child) => logTree(child, depth, indent));
    } else {
        console.log(`${indent}  (recursion limit)`);
    }
}
module.exports.logTree = logTree;

class PathInfo {
    constructor(path) {
        //TODO: `cache` option to tell it to cache results of system calls.
        //      This will prevent it from updating as the filesystem state changes, though.
        this.path = path;
    }
    /** Does the path exist?
     *  Note: This returns `true` for broken symlinks (the link exists, but its targets does not).
     */
    exists() {
        if (fs.existsSync(this.path)) {
            return true;
        } else {
            try {
                fs.lstatSync(this.path);
                return true;
            } catch (error) {
                return false;
            }
        }
    }
    static exists(path) {
        let pathInfo = new this(path);
        return pathInfo.exists();
    }
    /** Get the type of filesystem object this path points to.
     *  If the path does not exist, return `'nonexistent'`.
     *  If the path is a symbolic link, return the type of its target. If the target is missing,
     *  return `'brokenlink'`.
     */
    type() {
        if (!this.exists()) {
            return "nonexistent";
        }
        let stats;
        try {
            stats = fs.statSync(this.path);
        } catch (error) {
            if (error.code === "ENOENT") {
                // fs.statSync() will throw an error on a broken link.
                // We defined those as "existing" in this.exists(), but fs.statSync() does not agree.
                if (this.isLink()) {
                    return "brokenlink";
                } else {
                    console.error(`Unexpected filesystem entry ${this.path}`);
                    throw error;
                }
            } else {
                throw error;
            }
        }
        if (stats.isFile()) {
            return "file";
        } else if (stats.isDirectory()) {
            return "dir";
        } else if (stats.isSocket()) {
            return "socket";
        } else if (stats.isBlockDevice()) {
            return "block";
        } else if (stats.isCharacterDevice()) {
            return "char";
        } else if (stats.isFIFO()) {
            return "fifo";
        } else {
            throw `Unexpected path type: ${this.path}`;
        }
    }
    static type(path) {
        let pathInfo = new this(path);
        return pathInfo.type();
    }
    isLink() {
        if (this.exists()) {
            let stats = fs.lstatSync(this.path);
            if (stats.isSymbolicLink()) {
                return true;
            }
        }
        return false;
    }
    static isLink(path) {
        let pathInfo = new this(path);
        return pathInfo.isLink();
    }
    mtime() {
        if (this.exists()) {
            let stats = fs.lstatSync(this.path);
            return stats.mtimeMs;
        } else {
            return null;
        }
    }
    static mtime(path) {
        let pathInfo = new this(path);
        return pathInfo.mtime();
    }
    size() {
        if (this.exists()) {
            let stats = fs.lstatSync(this.path);
            return stats.size;
        } else {
            return null;
        }
    }
    static size(path) {
        let pathInfo = new this(path);
        return pathInfo.size();
    }
}
module.exports.PathInfo = PathInfo;
