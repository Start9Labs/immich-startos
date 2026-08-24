import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_3_1_0_1 } from './v3.1.0_1'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_3_1_0_1],
})
