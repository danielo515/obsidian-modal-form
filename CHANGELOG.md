# Changelog

## [1.61.1](https://github.com/danielo515/obsidian-modal-form/compare/1.61.0...1.61.1) (2025-11-20)


### Bug Fixes

* allow decimal inputs for number fields ([54ded20](https://github.com/danielo515/obsidian-modal-form/commit/54ded20b00e0180df9f84499c7b76994d33ddca9))

## [1.61.0](https://github.com/danielo515/obsidian-modal-form/compare/1.60.2...1.61.0) (2025-04-25)


### Features

* add form commands and improve NewNoteModal with auto-selection for single form ([ffe2a1d](https://github.com/danielo515/obsidian-modal-form/commit/ffe2a1d4236c5134f32f277e730858c2fce871f2))

## [1.60.2](https://github.com/danielo515/obsidian-modal-form/compare/1.60.1...1.60.2) (2025-03-29)


### Bug Fixes

* **form-runtime:** handle outside clicks and X button ([ee383d7](https://github.com/danielo515/obsidian-modal-form/commit/ee383d7d1de5f78f0876698cc8718b178627e773)), closes [#374](https://github.com/danielo515/obsidian-modal-form/issues/374)

## [1.60.1](https://github.com/danielo515/obsidian-modal-form/compare/1.60.0...1.60.1) (2025-03-02)


### Bug Fixes

* update release-please and try to force it ([96f93c0](https://github.com/danielo515/obsidian-modal-form/commit/96f93c0570368e8dadc6036ca1b9e22c6320e5af))

## [1.60.0](https://github.com/danielo515/obsidian-modal-form/compare/1.59.0...1.60.0) (2025-02-18)


### Features

* **fields:** provide form fields to dataview inputs ([4f209ce](https://github.com/danielo515/obsidian-modal-form/commit/4f209ce4eb205224608587b32a9e06efd6afaccd))

## [1.59.0](https://github.com/danielo515/obsidian-modal-form/compare/1.58.0...1.59.0) (2025-02-01)


### Features

* add tests ([0aea8dd](https://github.com/danielo515/obsidian-modal-form/commit/0aea8ddba6506ab69747cb53983dd7fe630d4a00))
* build forms programmatically ([5701614](https://github.com/danielo515/obsidian-modal-form/commit/5701614b27265672eab53a878db92e34c61eae89))
* ensure at the type level the builder implements all the fields ([d9f3c4a](https://github.com/danielo515/obsidian-modal-form/commit/d9f3c4af45f7b31596c538e0855f709b9ba1e922))

## [1.58.0](https://github.com/danielo515/obsidian-modal-form/compare/1.57.0...1.58.0) (2025-01-31)


### Features

* preview forms from form manager ([58b8914](https://github.com/danielo515/obsidian-modal-form/commit/58b8914ea421cb810b5496559aae0c7d6d5f50c5))

## [1.57.0](https://github.com/danielo515/obsidian-modal-form/compare/1.56.0...1.57.0) (2024-12-20)


### Features

* **parser:** add support for parsing transformations ([2dbe84c](https://github.com/danielo515/obsidian-modal-form/commit/2dbe84c95da65504172a68ad974174b9c5bd48b7))
* **template:** execute transformations when applying templates ([7552a2a](https://github.com/danielo515/obsidian-modal-form/commit/7552a2a6095ff1fd51c1b0010abfc08edc53ffa3))


### Bug Fixes

* import forms not working ([e9c64c2](https://github.com/danielo515/obsidian-modal-form/commit/e9c64c29e0fbae3602cc4e0ab03f0d9c3fd928ed))

## [1.56.0](https://github.com/danielo515/obsidian-modal-form/compare/1.55.0...1.56.0) (2024-12-19)


### Features

* **core:** template service to use any available template engine to post-process templates ([a3f9d4e](https://github.com/danielo515/obsidian-modal-form/commit/a3f9d4e1e6eb648ecf49d5c3b73a3f3d605756df))
* **templates:** ask templater to run on form template insertion ([2a10a25](https://github.com/danielo515/obsidian-modal-form/commit/2a10a25133df105aa035bffbdf001e8bd7da15da))
* **templates:** offer retry on templater errors ([64dae86](https://github.com/danielo515/obsidian-modal-form/commit/64dae864a6d36e54038857b958cd21bf9f1fc412))
* **templates:** post-process templates using templater ([ea01cd9](https://github.com/danielo515/obsidian-modal-form/commit/ea01cd93569771c4b21f7b70cc76928a957ac1aa))

## [1.55.0](https://github.com/danielo515/obsidian-modal-form/compare/1.54.0...1.55.0) (2024-12-12)


### Features

* **input:** you can define a parent folder on the folder input ([d208648](https://github.com/danielo515/obsidian-modal-form/commit/d208648ba49cb8674b48b0f3f1eca9bfb9aed5ad))


### Bug Fixes

* remove deprecated usages ([96aed30](https://github.com/danielo515/obsidian-modal-form/commit/96aed30449aa0ac7006b34188559a9ec820b4c53))

## [1.54.0](https://github.com/danielo515/obsidian-modal-form/compare/1.53.0...1.54.0) (2024-12-11)


### Features

* **builder:** File input builder ([48b62af](https://github.com/danielo515/obsidian-modal-form/commit/48b62af80cfdb2ca81793c9258a2872367e7144f))
* **input:** file input schema and rendering ([b4682ff](https://github.com/danielo515/obsidian-modal-form/commit/b4682ff73b0bbe9fe038db0fc19eca55f6bcfade))

## [1.53.0](https://github.com/danielo515/obsidian-modal-form/compare/1.52.0...1.53.0) (2024-12-09)


### Features

* **input:** added Image input type ([cfc0cad](https://github.com/danielo515/obsidian-modal-form/commit/cfc0cad039ac2d23f329dafd328d5c46b9f512fc))

## [1.52.0](https://github.com/danielo515/obsidian-modal-form/compare/1.51.0...1.52.0) (2024-09-29)


### Features

* **form-runtime:** markdown block input ([567d391](https://github.com/danielo515/obsidian-modal-form/commit/567d3911ea308291eb4e231adaa11f21e2b7cd78))

## [1.51.0](https://github.com/danielo515/obsidian-modal-form/compare/1.50.0...1.51.0) (2024-09-13)


### Features

* create an example vault ([6c1f7c8](https://github.com/danielo515/obsidian-modal-form/commit/6c1f7c88aac77cb7753e4cd605fd7a869d34e4b2))
* **form-builder:** add ability to hide fields to the UI ([1af3b2d](https://github.com/danielo515/obsidian-modal-form/commit/1af3b2ddda71d5f95b27309382c849300f940123))
* **form-engine:** basic inputs can be hidden ([6b5d17f](https://github.com/danielo515/obsidian-modal-form/commit/6b5d17fb7feaf056dc835bacc9a5ba8ec18e0d53))

## [1.50.0](https://github.com/danielo515/obsidian-modal-form/compare/1.49.0...1.50.0) (2024-07-10)


### Features

* logger instance ([a30a9ff](https://github.com/danielo515/obsidian-modal-form/commit/a30a9ff1d12def22fbbec93eb25f34bfe7987180))


### Bug Fixes

* provide a logger implementation that only shows debug messages on debug ([72faa20](https://github.com/danielo515/obsidian-modal-form/commit/72faa206cd2467c72cb53e77c2251dc2003ba872))

## [1.49.0](https://github.com/danielo515/obsidian-modal-form/compare/1.48.0...1.49.0) (2024-07-05)


### Features

* **runtime:** allow the select to be used as condition for other  fields ([0d23e0b](https://github.com/danielo515/obsidian-modal-form/commit/0d23e0b8b56877f566b753f738f36497b40c5c0d))


### Bug Fixes

* **builder:** properly save the isSet condition ([1ffe488](https://github.com/danielo515/obsidian-modal-form/commit/1ffe48882612cfb03da0427316dbc4daa7caeb86))

## [1.48.0](https://github.com/danielo515/obsidian-modal-form/compare/1.47.0...1.48.0) (2024-07-02)


### Features

* conditional input form builder ([5f6a9be](https://github.com/danielo515/obsidian-modal-form/commit/5f6a9befea605507dc7e4f5eaed42d620da72954))
* **runtime:** conditional fields v1 ([4ab141e](https://github.com/danielo515/obsidian-modal-form/commit/4ab141ec537089f3e9cbd052843e3b45fec9aea6))
* **runtime:** show conditional errors in the form ([83a1060](https://github.com/danielo515/obsidian-modal-form/commit/83a1060aef020133f2723f090c09603a058e010e))


### Bug Fixes

* ConditionInput finally works as expected ([c5d5fff](https://github.com/danielo515/obsidian-modal-form/commit/c5d5fff647b1ae8fb2bcd8a168b97a90b48ff8b1))

## [1.47.0](https://github.com/danielo515/obsidian-modal-form/compare/1.46.0...1.47.0) (2024-06-22)


### Features

* group error messages ([e0e9423](https://github.com/danielo515/obsidian-modal-form/commit/e0e94231b3d6034144934aa71cb14f523e79d349))
* remove completely the old way of rendering fields ([801d331](https://github.com/danielo515/obsidian-modal-form/commit/801d3318efc100c25b35536432f955b98b45652d))
* **runtime:** svelte versions of DocumentBlock and InputNote ([968d230](https://github.com/danielo515/obsidian-modal-form/commit/968d230c3643fb788647171f8c9bfbba282e85cf))


### Bug Fixes

* **runtime:** input tag in svelte ([879aba9](https://github.com/danielo515/obsidian-modal-form/commit/879aba9cf411cc94f235096018bd2d8ebbc0931b))
* **runtime:** svelte wrappers for obsidian settings ([37f5236](https://github.com/danielo515/obsidian-modal-form/commit/37f52364b0282f641c165f199f323465623157d9))

## [1.46.0](https://github.com/danielo515/obsidian-modal-form/compare/1.45.2...1.46.0) (2024-06-17)


### Features

* **util:** insert a form template into current note command ([d60fe82](https://github.com/danielo515/obsidian-modal-form/commit/d60fe825aaee824c3f9f506675e86af2f5ba4e91))


### Bug Fixes

* **templater:** remove empty lines ([eda92a2](https://github.com/danielo515/obsidian-modal-form/commit/eda92a2a62350035ca599fe1bef14749b44b346e))

## [1.45.2](https://github.com/danielo515/obsidian-modal-form/compare/1.45.1...1.45.2) (2024-06-10)


### Bug Fixes

* **runtime:** better weights in file suggestions  ([aac26d1](https://github.com/danielo515/obsidian-modal-form/commit/aac26d13a369869918e4d857a3db832c8025d4a2)), closes [#272](https://github.com/danielo515/obsidian-modal-form/issues/272)

## [1.45.1](https://github.com/danielo515/obsidian-modal-form/compare/1.45.0...1.45.1) (2024-06-04)


### Bug Fixes

* **templater:** flex wrap ([4aed840](https://github.com/danielo515/obsidian-modal-form/commit/4aed8409626f2049805a777aac35a7934028d1c8))

## [1.45.0](https://github.com/danielo515/obsidian-modal-form/compare/1.44.1...1.45.0) (2024-06-04)


### Features

* **templater:** customize result name in template builder ([16a2297](https://github.com/danielo515/obsidian-modal-form/commit/16a2297371e2efc449b838a42dd838e4ed419193))
* **templater:** easily build template body ([b705136](https://github.com/danielo515/obsidian-modal-form/commit/b7051362f34a2d785581e0265b7ef7ebc7b1b3de))

## [1.44.1](https://github.com/danielo515/obsidian-modal-form/compare/1.44.0...1.44.1) (2024-05-31)


### Bug Fixes

* show title in the template builder ([012901d](https://github.com/danielo515/obsidian-modal-form/commit/012901d86a2408429c4ebde0c93e2bdf531f4850))

## [1.44.0](https://github.com/danielo515/obsidian-modal-form/compare/1.43.0...1.44.0) (2024-05-30)


### Features

* more customizations in the generated template ([6db7d29](https://github.com/danielo515/obsidian-modal-form/commit/6db7d2914c099a1e14a670d73f9d5cbe84ed7cd3))


### Bug Fixes

* easy toggle all for fields to include in frontmatter ([8bf4fb4](https://github.com/danielo515/obsidian-modal-form/commit/8bf4fb4a30e9076d91d182e7a4359bba6426c5e3))

## [1.43.0](https://github.com/danielo515/obsidian-modal-form/compare/1.42.1...1.43.0) (2024-05-30)


### Features

* ability to open template builder form UI ([c6663ff](https://github.com/danielo515/obsidian-modal-form/commit/c6663ffc07c00494451b4f7b0b28e7d43efa7781))
* add a view for template builder ([f32ebfb](https://github.com/danielo515/obsidian-modal-form/commit/f32ebfb95d34dca54a34551954c2c3c3fd5e5354))
* copy to clipboard and better format ([e3e3249](https://github.com/danielo515/obsidian-modal-form/commit/e3e324990a1df2ce24c319fb72aac31e605b16a6))
* open TemplateBuilder in a modal ([e376cd0](https://github.com/danielo515/obsidian-modal-form/commit/e376cd0cab476413e321cd4ad620948ec0bcd780))
* **std:** updateFirst for Array ([e6f28e1](https://github.com/danielo515/obsidian-modal-form/commit/e6f28e13441e629d04ab0d9a4807ed420171e419))

## [1.42.1](https://github.com/danielo515/obsidian-modal-form/compare/1.42.0...1.42.1) (2024-05-14)


### Bug Fixes

* set initial value of fixed-source select fields, if provided ([8864226](https://github.com/danielo515/obsidian-modal-form/commit/88642268b78f7f6e01e7716e178d3c20ce2652fe))

## [1.42.0](https://github.com/danielo515/obsidian-modal-form/compare/1.41.0...1.42.0) (2024-05-13)


### Features

* cancel esc button for cancel the form ([ea350bf](https://github.com/danielo515/obsidian-modal-form/commit/ea350bf0db7fc2f9c084cfede229401d9223e57b))


### Bug Fixes

* **formEngine:** gracefully handle the close of the form ([a398882](https://github.com/danielo515/obsidian-modal-form/commit/a398882e13cd1c837718af8d09a83f63c5ec5ca1))

## [1.41.0](https://github.com/danielo515/obsidian-modal-form/compare/1.40.4...1.41.0) (2024-05-10)


### Features

* **input:** dataview input can be fully async ([cac23bb](https://github.com/danielo515/obsidian-modal-form/commit/cac23bb10aeb74b31b060f261948226cff854d63))
* **input:** document block is async ([1e23a1b](https://github.com/danielo515/obsidian-modal-form/commit/1e23a1b3992ccc7e8f54365cea9cd63a1fe7f23c))
* **std:** make the function evaluator async and handle TE ([239a4d5](https://github.com/danielo515/obsidian-modal-form/commit/239a4d5be2d16e4d76baa0ae218fae746ea7649a))
* **suggesters:** DataviewSuggest is now async ([dae4a25](https://github.com/danielo515/obsidian-modal-form/commit/dae4a251664d2e98118222400588dc1a4f7010bc))
* **suggesters:** make SafeDataviewQuery async ([239a4d5](https://github.com/danielo515/obsidian-modal-form/commit/239a4d5be2d16e4d76baa0ae218fae746ea7649a))

## [1.40.4](https://github.com/danielo515/obsidian-modal-form/compare/1.40.3...1.40.4) (2024-04-25)


### Bug Fixes

* make the editor headers stick only on big screens ([4193246](https://github.com/danielo515/obsidian-modal-form/commit/4193246f14b2f7165c58ff2829b9fbf0b550dfe4))

## [1.40.3](https://github.com/danielo515/obsidian-modal-form/compare/1.40.2...1.40.3) (2024-04-20)


### Bug Fixes

* allow decimal inputs for number fields ([b70e99a](https://github.com/danielo515/obsidian-modal-form/commit/b70e99af2164c0a50aae016d23d939618361642e)), closes [#237](https://github.com/danielo515/obsidian-modal-form/issues/237)

## [1.40.2](https://github.com/danielo515/obsidian-modal-form/compare/1.40.1...1.40.2) (2024-01-22)


### Bug Fixes

* support html in the document_block ([1717937](https://github.com/danielo515/obsidian-modal-form/commit/171793791d66e818b166a90d4701632d232218b0))

## [1.40.1](https://github.com/danielo515/obsidian-modal-form/compare/1.40.0...1.40.1) (2024-01-21)


### Bug Fixes

* a bit better import UI ([024b513](https://github.com/danielo515/obsidian-modal-form/commit/024b5131bb1a6814863a28fdb7791a5cb7be3445))
* button to open import modal from form manager ([1cc834e](https://github.com/danielo515/obsidian-modal-form/commit/1cc834e24a64bd05c3a487f03aaf4ad154b0a69f))

## [1.40.0](https://github.com/danielo515/obsidian-modal-form/compare/1.39.1...1.40.0) (2024-01-21)


### Features

* **API:** expose some utils ([eb54365](https://github.com/danielo515/obsidian-modal-form/commit/eb54365e38c6f3313dae09dde42c39d5b4bce5b4))
* import form modal ([a844983](https://github.com/danielo515/obsidian-modal-form/commit/a8449837a850f15cf6c5e9aff0529f8dad24686e))
* **import:** ability to edit forms imported from JSON ([6cdb104](https://github.com/danielo515/obsidian-modal-form/commit/6cdb1041114ac10e1ec5c580ce02b90d6568a745))

## [1.39.1](https://github.com/danielo515/obsidian-modal-form/compare/1.39.0...1.39.1) (2024-01-17)


### Bug Fixes

* tag should allow unknown values ([4dec090](https://github.com/danielo515/obsidian-modal-form/commit/4dec09018f27c637c4f3c59f44f54dc968f15df8))

## [1.39.0](https://github.com/danielo515/obsidian-modal-form/compare/1.38.0...1.39.0) (2024-01-14)


### Features

* multi select notes uses the new notes input (better UI and search) ([6c3e1e5](https://github.com/danielo515/obsidian-modal-form/commit/6c3e1e5b068573826e564d8648f6cf2714f61b1a))

## [1.38.0](https://github.com/danielo515/obsidian-modal-form/compare/1.37.0...1.38.0) (2024-01-13)


### Features

* **core:** enrich_tfile utility function ([1cf4508](https://github.com/danielo515/obsidian-modal-form/commit/1cf4508be2ee6ac52d22a8e7c17fb5728ddafbf0))
* **form:** the input file is now fuzzy over path and tags. It shows a nicer UI that includes the path ([38dc4b3](https://github.com/danielo515/obsidian-modal-form/commit/38dc4b3060b089bc8829bde2f34ff198830a283e))
* **input:** note suggest shows the parent folder of the note ([6409ebf](https://github.com/danielo515/obsidian-modal-form/commit/6409ebf217730f33b223e7e6b03d5f7a70abe8ac))

## [1.37.0](https://github.com/danielo515/obsidian-modal-form/compare/1.36.1...1.37.0) (2024-01-06)


### Features

* command to directly edit a form ([47d4d8c](https://github.com/danielo515/obsidian-modal-form/commit/47d4d8cc6bebb1bf638c4dccf24fe4cc73094c36))

## [1.36.1](https://github.com/danielo515/obsidian-modal-form/compare/1.36.0...1.36.1) (2024-01-06)


### Bug Fixes

* **form-runtime:** show an asterisk when fields are required ([b578ace](https://github.com/danielo515/obsidian-modal-form/commit/b578ace00564c99f2dcbddee81047b98f4f097f9)), closes [#198](https://github.com/danielo515/obsidian-modal-form/issues/198)

## [1.36.0](https://github.com/danielo515/obsidian-modal-form/compare/1.35.0...1.36.0) (2024-01-02)


### Features

* allow any value in multi-select dataview ([fa9da3d](https://github.com/danielo515/obsidian-modal-form/commit/fa9da3d5197a13a14a9ed5be819f1f611736677b)), closes [#54](https://github.com/danielo515/obsidian-modal-form/issues/54)
* multi-select fixed can allow unknown values ([dcefe7c](https://github.com/danielo515/obsidian-modal-form/commit/dcefe7c44c2ea97726c1e779ba47a2c511b54feb))
* tags input allow any value to be selected, even if it does not exist yet ([1834bf5](https://github.com/danielo515/obsidian-modal-form/commit/1834bf5f6cdb4833d8a332abeda721deabfd5bf6))

## [1.35.0](https://github.com/danielo515/obsidian-modal-form/compare/1.34.0...1.35.0) (2024-01-01)


### Features

* option to have a global shortcut to modal form ([d262a0e](https://github.com/danielo515/obsidian-modal-form/commit/d262a0e2bb6a5173611226fe284afeb090ce8695))

## [1.34.0](https://github.com/danielo515/obsidian-modal-form/compare/1.33.0...1.34.0) (2023-12-29)


### Features

* dataview query preview in FormBuilder ([0a5b4cd](https://github.com/danielo515/obsidian-modal-form/commit/0a5b4cd69ec740a25b3d61a85325fb6297c9ed45))
* real time query preview with errors ([41a7dec](https://github.com/danielo515/obsidian-modal-form/commit/41a7dec8d9abccb761d48f878c38e55614002b3a))

## [1.33.0](https://github.com/danielo515/obsidian-modal-form/compare/1.32.1...1.33.0) (2023-12-28)


### Features

* dataview rendering method for FormValue ([86839ce](https://github.com/danielo515/obsidian-modal-form/commit/86839ce89f31def1dac365e175dc30b38d0dcaeb))
* FormResult is now a proxy, so you can access the contained result values safely and directly ([3f4a611](https://github.com/danielo515/obsidian-modal-form/commit/3f4a6113d7d2a1dcaf19cea85546cb8046ff0d27))
* result value helpers for better user experience ([57f2c1b](https://github.com/danielo515/obsidian-modal-form/commit/57f2c1b1ef7b4f6376c5a8b5e15dcdae6ff68626))
* shortcut methods for the ResultValue helper ([00ba405](https://github.com/danielo515/obsidian-modal-form/commit/00ba405744cdb91d31d091f05018244e125bbdb4))

## [1.32.1](https://github.com/danielo515/obsidian-modal-form/compare/1.32.0...1.32.1) (2023-12-22)


### Bug Fixes

* inline help for dataview ([d7e0630](https://github.com/danielo515/obsidian-modal-form/commit/d7e06304aca1c0b9b9a9a7b5540d58289493266b))

## [1.32.0](https://github.com/danielo515/obsidian-modal-form/compare/1.31.0...1.32.0) (2023-12-17)


### Features

* **template:** add support for frontmatter command in templates ([059891c](https://github.com/danielo515/obsidian-modal-form/commit/059891c6ca80040a0e5a47c6d04cdb3bb8a7e220))

## [1.31.0](https://github.com/danielo515/obsidian-modal-form/compare/1.30.1...1.31.0) (2023-12-17)


### Features

* added a get method for result data fixes [#129](https://github.com/danielo515/obsidian-modal-form/issues/129) ([ddee8a8](https://github.com/danielo515/obsidian-modal-form/commit/ddee8a84b255f2193a9267786a80611382bdd046))


### Bug Fixes

* add aliases for Result methods fixes [#122](https://github.com/danielo515/obsidian-modal-form/issues/122) ([d6f755c](https://github.com/danielo515/obsidian-modal-form/commit/d6f755cea44195b3bfb77d1996ededc8356334bc))

## [1.30.1](https://github.com/danielo515/obsidian-modal-form/compare/1.30.0...1.30.1) (2023-12-16)


### Bug Fixes

* creation of unique note name ([b40b2c3](https://github.com/danielo515/obsidian-modal-form/commit/b40b2c355311a3bcb67ddf1c94ce15636cb74b95))
* prevent chalk to be loaded in bundle ([37e4508](https://github.com/danielo515/obsidian-modal-form/commit/37e450895d30863b7f1aac33c071f1f5abd55cc9))

## [1.30.0](https://github.com/danielo515/obsidian-modal-form/compare/1.29.0...1.30.0) (2023-12-15)


### Features

* create new notes from forms using templates ([2a5d1bc](https://github.com/danielo515/obsidian-modal-form/commit/2a5d1bcc26c7577313806865fe1f77d5c4cd5dcb))

## [1.29.0](https://github.com/danielo515/obsidian-modal-form/compare/1.28.0...1.29.0) (2023-12-08)


### Features

* **input:** new input folder suggester ([2102619](https://github.com/danielo515/obsidian-modal-form/commit/2102619376c5e3483815f73bfbd5a78a2f3ed65b)), closes [#148](https://github.com/danielo515/obsidian-modal-form/issues/148)

## [1.28.0](https://github.com/danielo515/obsidian-modal-form/compare/1.27.1...1.28.0) (2023-12-07)


### Features

* **API:** example form takes options ([d204786](https://github.com/danielo515/obsidian-modal-form/commit/d204786fb088924c6fbecb7ec8f2ffefc365267c))
* **core:** throttle error messages ([60157bd](https://github.com/danielo515/obsidian-modal-form/commit/60157bd1a8b63eeaa8fdf7d02fc31d7fe6936af7))
* document how to make more convenient opening forms ([0c70eae](https://github.com/danielo515/obsidian-modal-form/commit/0c70eaeb633ff9e16953819c252d8149428cafdd)), closes [#145](https://github.com/danielo515/obsidian-modal-form/issues/145)
* **form-editor:** UI to set fields as required ([c77c340](https://github.com/danielo515/obsidian-modal-form/commit/c77c34017096368b9ab7f6448bb0576826545b35))
* **form-runtime:** the form is now reactive ([ad82789](https://github.com/danielo515/obsidian-modal-form/commit/ad827897712376c1640ccd7cd0e4648c3d1b6f5c))
* **validation:** better UI for notify errors of form ([2a609ae](https://github.com/danielo515/obsidian-modal-form/commit/2a609ae2b434e9db13b0d3f6909cae98fab380a4))


### Bug Fixes

* add a link to the docs in the settings ([704aa99](https://github.com/danielo515/obsidian-modal-form/commit/704aa99805c1dd36f7e5f16df8d12ec94e3a1022)), closes [#58](https://github.com/danielo515/obsidian-modal-form/issues/58)
* functional form engine ([ab99b0e](https://github.com/danielo515/obsidian-modal-form/commit/ab99b0e1c211ad94683b6bafd19bf58edc946c74))
* **input:** multi-select refocus on enter ([6f8d2ca](https://github.com/danielo515/obsidian-modal-form/commit/6f8d2cadfde5d1df6882e7f12bafd843a697ce94))
* preettier invalid form view in form manager ([b256a1a](https://github.com/danielo515/obsidian-modal-form/commit/b256a1a9d831f935f7c3ea1b191eae49cd567416))

## [1.27.1](https://github.com/danielo515/obsidian-modal-form/compare/1.27.0...1.27.1) (2023-11-23)


### Bug Fixes

* remove leading # in tags ([556b769](https://github.com/danielo515/obsidian-modal-form/commit/556b7699d544ec67f286e01f41104075f7b2f6a8))

## [1.27.0](https://github.com/danielo515/obsidian-modal-form/compare/1.26.0...1.27.0) (2023-11-22)


### Features

* **input:** tag suggest input, initial version ([9f0d8af](https://github.com/danielo515/obsidian-modal-form/commit/9f0d8af170448a2d5593ae47b786316bf7b7a23d)), closes [#118](https://github.com/danielo515/obsidian-modal-form/issues/118)

## [1.26.0](https://github.com/danielo515/obsidian-modal-form/compare/1.25.0...1.26.0) (2023-11-07)


### Features

* ability to add a custom class name to the form body ([28d81b9](https://github.com/danielo515/obsidian-modal-form/commit/28d81b950b3cb91fc85fffad596aa34d78ccd755)), closes [#125](https://github.com/danielo515/obsidian-modal-form/issues/125)

## [1.25.0](https://github.com/danielo515/obsidian-modal-form/compare/1.24.1...1.25.0) (2023-11-06)


### Features

* make the dataview input more fuzzy ([1971fdc](https://github.com/danielo515/obsidian-modal-form/commit/1971fdc096efce969d2f139b8c67279188418326))

## [1.24.1](https://github.com/danielo515/obsidian-modal-form/compare/1.24.0...1.24.1) (2023-11-04)


### Bug Fixes

* **input:** if folder does not exist, the form does not fail ([0d5afbd](https://github.com/danielo515/obsidian-modal-form/commit/0d5afbd399a6635c77534c3fb0e9b2838ee22040)), closes [#90](https://github.com/danielo515/obsidian-modal-form/issues/90)

## [1.24.0](https://github.com/danielo515/obsidian-modal-form/compare/1.23.0...1.24.0) (2023-11-03)


### Features

* **editor:** create dataview inputs ([75f71f1](https://github.com/danielo515/obsidian-modal-form/commit/75f71f1438afeab75dbeef179e41521244896797))
* **inputs:** dataview can be used as source for multi-select ([cd39785](https://github.com/danielo515/obsidian-modal-form/commit/cd39785d68fb78444db1d230f55c71907d218b6a)), closes [#50](https://github.com/danielo515/obsidian-modal-form/issues/50)

## [1.23.0](https://github.com/danielo515/obsidian-modal-form/compare/1.22.1...1.23.0) (2023-11-02)


### Features

* specific field/input error reporting methods ([3bfd22d](https://github.com/danielo515/obsidian-modal-form/commit/3bfd22d7c2da0511ee2fc82859de0a9e2b37f045))


### Bug Fixes

* forms can not be renamed ([ab2e20d](https://github.com/danielo515/obsidian-modal-form/commit/ab2e20d5a6f8b76d3ed4685c2a4fddcb9c3ce261)), closes [#108](https://github.com/danielo515/obsidian-modal-form/issues/108)
* ManageForms view is now reactive thanks to stores ([040f8f5](https://github.com/danielo515/obsidian-modal-form/commit/040f8f504c282876b7798da00db3ddda9f8a1c9f))

## [1.22.1](https://github.com/danielo515/obsidian-modal-form/compare/1.22.0...1.22.1) (2023-10-26)


### Bug Fixes

* big bundle size ([e5f566e](https://github.com/danielo515/obsidian-modal-form/commit/e5f566ea8411be7fa7c06efaddca125b7799ec34))

## [1.22.0](https://github.com/danielo515/obsidian-modal-form/compare/1.21.0...1.22.0) (2023-10-26)


### Features

* allow pick/omit in Result helpers ([1c5bd5f](https://github.com/danielo515/obsidian-modal-form/commit/1c5bd5f09a2525ffcdb9226834730b044a3aee6c)), closes [#101](https://github.com/danielo515/obsidian-modal-form/issues/101)


### Bug Fixes

* add tests for result class and helpers ([e4eea18](https://github.com/danielo515/obsidian-modal-form/commit/e4eea189d168fb80000ca722630334c018f6fd04))
* dataview list format is now correct ([e4eea18](https://github.com/danielo515/obsidian-modal-form/commit/e4eea189d168fb80000ca722630334c018f6fd04))

## [1.21.0](https://github.com/danielo515/obsidian-modal-form/compare/1.20.0...1.21.0) (2023-10-25)


### Features

* detect invalid data on data.json ([91aa99c](https://github.com/danielo515/obsidian-modal-form/commit/91aa99c1c899f2831999318d377b7dee01b642a7)), closes [#98](https://github.com/danielo515/obsidian-modal-form/issues/98)
* migrate between form format versions ([b4e6c96](https://github.com/danielo515/obsidian-modal-form/commit/b4e6c963ad7359ca094b5fc92658e50976bbd18a)), closes [#92](https://github.com/danielo515/obsidian-modal-form/issues/92)


### Bug Fixes

* add version to the form definition ([c7fdd77](https://github.com/danielo515/obsidian-modal-form/commit/c7fdd777f9f1fbce4402a58000ecea1a84d0af52))
* proper duplicate scroll ([28cebd4](https://github.com/danielo515/obsidian-modal-form/commit/28cebd42d0b50d968b4fa2678425d4a378f9dd00))

## [1.20.0](https://github.com/danielo515/obsidian-modal-form/compare/1.19.0...1.20.0) (2023-10-22)


### Features

* Enable Ctrl+Enter form submission ([#60](https://github.com/danielo515/obsidian-modal-form/issues/60)) ([7f72122](https://github.com/danielo515/obsidian-modal-form/commit/7f721222733e93f0c6d600bf55c0a203135e20df))

## [1.19.0](https://github.com/danielo515/obsidian-modal-form/compare/1.18.0...1.19.0) (2023-10-22)


### Features

* Export form as JSON button ([#29](https://github.com/danielo515/obsidian-modal-form/issues/29)) ([defc86c](https://github.com/danielo515/obsidian-modal-form/commit/defc86c654b80ebb071e1eaa8b715f962e41c044))
* scroll to elements on the list ([f9804a7](https://github.com/danielo515/obsidian-modal-form/commit/f9804a7dde5ba46b045f4f4ad41eacb4b6e3fd22))
* scroll to new fields in the editor ([ce3ece5](https://github.com/danielo515/obsidian-modal-form/commit/ce3ece5da6fc42b295eee06d7295891ce20622ba))


### Bug Fixes

* accept empty option values for now ([6293dad](https://github.com/danielo515/obsidian-modal-form/commit/6293dade57e451bc68162d5a07db2664fecbfd1f))
* ensure types in svelte at build ([fbe03d3](https://github.com/danielo515/obsidian-modal-form/commit/fbe03d36bdf70551c73c3ce12150e6cdae2264b9))
* pipelines install ([2c9a17f](https://github.com/danielo515/obsidian-modal-form/commit/2c9a17f62a017f2b190b1abf99cfb1a0e015c4d6))
* type check also svelte files ([903b9bf](https://github.com/danielo515/obsidian-modal-form/commit/903b9bfc680666b1d9d1e71196bdd732504b7083))
* type narrow on svelte ([c46dc40](https://github.com/danielo515/obsidian-modal-form/commit/c46dc400dee5bc2df704d0c95a5577a298f517a8))

## [1.18.0](https://github.com/danielo515/obsidian-modal-form/compare/1.17.0...1.18.0) (2023-10-21)


### Features

* ability to order select options ([#64](https://github.com/danielo515/obsidian-modal-form/issues/64)) ([b955726](https://github.com/danielo515/obsidian-modal-form/commit/b955726bf3d44ea258ed2656ae746af3ab5e710b))

## [1.17.0](https://github.com/danielo515/obsidian-modal-form/compare/1.16.6...1.17.0) (2023-10-20)


### Features

* added tests ([1230a34](https://github.com/danielo515/obsidian-modal-form/commit/1230a3477209141870856a2b7804bec5cc92c9c0))
* show errors when form has any invalid field ([54e9eaf](https://github.com/danielo515/obsidian-modal-form/commit/54e9eaf4a0827958fc7f7e312b928d793e026963))

## [1.16.6](https://github.com/danielo515/obsidian-modal-form/compare/1.16.5...1.16.6) (2023-10-19)


### Bug Fixes

* remove all trace of text input suggest ([68cace2](https://github.com/danielo515/obsidian-modal-form/commit/68cace2135ac38d66027d1f620f34eda700e82df))

## [1.16.5](https://github.com/danielo515/obsidian-modal-form/compare/1.16.4...1.16.5) (2023-10-19)


### Bug Fixes

* separate input builder for select ([e75a1f4](https://github.com/danielo515/obsidian-modal-form/commit/e75a1f43f7e7e674806ae9771d9c9155a8a0e7cc)), closes [#75](https://github.com/danielo515/obsidian-modal-form/issues/75)

## [1.16.4](https://github.com/danielo515/obsidian-modal-form/compare/1.16.3...1.16.4) (2023-10-16)


### Bug Fixes

* do not close existing leafs, reuse instead ([b00b6b8](https://github.com/danielo515/obsidian-modal-form/commit/b00b6b8d407371450bf4ab0f88cf1fd68f36855f)), closes [#36](https://github.com/danielo515/obsidian-modal-form/issues/36)
* open the main view in a new tab ([b00b6b8](https://github.com/danielo515/obsidian-modal-form/commit/b00b6b8d407371450bf4ab0f88cf1fd68f36855f))

## [1.16.3](https://github.com/danielo515/obsidian-modal-form/compare/1.16.2...1.16.3) (2023-10-16)


### Bug Fixes

* text-area initial value ([f21b783](https://github.com/danielo515/obsidian-modal-form/commit/f21b783cfefc9485a8f7748539076bb7d0def2b8))

## [1.16.2](https://github.com/danielo515/obsidian-modal-form/compare/1.16.1...1.16.2) (2023-10-11)


### Bug Fixes

* make multi-select static work ([fa5987a](https://github.com/danielo515/obsidian-modal-form/commit/fa5987a93ae7ef7bc6aea60f6273bbcb6e78fcc1)), closes [#63](https://github.com/danielo515/obsidian-modal-form/issues/63)

## [1.16.1](https://github.com/danielo515/obsidian-modal-form/compare/1.16.0...1.16.1) (2023-10-10)


### Bug Fixes

* ensure order of fixed select ([62b407e](https://github.com/danielo515/obsidian-modal-form/commit/62b407ea50b39c873d3f83e86ff9e502a88a6d22)), closes [#61](https://github.com/danielo515/obsidian-modal-form/issues/61)

## [1.16.0](https://github.com/danielo515/obsidian-modal-form/compare/1.15.0...1.16.0) (2023-10-03)


### Features

* add multi-line text area ([1cf1559](https://github.com/danielo515/obsidian-modal-form/commit/1cf155951b1c38af59abb84cf16e6c852bd87abd)), closes [#46](https://github.com/danielo515/obsidian-modal-form/issues/46)

## [1.15.0](https://github.com/danielo515/obsidian-modal-form/compare/1.14.1...1.15.0) (2023-10-02)


### Features

* default values support for most input types ([f8415a3](https://github.com/danielo515/obsidian-modal-form/commit/f8415a32554f1add8b50e667a7ca9664232ee2e1))


### Bug Fixes

* do not use innerHTML ([8ae7d5b](https://github.com/danielo515/obsidian-modal-form/commit/8ae7d5be014840ddb8e19619097af7ad1d9bccc2))

## [1.14.1](https://github.com/danielo515/obsidian-modal-form/compare/1.14.0...1.14.1) (2023-09-29)


### Bug Fixes

* properly clone elements ([667ebe0](https://github.com/danielo515/obsidian-modal-form/commit/667ebe0d94526803dbad6d62069c36757355dbe5)), closes [#51](https://github.com/danielo515/obsidian-modal-form/issues/51)
* set a default value for inputs of type select ([2c514b1](https://github.com/danielo515/obsidian-modal-form/commit/2c514b1095edf37e37151ca89f2ea10b440db446)), closes [#45](https://github.com/danielo515/obsidian-modal-form/issues/45)

## [1.14.0](https://github.com/danielo515/obsidian-modal-form/compare/1.13.0...1.14.0) (2023-09-15)


### Features

* show result preview ([7425df1](https://github.com/danielo515/obsidian-modal-form/commit/7425df13425c5e957dc9a9f1cc2a8f2bcb1d1c5f))


### Bug Fixes

* filtering in multi with uppercase ([fac67ea](https://github.com/danielo515/obsidian-modal-form/commit/fac67ea1199b2db9d27e4df0010e959e939927ab))
* multi select was not including the values ([1885834](https://github.com/danielo515/obsidian-modal-form/commit/1885834ded85f09deac185e2a3b2d91502585504))

## [1.13.0](https://github.com/danielo515/obsidian-modal-form/compare/1.12.1...1.13.0) (2023-09-15)


### Features

* limitedForm api ([b0acb29](https://github.com/danielo515/obsidian-modal-form/commit/b0acb29e85dc806bbf3ff04391c42c220bfcb178)), closes [#39](https://github.com/danielo515/obsidian-modal-form/issues/39)

## [1.12.1](https://github.com/danielo515/obsidian-modal-form/compare/1.12.0...1.12.1) (2023-09-15)


### Bug Fixes

* make sure the editor always has the right height ([53f10b3](https://github.com/danielo515/obsidian-modal-form/commit/53f10b3a2451efd347855e486f46aa64eaaeeec3)), closes [#38](https://github.com/danielo515/obsidian-modal-form/issues/38)

## [1.12.0](https://github.com/danielo515/obsidian-modal-form/compare/1.11.0...1.12.0) (2023-09-15)


### Features

* multi select UI builder ([3eff7a8](https://github.com/danielo515/obsidian-modal-form/commit/3eff7a89c7177faa47940c16d04f97f5d72a3a21))
* multi-select v1 ([e3ee492](https://github.com/danielo515/obsidian-modal-form/commit/e3ee49281f39ed6708cdd48f8bba527e74d5584b))


### Bug Fixes

* proper colors for save and close ([4c6d495](https://github.com/danielo515/obsidian-modal-form/commit/4c6d495a8b0e550b9f117e5d340885a8052f55c9))
* toggles always have a value ([72cfc3e](https://github.com/danielo515/obsidian-modal-form/commit/72cfc3e65624a31d4a200301465aa9044e908357))

## [1.11.0](https://github.com/danielo515/obsidian-modal-form/compare/1.10.0...1.11.0) (2023-09-14)


### Features

* preview form from the editor ([2d8e2d6](https://github.com/danielo515/obsidian-modal-form/commit/2d8e2d6aec99f27a30e86ffc49312a2876e5195e)), closes [#17](https://github.com/danielo515/obsidian-modal-form/issues/17)

## [1.10.0](https://github.com/danielo515/obsidian-modal-form/compare/1.9.1...1.10.0) (2023-09-14)


### Features

* show better errors ([8202d37](https://github.com/danielo515/obsidian-modal-form/commit/8202d378cac76f6a3f49058c78e9988daa5432e6))


### Bug Fixes

* dataview input was not filtering ([8202d37](https://github.com/danielo515/obsidian-modal-form/commit/8202d378cac76f6a3f49058c78e9988daa5432e6))

## [1.9.1](https://github.com/danielo515/obsidian-modal-form/compare/1.9.0...1.9.1) (2023-09-14)


### Bug Fixes

* release process ([790d84d](https://github.com/danielo515/obsidian-modal-form/commit/790d84d83200243b01ca6080575e3aabda663ff5))

## [1.9.0](https://github.com/danielo515/obsidian-modal-form/compare/obsidian-modal-form-1.8.0...obsidian-modal-form-1.9.0) (2023-09-14)


### Features

* keep the form header always visible ([216d9b4](https://github.com/danielo515/obsidian-modal-form/commit/216d9b40a9ebfcc4ca208a5d0ba326cd73c755d5)), closes [#11](https://github.com/danielo515/obsidian-modal-form/issues/11)


### Bug Fixes

* release-bot ([0586068](https://github.com/danielo515/obsidian-modal-form/commit/0586068e6b69a3659fd27377510b0de3eeba6387))

## [1.8.0](https://github.com/danielo515/obsidian-modal-form/compare/obsidian-modal-form-1.7.1...obsidian-modal-form-1.8.0) (2023-09-13)


### Features

* dataview input type ([22b8949](https://github.com/danielo515/obsidian-modal-form/commit/22b8949bbde2deeb417c89921ec4531b03af4ed2))

## [1.7.1](https://github.com/danielo515/obsidian-modal-form/compare/obsidian-modal-form-1.7.0...obsidian-modal-form-1.7.1) (2023-09-13)


### Bug Fixes

* remove deprecated usages of app ([343ff57](https://github.com/danielo515/obsidian-modal-form/commit/343ff573ae7ed4710b3f3290bf752dee84e7aaae))

## [1.7.0](https://github.com/danielo515/obsidian-modal-form/compare/obsidian-modal-form-v1.6.0...obsidian-modal-form-1.7.0) (2023-09-12)


### Features

* duplicate form ([7a0f1c6](https://github.com/danielo515/obsidian-modal-form/commit/7a0f1c6000d309c447fc4cb7e345dbf0f435944e)), closes [#20](https://github.com/danielo515/obsidian-modal-form/issues/20)


### Bug Fixes

* fix the versioning, I hope ([7bb7d7d](https://github.com/danielo515/obsidian-modal-form/commit/7bb7d7da9b58c1a7055d3178b4528f346ea62edd))

## [1.6.0](https://github.com/danielo515/obsidian-modal-form/compare/1.5.0...1.6.0) (2023-09-12)


### Features

* allow to duplicate fields ([21777e9](https://github.com/danielo515/obsidian-modal-form/commit/21777e98252c6f0d403ea6223a007eb5c8ba1866)), closes [#20](https://github.com/danielo515/obsidian-modal-form/issues/20)

## [1.5.0](https://github.com/danielo515/obsidian-modal-form/compare/1.4.0...1.5.0) (2023-09-12)


### Features

* ability to cancel edits to a form ([f90d7f0](https://github.com/danielo515/obsidian-modal-form/commit/f90d7f0344b6af0beba6f004e33719948dc6a36f)), closes [#8](https://github.com/danielo515/obsidian-modal-form/issues/8)

## [1.4.0](https://github.com/danielo515/obsidian-modal-form/compare/1.3.0...1.4.0) (2023-09-11)


### Features

* decide where to open the forms editor/manager ([bd5a957](https://github.com/danielo515/obsidian-modal-form/commit/bd5a957b7664eefd5df188b6424c046cfd0efd73))


### Bug Fixes

* make field name required ([2892503](https://github.com/danielo515/obsidian-modal-form/commit/2892503b0beb4588833ac46cd2a32ad567140d88))

## [1.3.0](https://github.com/danielo515/obsidian-modal-form/compare/1.2.2...1.3.0) (2023-09-11)


### Features

* ability to order fields ([79517c0](https://github.com/danielo515/obsidian-modal-form/commit/79517c03a9bceab06e9239e99ca8a3e100273f1d))

## [1.2.2](https://github.com/danielo515/obsidian-modal-form/compare/1.2.1...1.2.2) (2023-09-11)


### Bug Fixes

* rename the plugin to follow obsidian guidelines ([2487590](https://github.com/danielo515/obsidian-modal-form/commit/24875901eb01321d8d92ed2efffc70e661907b20))

## [1.2.1](https://github.com/danielo515/obsidian-modal-form/compare/v1.2.0...1.2.1) (2023-09-11)


### Bug Fixes

* do not include v in tag ([7a54a24](https://github.com/danielo515/obsidian-modal-form/commit/7a54a246aa6b7262dc63130deed49ac0387226a3))

## [1.2.0](https://github.com/danielo515/obsidian-modal-form/compare/v1.1.0...v1.2.0) (2023-09-11)


### Features

* complete core decoding and validation ([7fc538c](https://github.com/danielo515/obsidian-modal-form/commit/7fc538ca28d4b6b4114640f298a093d5639c4326))
* FormEditor V1 ([ce228ef](https://github.com/danielo515/obsidian-modal-form/commit/ce228efb38cb18985e61923b67f5f25fd5b74c4e))
* manage forms view ([bb99d2d](https://github.com/danielo515/obsidian-modal-form/commit/bb99d2d6df9dd7867f7f4d504a4ca25fa1597c3d))
* mobile handling of the form editor ([1be84bd](https://github.com/danielo515/obsidian-modal-form/commit/1be84bd71ce04565ac08cec6a82b398b004447ff))
* suggest folder input ([3adaf07](https://github.com/danielo515/obsidian-modal-form/commit/3adaf0774858ef34a0e2b3eb26657ee45bd119cd))


### Bug Fixes

* delete forms ([70c6a77](https://github.com/danielo515/obsidian-modal-form/commit/70c6a77629953f63243bc2b1e8a0504fb54c1f74))
* icons ([fca57dd](https://github.com/danielo515/obsidian-modal-form/commit/fca57dd872fd80c2f92cdbad2f67a5249a4be8dd))

## [1.1.0](https://github.com/danielo515/obsidian-modal-form/compare/v1.0.0...v1.1.0) (2023-09-07)


### Features

* asString using template ([5041673](https://github.com/danielo515/obsidian-modal-form/commit/504167364200554593722341d09ffd7ad97db552))
* real API v1 ([1a8da2f](https://github.com/danielo515/obsidian-modal-form/commit/1a8da2f2aded99e80347609304a91a6d35a1ed11))
* slider ([bb9c0b5](https://github.com/danielo515/obsidian-modal-form/commit/bb9c0b58d5d0afa54c92294b741dd06040aa4c09))

## 1.0.0 (2023-09-06)


### Features

* add support for all the basic fields ([991c53e](https://github.com/danielo515/obsidian-modal-form/commit/991c53e881a473200c035ad7eec590378cdaf81a))
* dataview serialization ([9b38402](https://github.com/danielo515/obsidian-modal-form/commit/9b384021b06dfb4d1ab0625353367b724c4ac004))
* form result ([2f63a90](https://github.com/danielo515/obsidian-modal-form/commit/2f63a90e27a08b3b539b67a5fbc78119a13ba5ba))
* initial prototype ([ae1404a](https://github.com/danielo515/obsidian-modal-form/commit/ae1404a9f3a87703ea8219e7acb36e7f11730f39))
* note input with autocomplete and narrowed to specific folder ([89bce4c](https://github.com/danielo515/obsidian-modal-form/commit/89bce4c956b2c5473862acf5ddfe59f8966a955e))
* select input for notes narrowed to specific folder ([89bce4c](https://github.com/danielo515/obsidian-modal-form/commit/89bce4c956b2c5473862acf5ddfe59f8966a955e))
* select input with fixed number of elements ([89bce4c](https://github.com/danielo515/obsidian-modal-form/commit/89bce4c956b2c5473862acf5ddfe59f8966a955e))
* support numbers and text ([5b27caf](https://github.com/danielo515/obsidian-modal-form/commit/5b27cafbc19d9edb0d42ff74cefcb976eecb3a89))
