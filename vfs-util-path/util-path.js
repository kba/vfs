/**
 * ### `PathUtils`
 *
 * Enhancing [path](https://nodejs.org/api/path.html)
 *
 * ```js
 * const PathUtils = require('@kba/vfs-util-path')
 * PathUtils.removeTrailingSep('/foo/') // '/foo'
 * ```
 */
const PathUtils = {

    /**
     * #### `removeTrailingSep(path)`
     * 
     * Remove trailing separators (slashes) from `path`.
     */
    removeTrailingSep(path) {
        return path.replace(/\/$/, '')
    }
}

module.exports = PathUtils
