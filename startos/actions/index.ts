import { sdk } from '../sdk'
import { resetAdminPassword } from './resetAdminPassword'
import { connectSources } from './connectSources'
import { externalLibraries } from './externalLibraries'
import { configureSmtp } from './configureSmtp'
import { listUsers } from './listUsers'
import { createApiKey } from './createApiKey'
import { deleteApiKey } from './deleteApiKey'
import { primaryUrl } from '../primaryUrl'

export const actions = sdk.Actions.of()
  .addAction(resetAdminPassword)
  .addAction(connectSources)
  .addAction(externalLibraries)
  .addAction(configureSmtp)
  .addAction(listUsers)
  .addAction(createApiKey)
  .addAction(deleteApiKey)
  .addAction(primaryUrl.action)
