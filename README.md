# The Narrow Way: Roads of Mercy

An original, GBA-inspired pixel adventure about learning to love through exploration, listening, service, and repair. Nine connected regions build on the original Willowbrook rescue chapter. This is a new campaign, not a conversion of all 36 quests in the earlier compiled game.

## Play

Open `index.html` in a modern desktop browser. No installation, build step, third-party packages, or internet connection is required. Audio begins after pressing Begin or Continue.

For phone testing, serve this folder from a local HTTP server and open its address on the phone. Landscape is recommended; portrait remains playable. A public site can be prepared later. Nothing has been uploaded or published.

Keyboard: WASD / arrows move, E interacts, J strikes, Space dodges, Escape pauses. M opens the map; B opens the wisdom journal; C talks with Jonah; H offers progressive puzzle hints. During choices, arrows cycle (including wrapping) and Enter selects the highlighted response. Dialogue advances with Enter or Space. Touch devices have contextual action labels; the pause menu offers three control sizes, companion conversations, and hints. The atlas can turn objective guidance off.

## Beginning in Willowbrook

1. Speak with Mara beside the well.
2. Gather three white yarrow sprigs in the southwestern garden and return to her.
3. Cross the eastern bridge and follow the road southeast to Jonah.
4. Drive away three shadows. Their bright eyes and dotted direction lines warn of a charge. Move aside, then strike during recovery.
5. Help Jonah and choose your response.
6. Walk him home. Stay within sight so he can follow; cross near the center of the bridge.
7. Interact with the village lantern to finish. You can keep exploring afterward.

After lighting the lantern, close the chapter ending and speak to Mara again. Existing completed Willowbrook saves can continue directly: no restart is required.

## The expanded roads

| Region | Main activities | Learning theme |
| --- | --- | --- |
| Willowbrook | Rescue Jonah, escort him home, light the lantern | Becoming a neighbor |
| Openhand Orchard | Hear both sides of a dispute, order the irrigation gates, share the harvest | Love beyond your own circle |
| Stillwater Marsh | Listen to witnesses, drain sluices, rescue a passenger, light a safe route | Patience and careful listening |
| The Broken Watch | Read a ledger, inspect damage, collect repair materials, time the warning bells | Restitution and accountability |
| Hill of Many Lamps | Hear two travelers, arrange practical help, solve the lamp sequence, meet the keeper | Loving an enemy and continuing in love |
| Haven of Many Names | Plan crossings, align tide wheels, communicate with waiting groups | Welcoming people by name |
| The Divided Heights | Hear competing needs, align mirrors, rebuild shared spaces | Cooperation without erasing disagreement |
| Hearthwinter Refuge | Allocate warmth, supply rooms, follow a trail, recall a song | Attention to different needs |
| The Last Crossing | Prepare together, deliberate, follow through, remember | Faithful love when care has a cost |

There are 55 continuation milestones, seventeen hidden discoveries, seven Scripture journal pages, twelve optional community stories, three useful tools, and two distinct final resolutions. The first five roads end with a chapter return to Willowbrook; speak to Mara again to continue to the harbor. New encounters emphasize puzzles and dialogue; the watchtower includes a timed hazard. Original rescue combat retains gentle difficulty. Jesus' two greatest commandments (Matthew 22:37–40) anchor the continuing story.

The minimap reveals ground as you walk. Open it to inspect visited regions; secrets are not marked. The rescue rope unlocks shortcuts to visited regions. Rest lanterns and region entrances set checkpoints, refill health, and save progress. Losing all health at the watchtower returns you to the checkpoint without resetting completed puzzle steps.

The expanded campaign targets two hours or more of thoughtful first-time play. That duration is NOT yet measured or guaranteed. Human playtests must establish whether there is enough satisfying content; automated completion and optional stories do not prove a two-hour experience. No forced waiting is used to inflate playtime.

## Saves

Progress saves at quest milestones in this browser. Pause to save manually or export/import JSON. Local-file saves and hosted-site saves are separate: export before changing where you play. Saves from the first Willowbrook build migrate automatically, including completed journeys. Saves from the unrelated, original 38 MB compiled RPG are not compatible.

A previous save is retained under `narrow-way-willowbrook-v1-backup` when replacing a save. Invalid saves are preserved rather than automatically starting and saving a new game. Do not clear browser data without exporting a save you want to retain.

A separate pre-decision snapshot is made at the final deliberation. The pause menu can export it for later import and replay. This never automatically replaces your current journey. Five-region saves remain compatible.

## Project structure

- `index.html`: interface and loading order
- `styles.css`: responsive interface and accessibility
- `src/story.js`: dialogue, choices, and quest objectives
- `src/campaign-data.js`: region objects, continuing story objectives, Scripture and reflections
- `src/campaign.js`: region travel, puzzles, map exploration, journal, and checkpoints
- `src/nine-roads-data.js`: four additional regions, community requests, and the commandments journal page
- `src/nine-roads.js`: additional puzzles, companion conversations, consequences, and ending logic (contains story spoilers)
- `src/art.js`: original procedural pixel art and map artwork
- `src/game.js`: progression, movement, combat, camera, controls, saves
- `src/audio.js`: original synthesized melody and sound effects
- `assets/icon.svg`: original lantern icon

The project intentionally uses plain scripts instead of modules so the offline HTML file works without a server. There are no external fonts or downloaded art assets. The original game remains untouched in its original folder.

## Creative decisions

- Real-time action combat with clear telegraphs, fewer buttons, and generous recovery.
- Fictional Christian allegory, with Scripture labeled separately from invented dialogue.
- A defined protagonist, Eli, whose courage grows through a practical act of mercy.
- Hopeful family-oriented tone; symbolic shadows dissolve rather than graphic violence.
- Landscape Android and desktop first; a short chapter before a larger campaign.
- Original pixel art inspired by the clarity of handheld-era RPGs, without copying their characters or assets.
- No advertisements, purchases, analytics, accounts, or online services in this prototype.

## Before a wider release

This is an expanded playable prototype. Test on real Android phones and measure the new campaign's pacing with players. Refine sprite animation, puzzle clarity, and touch controls based on that feedback. An Android package, device performance profiling, store assets, and release preparation are future work. This build does not claim Play Store readiness.

See `SCRIPTURE-SOURCES.md` for biblical references and the distinction between Scripture and fictional applications. `test-game.cjs` covers the original chapter; `test-campaign.cjs` drives the expanded campaign, legacy-save migration, map, journal, shortcuts, and ending with browser input.

`test-nine-roads.cjs` verifies expansion progression, keyboard-only choices, spatial reachability, prerequisites, cancellation, both endings, persistence, and mobile map rendering. Its fast mode uses public interaction APIs; `WALK_ROADS=1` drives movement and E at every required expansion encounter. Both modes passed. `UPGRADE-PLAN.md` is the spoiler-free roadmap and release checklist.

## License and reuse

Original game code, fictional dialogue, procedural art, synthesized audio, and documentation are available under the [MIT License](LICENSE). You may reuse, modify, redistribute, and sell them, including commercially, while retaining the copyright and license notice. See [ASSET-LICENSE.md](ASSET-LICENSE.md) for scope and attribution. KJV Scripture quotations are separately identified and are not relicensed by this grant. No third-party game art or music is included.
