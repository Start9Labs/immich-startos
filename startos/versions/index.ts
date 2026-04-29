import { VersionGraph } from '@start9labs/start-sdk'
import { v_2_7_5_1 } from './v2.7.5.1'
import { v_2_7_5_2 } from './v2.7.5.2'

export const versionGraph = VersionGraph.of({
  current: v_2_7_5_2,
  other: [v_2_7_5_1],
})
