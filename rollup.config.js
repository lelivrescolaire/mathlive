import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';
import babel from 'rollup-plugin-babel';
export default [
    {
        input: 'src/mathlive.js',
        plugins: [
            babel(),
            terser({
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                    ecma: 8,
                    module: true,
                    warnings: true,
                    passes: 2,
                },
            }),
            copy({
                targets: [
                    { src: 'css/fonts', dest: 'dist' },
                    { src: 'src', dest: 'dist' },
                    {
                        src: 'build/types.d.ts',
                        dest: 'dist',
                        rename: 'mathlive.d.ts',
                    },
                ],
            }),
        ],
        output: [
            {
                // JavaScript native module
                file: 'dist/mathlive.mjs',
                format: 'es',
            },
            {
                // UMD file, suitable for <script>, require(), etc...
                file: 'dist/mathlive.js',
                format: 'umd',
                name: 'MathLive',
            },
        ],
    },
    {
        input: 'src/vue-mathlive.js',
        plugins: [
            terser({
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                    ecma: 6,
                    module: true,
                    warnings: true,
                },
            }),
        ],
        output: {
            // JavaScript native module
            file: 'dist/vue-mathlive.mjs',
            format: 'es',
        },
    },
];
