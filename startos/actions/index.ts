import { sdk } from '../sdk'
import { resetAdminPassword } from './resetAdminPassword'
import { externalLibraries } from './externalLibraries'
import { configureSmtp } from './configureSmtp'
import { setPrimaryUrl } from './setPrimaryUrl'

export const actions = sdk.Actions.of()
  .addAction(resetAdminPassword)
  .addAction(externalLibraries)
  .addAction(configureSmtp)
  .addAction(setPrimaryUrl)
