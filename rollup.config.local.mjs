import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import run from '@rollup/plugin-run';
import typescript from '@rollup/plugin-typescript';

export default cliArgs => {
    let build = {
        //  Our game entry point (edit as required)
        input: [
            './src/local.ts'
        ],

        //  Where the build file is to be generated.
        //  Most games being built for distribution can use iife as the module type.
        //  You can also use 'umd' if you need to ingest your game into another system.
        //  If using Phaser 3.21 or **below**, add: `intro: 'var global = window;'` to the output object.
        output: {
            file: './dist/local.js',
            name: 'MyGame',
            format: 'cjs',
            sourcemap: true,
        },

        external: ['xml2js'],

        plugins: [

            //  Toggle the booleans here to enable / disable Phaser 3 features:
            replace({
                preventAssignment: true,
                'INCLUDE_GRAPHICS: true': 'INCLUDE_GRAPHICS: false'
            }),

            //  Parse our .ts source files
            nodeResolve({
                extensions: [ '.ts', '.tsx' ]
            }),

            //  We need to convert the Phaser 3 CJS modules into a format Rollup can use:
            commonjs({
                sourceMap: true,
                ignoreGlobal: true
            }),

            //  See https://github.com/rollup/plugins/tree/master/packages/typescript for config options
            typescript(),

            run({
                args:[
                    cliArgs.configArgs
                ]
            })

        ]
    };

    return build;
};