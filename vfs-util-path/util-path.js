/**
 * ### PathUtils
 *
 * Enhancing [path](https://nodejs.org/api/path.html)
 *
 * ```js
 * const PathUtils = require('@kba/vfs-util-path')
 * PathUtils.removeTrailingSep('/foo/') // '/foo'
 * // or
 * const {removeTrailingSep} = require('@kba/vfs-util-path')
 * removeTrailingSep('/foo/') // '/foo'
 * ```
 */
const PathUtils = {

    /**
     * #### `(static) removeTrailingSep(path)`
     * 
     * Remove trailing separators (slashes) from `path`.
     */
    removeTrailingSep(path) {
        path = path.replace(/\/$/, '')
        if (path === '') path = '/'
        return path

    }
}

module.exports = PathUtils
