import { SveltePlugin } from 'bun-plugin-svelte';

await Bun.$`rm -r dist/*`.nothrow().quiet()
await Bun.build({
    plugins: [SveltePlugin({
        development: false,
        forceSide: 'client',
    })],
    outdir: './dist',
    entrypoints: ['./index.html'],
    sourcemap: 'none',
    splitting: true,
    format: 'esm',
    minify: true,
    env: 'PUB_*',
})