import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { primaryUrl } from '../primaryUrl'
import { sdk } from '../sdk'

// An unset primary URL takes the preferred address without asking; only a
// chosen URL that has gone away raises the critical task.
export const seedPrimaryUrl = sdk.setupOnInit(async (effects) => {
  if (await storeJson.read((s) => s.primaryUrl).const(effects)) return
  const url = await primaryUrl.bestUsable(effects).const()
  if (url) {
    await storeJson.merge(
      effects,
      { primaryUrl: url },
      { allowWriteAfterConst: true },
    )
  }
})

export const primaryUrlTask = primaryUrl.setupTask('critical', {
  reason: i18n('Primary URL removed. Select a new primary URL.'),
})
