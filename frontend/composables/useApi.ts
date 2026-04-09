import { edenTreaty } from "@elysiajs/eden";
import type { App } from "../../backend/src/index";

export const useApi = () => {
  const config = useRuntimeConfig();
  const api = edenTreaty<App>(config.public.apiBase as string);
  return api;
};
