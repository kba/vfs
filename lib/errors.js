module.exports = class Errors {
    static NoSuchFileError(path) { return new Error(`NoSuchFileError: ${path}`) }
    static NotImplementedError(fn) { return new Error(`NotImplementedError: ${fn}`) }
    static PathNotAbsoluteError(path) { return new Error(`PathNotAbsoluteError: ${path}`) }
}
