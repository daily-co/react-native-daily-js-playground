// Type definitions for daily-js 0.0.987
// Project: https://github.com/daily-co/daily-js
// Definitions by: Paul Kompfner <https://github.com/kompfner>

// TODO: see below.
// Declares that global variable `DailyIframe` is provided outside a module loader environment.
// export as namespace DailyIframe;

// TODO: when this file is moved into @types/daily-js, we can get rid of this module declaration,
// and uncomment the global variable declaration, since "@daily-co/daily-js" will no longer
// be an "ambient" module.
// See https://www.typescriptlang.org/docs/handbook/modules.html#ambient-modules.
declare module "@daily-co/daily-js" {
  // Declares that the class DailyIframe is the thing exported from the module.
  export = DailyIframe;

  // TODO; when this is no longer an ambient module, add "declare" in front.
  // Declares class methods and properties.
  class DailyIframe {
    static createCallObject(properties: any): DailyIframe;
  }

  // TODO; when this is no longer an ambient module, add "declare" in front.
  // Declares other types under the `DailyIframe` namespace.
  namespace DailyIframe {}
}
