## [Unreleased]

## [1.1.4] - 2024-03-30
### Updated
- Updated peer dependencies

## [1.1.3] - 2022-05-21
### Fixed
- Dependabot alerts
- Fixed issue where a missing `stopPropagation` caused secondary forms to submit, not just the one in the dialog.
- Fixed an issue where a setState was getting called on an unmounted component.

## [1.1.2] - 2021-03-06
- Removed sourcemaps from build

## [1.1.1] - 2021-03-01
- Refactored to _not_ be based on `create-react-app`. Still relies on webpack dev server for testing and demo app. Change made to preserve component names in build, so they show nicely in the react debug tree for the containing app. _Should_ be fully backward compatible.

## [1.1.0] - 2021-02-19
- Add option prevent the usage of the HTML5 dialog and force the usage of the polyfill

## [1.0.2] - 2021-02-17
- Added context to export

## [1.0.1] - 2021-01-27
- Moved dialog-polyfill to a ref callback to avoid SSR issues where no `window` is defined

## [1.0.0] - 2021-01-26
- Initial public release