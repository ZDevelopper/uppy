/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-empty-function */

/**
 * Core plugin logic that all plugins share.
 *
 * BasePlugin does not contain DOM rendering so it can be used for plugins
 * without a user interface.
 *
 * See `Plugin` for the extended version with Preact rendering for interfaces.
 */

import Translator from '@uppy/utils/lib/Translator'
import type { I18n, Locale } from '@uppy/utils/lib/Translator'
import type { Body, Meta } from '@uppy/utils/lib/UppyFile'
import type { State, Uppy } from './Uppy'

export type PluginOpts = {
  locale?: Locale
  id?: string
  [key: string]: unknown
}

export default class BasePlugin<
  Opts extends PluginOpts,
  M extends Meta,
  B extends Body,
> {
  uppy: Uppy<M, B>

  opts: Opts

  id: string

  defaultLocale: Locale

  i18n: I18n

  i18nArray: Translator['translateArray']

  type: string

  VERSION: string

  constructor(uppy: Uppy<M, B>, opts: Opts) {
    this.uppy = uppy
    this.opts = opts ?? {}
  }

  getPluginState(): Record<string, unknown> {
    const { plugins } = this.uppy.getState()
    return plugins?.[this.id] || {}
  }

  setPluginState(update: unknown): void {
    if (!update) return
    const { plugins } = this.uppy.getState()

    this.uppy.setState({
      plugins: {
        ...plugins,
        [this.id]: {
          ...plugins[this.id],
          ...update,
        },
      },
    })
  }

  setOptions(newOpts: Partial<Opts>): void {
    this.opts = { ...this.opts, ...newOpts }
    this.setPluginState(undefined) // so that UI re-renders with new options
    this.i18nInit()
  }

  i18nInit(): void {
    const translator = new Translator([
      this.defaultLocale,
      this.uppy.locale,
      this.opts.locale,
    ])
    this.i18n = translator.translate.bind(translator)
    this.i18nArray = translator.translateArray.bind(translator)
    this.setPluginState(undefined) // so that UI re-renders and we see the updated locale
  }

  /**
   * Extendable methods
   * ==================
   * These methods are here to serve as an overview of the extendable methods as well as
   * making them not conditional in use, such as `if (this.afterUpdate)`.
   */

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addTarget(plugin: unknown): HTMLElement {
    throw new Error(
      "Extend the addTarget method to add your plugin to another plugin's target",
    )
  }

  install(): void {}

  uninstall(): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(state: Partial<State<M, B>>): void {}

  // Called after every state update, after everything's mounted. Debounced.
  afterUpdate(): void {}
}
