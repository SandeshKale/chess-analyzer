/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The lite-single Stockfish build is single-threaded, so it does NOT need
  // Cross-Origin-Opener-Policy / Cross-Origin-Embedder-Policy headers.
  // If you later swap in the multi-threaded stockfish-18.wasm build for more
  // speed, uncomment the headers block below (and it must be served from
  // the same origin, which /public already gives you).
  //
  // async headers() {
  //   return [
  //     {
  //       source: "/(.*)",
  //       headers: [
  //         { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  //         { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
  //       ],
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
