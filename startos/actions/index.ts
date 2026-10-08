import { sdk } from '../sdk'
import { resetAdminPassword } from './resetAdminPassword'
import { connectSources } from './connectSources'
import { externalLibraries } from './externalLibraries'
import { configureSmtp } from './configureSmtp'
import { primaryUrl } from '../primaryUrl'

export const actions = sdk.Actions.of()
  .addAction(resetAdminPassword)
  .addAction(connectSources)
  .addAction(externalLibraries)
  .addAction(configureSmtp)
  .addAction(primaryUrl.action)
