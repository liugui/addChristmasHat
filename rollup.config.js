import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve'

export default {
    input: 'src/index.js',
    output: {
        file: './dist/main.js',
        name: 'main',
        format: 'umd',
        // sourceMap: true
    },
    plugins: [
        babel({
            exclude: 'node_modules/**',
            runtimeHelpers: true
        }),
        resolve()
    ]
}