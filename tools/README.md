Monster Dojo - one-battle prototype (plain HTML/CSS/JS, no build, works offline)
Run: python3 -m http.server 8766   (in this folder)  -> open http://localhost:8766/
Files: index.html, style.css, game.js, manifest.json, sw.js, icon-192/512.png, art/
Art slots: the game loads art/sm/<name>.png first, then art/<name>.png, then a built-in SVG placeholder.
  Names: flarepup, splashling, sproutle, kai, sensei-momo, cindermite, puddlefin, mossbun
  To swap art: drop a new art/<name>.png and run `python3 make_small.py` (regenerates art/sm/),
  or just delete art/sm/<name>.png to use the full-size file. Bump CACHE in sw.js for installed copies.
Test hook: window.__G is game state; __G.fast = true skips animation delays.
