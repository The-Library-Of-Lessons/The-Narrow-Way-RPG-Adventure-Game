# Your game-development milestones

## What this build is for

Learn the full loop: decide what the player should feel, implement one small experience, play it, find problems, and improve it. A completed chapter is a better starting point for learning than a large campaign that is difficult to change.

The first milestone established movement, a rescue, combat, dialogue, an escort, original art, sound, touch input, and saves. The Roads of Mercy expansion adds five connected regions, 24 continuation objectives, nine secrets, puzzle-focused guardian encounters, a map with exploration memory, and six Scripture journal pages. It does not reproduce the entire previous compiled game.

## Decisions for the project

| Question | Decision | Reason |
| --- | --- | --- |
| Combat | Real-time staff combat with a dodge | Preserves the action-RPG direction while keeping the first system manageable. |
| Setting | Fictional Christian allegory | Leaves room for original characters and stories; direct Scripture remains clearly attributed. |
| Protagonist | Eli, a young courier | A specific person gives dialogue and growth a foundation. |
| Audience | Families and players who enjoy hopeful adventures | Conflict has emotional weight without graphic violence. |
| Devices | Landscape touch and keyboard, offline first | Lets the browser prototype exercise the controls needed for a future Android game. |
| Scope | Nine regions, built on the rescue chapter | Exploration, puzzles, conversations, community stories, and two final resolutions. |
| Existing material | Keep the core theme of faith expressed through action | Rebuild mechanics and presentation freely; preserve the old game as reference. |
| Release | Private/local learning build first | Learn from players before preparing a public repository or Android release. |

## The next useful playtest

Ask three people to play without explaining the route. Watch quietly. Record:

1. How long it takes to begin moving and find Mara.
2. Whether they recognize collectible yarrow and interactive characters.
3. Whether they understand a shadow's warning before getting hit.
4. Whether they can bring Jonah across the bridge without help.
5. What they remember about Jonah afterward.
6. Whether they want to explore or replay after the ending.

Ask “What did you think you were supposed to do?” when someone gets stuck. Their answer is more useful than asking whether they like the game.

## Suggested next iterations

1. **Feel:** tune movement, attack reach, charge warnings, and touch-button placement based on playtests.
2. **Art:** develop hand-authored sprite sheets with additional directional attack and interaction frames; add more distinct village props without obscuring paths.
3. **Story:** playtest Jonah's restitution at the watchtower and the sanctuary table choices. Ask players what changed in their understanding of love; refine unclear or preachy dialogue.
4. **Engineering:** the new region data lives in `src/campaign-data.js`. Consider a visual editor if hand-authoring additional maps becomes cumbersome. Introduce a build system only when it solves a real problem.
5. **Android:** test actual low- and mid-range phones, touch interruption, rotation, audio resuming, and save persistence before choosing packaging and distribution steps.

## Verification

The nine-road upgrade adds `test-nine-roads.cjs`. Its fast mode invokes public campaign interactions and exercises keyboard choices. Set `WALK_ROADS=1` for real keyboard movement to each expansion encounter. Both modes check prerequisites, save validation, branch cancellation and both resolutions. Tests must not be treated as human pacing or emotional-impact evidence. Use `UPGRADE-PLAN.md` for the spoiler-free remaining release gates.

`test-game.cjs` uses Playwright and Microsoft Edge to drive keyboard controls through the chapter, check progression, and capture screenshots. It is development tooling; the game itself has no dependencies. Set `PLAYWRIGHT_MODULE` if Playwright is outside the project's module path.

The browser test covers quest progression, gathering, combat, dialogue choice, escort routing, ending, save export, invalid import preservation, continue after reload, and mobile touch UI visibility. Browser emulation does not replace a real-device playtest or a human assessment of fun.

`test-campaign.cjs` covers the first five places, old-save migration, puzzle order, a secret, tools, shortcuts, journal feedback, the midpoint ending, reload persistence, invalid imports, and mobile panels. The expanded nine-region pacing target is now two hours or more; it remains unmeasured and must be checked with new players.

`test-checkpoint.cjs` verifies watchtower hazard recovery, persistence of the recovered checkpoint, retention of completed bell steps, and rejection of an invalid locked-region save. The original chapter and expanded campaign browser playthroughs passed, and the checkpoint test passed. Real-device touch testing and human pacing/playability feedback remain outstanding.
