module.exports = {
  apps: [
    {
      name: "reddit-clone-api",
      cwd: "/home/ubuntu/reddit-clone/server",
      script: "dist/index.js",
      instances: 1,
      autorestart: true,
      env: { NODE_ENV: "production", PORT: 4000 },
    },
    {
      name: "reddit-clone-web",
      cwd: "/home/ubuntu/reddit-clone/client",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 1,
      autorestart: true,
      env: { NODE_ENV: "production" },
    },
  ],
};
