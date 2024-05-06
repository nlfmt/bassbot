import z from "zod"
import { initEnv } from "@/util/init-env"

const envSchema = z.object({
  TOKEN: z.string().min(1),
  CLIENT_ID: z.string().min(1),
  W2G_KEY: z.string().min(1),
  SPOTIFY_CLIENT_ID: z.string().min(1),
  SPOTIFY_SECRET: z.string().min(1),
})

export default initEnv(envSchema)
