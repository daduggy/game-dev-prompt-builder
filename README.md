# Game Dev Prompt Builder

[Open the app on GitHub Pages](https://daduggy.github.io/game-dev-prompt-builder/)

Create a game project, describe its world and technical requirements, and build reusable prompts for 2D art, 3D assets, animation, effects, and gameplay scripts. Review and edit the generated text before copying it into ChatGPT or Codex.

Choose **New project** to start your own game, or explore the editable **Emberfall** project and its six example prompts. Select a template from the asset library, fill in its specifications, and choose ChatGPT or Codex. Generate the prompt, edit its text, and save it to the project. Open **Saved prompts** to revisit or copy it.

Projects and prompts stay in IndexedDB in the browser profile and site where you created them. Clearing site data removes those records.

## Run locally

Use Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Open the local address printed by Next.js. Run `npm run build` to produce the static website in `out/`.

## GitHub Pages

In the repository's **Settings → Pages**, choose **GitHub Actions** as the build source. Push to `main` or run the Pages workflow from the Actions tab. The workflow reads the repository's Pages base path, builds the Next.js static export and publishes it. The deployment job displays the live URL.
