import { createCommand, buildOptions } from "@/util/command"

export default createCommand({
  description: "",
  options: buildOptions().build(),

  run: async ({ i, options, reply }) => {
  
  }
})
