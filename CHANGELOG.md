# Changelog

## [0.6.0](https://www.github.com/zakodium/adonis-mongodb/compare/v0.5.0...v0.6.0) (2021-03-23)


### Bug Fixes

* add toJSON method type ([#56](https://www.github.com/zakodium/adonis-mongodb/issues/56)) ([a570ac0](https://www.github.com/zakodium/adonis-mongodb/commit/a570ac00eefa9a35c46d1e74b719cd331cd5d0b5))
* update dependencies ([f52991e](https://www.github.com/zakodium/adonis-mongodb/commit/f52991edd2597e38d2e6c59b5fd4015fd856b00b))

## [0.5.0](https://www.github.com/zakodium/adonis-mongodb/compare/v0.4.1...v0.5.0) (2021-03-15)


### Features

* add a toJSON method on Models ([#54](https://www.github.com/zakodium/adonis-mongodb/issues/54)) ([1f0c199](https://www.github.com/zakodium/adonis-mongodb/commit/1f0c199cc3ba89b61b81b1f3af58fa3acefd9c9c))

### [0.4.1](https://www.github.com/zakodium/adonis-mongodb/compare/v0.4.0...v0.4.1) (2021-03-04)


### Bug Fixes

* do not put templates in subdirectories ([a7e2a34](https://www.github.com/zakodium/adonis-mongodb/commit/a7e2a34dd968ffb1bf72db27225b25f1535a9070))

## [0.4.0](https://www.github.com/zakodium/adonis-mongodb/compare/v0.3.6...v0.4.0) (2021-02-23)


### Features

* add authentication provider using model ([8fb56a7](https://www.github.com/zakodium/adonis-mongodb/commit/8fb56a7d0284f044d02341125565d336289047c7))


### Bug Fixes

* abort migration transaction in case of error ([#47](https://www.github.com/zakodium/adonis-mongodb/issues/47)) ([8a46ef1](https://www.github.com/zakodium/adonis-mongodb/commit/8a46ef14c62edbae9d2c7acacb538ca2f4dee0b8))
* correctly handle already running migrations in migrate command ([b6efc7c](https://www.github.com/zakodium/adonis-mongodb/commit/b6efc7ca0d092c144a571882b6593ebf7b6241b2))

### [0.3.6](https://www.github.com/zakodium/adonis-mongodb/compare/v0.3.5...v0.3.6) (2021-01-08)


### Bug Fixes

* remove peer dependency on adonis core ([fa35ba6](https://www.github.com/zakodium/adonis-mongodb/commit/fa35ba6a7149474d3a63df6abbf0b568565ce91b))

### [0.3.5](https://www.github.com/zakodium/adonis-mongodb/compare/v0.3.4...v0.3.5) (2020-11-02)


### Bug Fixes

* fix types ([#37](https://www.github.com/zakodium/adonis-mongodb/issues/37)) ([d66ff32](https://www.github.com/zakodium/adonis-mongodb/commit/d66ff3237b18b5cdaa81ceba3272520bdc0cbd75)), closes [#5](https://www.github.com/zakodium/adonis-mongodb/issues/5)

### [0.3.4](https://www.github.com/zakodium/adonis-mongodb/compare/v0.3.3...v0.3.4) (2020-10-14)


### Bug Fixes

* in-memory typescript keeps migrations as TS files ([#36](https://www.github.com/zakodium/adonis-mongodb/issues/36)) ([7f4fd20](https://www.github.com/zakodium/adonis-mongodb/commit/7f4fd20e4df965ed3eab9407065506ef9721c638))
* rename handle with run ([#34](https://www.github.com/zakodium/adonis-mongodb/issues/34)) ([70c1b53](https://www.github.com/zakodium/adonis-mongodb/commit/70c1b53428f4902ca61036c14dcaf3f21db5f665))

### [0.3.3](https://www.github.com/zakodium/adonis-mongodb/compare/v0.3.2...v0.3.3) (2020-10-14)


### Bug Fixes

* **migration:** correctly extract name from migrations and check for dups ([7c6dec1](https://www.github.com/zakodium/adonis-mongodb/commit/7c6dec1942c0f22096ad603b63f39451dc13ae5b))

### [0.3.2](https://github.com/zakodium/adonis-mongodb/compare/v0.3.1...v0.3.2) (2020-10-12)


### Bug Fixes

* allow custom IDs ([#26](https://github.com/zakodium/adonis-mongodb/issues/26)) ([7cd80c9](https://github.com/zakodium/adonis-mongodb/commit/7cd80c98a43866be4d97e00a32c7fe22851647e5))
* fix merge and fill method typings ([#28](https://github.com/zakodium/adonis-mongodb/issues/28)) ([97cf4db](https://github.com/zakodium/adonis-mongodb/commit/97cf4dbd3783590ac004929aca81d5677dc2cd6f))

## [0.3.1](https://github.com/zakodium/adonis-mongodb/compare/v0.3.0...v0.3.1) (2020-10-07)


### Features

* add merge and fill methods ([#23](https://github.com/zakodium/adonis-mongodb/issues/23)) ([0b9d3ef](https://github.com/zakodium/adonis-mongodb/commit/0b9d3ef80111b28010efaf24708415329fa4194b))
* support instantiating models before saving ([#17](https://github.com/zakodium/adonis-mongodb/issues/17)) ([25d194a](https://github.com/zakodium/adonis-mongodb/commit/25d194a26b7d19c1e498b46c79b6172bcb5e58f2))



# [0.3.0](https://github.com/zakodium/adonis-mongodb/compare/v0.2.2...v0.3.0) (2020-09-29)


### Features

* migrations paths can be configured in the config file ([#8](https://github.com/zakodium/adonis-mongodb/issues/8)) ([fb8934d](https://github.com/zakodium/adonis-mongodb/commit/fb8934d3a6e1ac7a334bcf244c5b3ed0ef1c9dd6))
* pass session on object instantiation ([#16](https://github.com/zakodium/adonis-mongodb/issues/16)) ([1395ba0](https://github.com/zakodium/adonis-mongodb/commit/1395ba0ac095a36818f84557afe7fce17c6caf25))



## [0.2.2](https://github.com/zakodium/adonis-mongodb/compare/v0.2.1...v0.2.2) (2020-09-09)


### Bug Fixes

* correct incremental id in AutoIncrementModel ([8a20201](https://github.com/zakodium/adonis-mongodb/commit/8a20201c1d86618c2f068304c2b109b5a86a33d6))
* do not create a config subfolder ([#4](https://github.com/zakodium/adonis-mongodb/issues/4)) ([a86e79b](https://github.com/zakodium/adonis-mongodb/commit/a86e79b4df34b97084e23204423d012e393432d0))
* show accurate information in status command ([6580db9](https://github.com/zakodium/adonis-mongodb/commit/6580db92bfa7a4c752cf39c2c084ad2d8b67b500))



## [0.2.1](https://github.com/zakodium/adonis-mongodb/compare/v0.2.0...v0.2.1) (2020-09-02)



# [0.2.0](https://github.com/zakodium/adonis-mongodb/compare/v0.1.7...v0.2.0) (2020-09-02)


### Bug Fixes

* correct migration batch number ([66af888](https://github.com/zakodium/adonis-mongodb/commit/66af8882011ec0b14e7567d66231ab14f4b7f50e))
* don't log description twice ([923048f](https://github.com/zakodium/adonis-mongodb/commit/923048f0963d1dc5f80c1dc9cca7760331a6bcea))
* only use transaction when creating indexes if collection does not exist ([94fa3fb](https://github.com/zakodium/adonis-mongodb/commit/94fa3fb7b69cf079f372f51813a5dbaf08b0bde0))
* use original type on id getter ([78317c1](https://github.com/zakodium/adonis-mongodb/commit/78317c12ea25c624e85b7deb094966c1e2f852c7))


### Features

* add command show migration status ([0ef66d2](https://github.com/zakodium/adonis-mongodb/commit/0ef66d2a31e5c9782f80383dd48ec72276b4eac1))
* add defer method to migration module ([ff7c60a](https://github.com/zakodium/adonis-mongodb/commit/ff7c60a89d0c92cedaba4c4e918fcfab6ee3e0a6))
* add incremental model ([e7574f6](https://github.com/zakodium/adonis-mongodb/commit/e7574f6bcd2b3840f1cd3c8f6d195d3ccd781e64))
* allow to add description to migration ([7c075e7](https://github.com/zakodium/adonis-mongodb/commit/7c075e77dde28a2c3337b27e7abbc7833a6af793))
* execute all pending migrations in one transaction ([1581854](https://github.com/zakodium/adonis-mongodb/commit/1581854a4b95dd285d6f3ac86002cf293511b2da))


* rename migrate command ([c6ce51b](https://github.com/zakodium/adonis-mongodb/commit/c6ce51bb281b408d3a6afde4ae2245ad96f6c5b9))


### BREAKING CHANGES

* do not convert to string in id getter
* Model is no longer a default export but a named export
* renamed the migrate command to match how lucid names migration commands



## [0.1.7](https://github.com/zakodium/adonis-mongodb/compare/v0.1.6...v0.1.7) (2020-04-14)



## [0.1.6](https://github.com/zakodium/adonis-mongodb/compare/v0.1.5...v0.1.6) (2020-01-13)


### Bug Fixes

* skip lib checks ([7fd8507](https://github.com/zakodium/adonis-mongodb/commit/7fd8507c85c45c2c2bdbe1e6ac9be5b0114dc233))
* **commands:** inject db in handle method ([303fdf1](https://github.com/zakodium/adonis-mongodb/commit/303fdf17b6381050859380ba473ebfab49903528))



## [0.1.5](https://github.com/zakodium/adonis-mongodb/compare/v0.1.4...v0.1.5) (2019-12-06)


### Bug Fixes

* actually execute the up() method ([3d8740f](https://github.com/zakodium/adonis-mongodb/commit/3d8740f4c380086818c5fe888d2bbeb1f01d4e8a))



## [0.1.4](https://github.com/zakodium/adonis-mongodb/compare/v0.1.3...v0.1.4) (2019-12-03)


### Bug Fixes

* enable emitDecoratorMetadata ([407554e](https://github.com/zakodium/adonis-mongodb/commit/407554e579197b52f16621ddd062668840407f07))



## [0.1.3](https://github.com/zakodium/adonis-mongodb/compare/v0.1.2...v0.1.3) (2019-12-03)


### Bug Fixes

* transpile optional properties ([d22d8d1](https://github.com/zakodium/adonis-mongodb/commit/d22d8d15981a33eb9c0928574e7f0c36e18a9c6b))



## [0.1.2](https://github.com/zakodium/adonis-mongodb/compare/v0.1.1...v0.1.2) (2019-12-03)


### Bug Fixes

* really correctly read templates ([ad4c812](https://github.com/zakodium/adonis-mongodb/commit/ad4c81217b8b51196aa8da72f11f35e7a0d02f02))



## [0.1.1](https://github.com/zakodium/adonis-mongodb/compare/v0.1.0...v0.1.1) (2019-12-03)


### Bug Fixes

* correctly refer to template directory ([dab86ad](https://github.com/zakodium/adonis-mongodb/commit/dab86ad199d5a7c9b9dc825035dad2875410b0d7))



# 0.1.0 (2019-12-03)


### Bug Fixes

* rename types from .d.ts to .ts ([4a0cd71](https://github.com/zakodium/adonis-mongodb/commit/4a0cd7179e52fb49c28a49e9ac8781afc0f7335e))


### Features

* initial library ([6c917cf](https://github.com/zakodium/adonis-mongodb/commit/6c917cf8bb76c01ba02ed90036c293f0667f6d81))
