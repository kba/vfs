const Path = require('path')
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
class PathUtils {

    /**
     * #### `(static) removeTrailingSep(path)`
     * 
     * Remove trailing separators (slashes) from `path`.
     *
     * @param {boolean} keepRoot Whether to remove or keep a single root slash
     */
    static removeTrailingSep(path, keepRoot=true) {
        path = path.replace(/\/$/, '')
        if (path === '' && keepRoot) path = '/'
        return path

    }

    /**
     * #### `(static) removeLeadingSep(path)`
     * 
     * Remove leading separators (slashes) from `path`.
     */
    static removeLeadingSep(path) {
        return path.replace(/^\//, '')
    }

    static chrootPath(path, chroot) {
        // console.log({path, chroot})
        if (path.indexOf(chroot) === 0) return path
        return Path.join(chroot, path)
    }
}

module.exports = PathUtils

// vim: sw=4 ts=4
