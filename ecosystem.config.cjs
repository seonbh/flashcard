module.exports = {
  apps: [
    {
      name: "nuxt-app",
      script: ".output/server/index.mjs",
      interpreter: "node",
      args: "--port 3000",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
