import PocketBase from "pocketbase";
import { config } from "../../config/env.ts";

export const createPocketBaseClient = () => new PocketBase(config.POCKETBASE_URL);

export const getPocketBaseClient = () => createPocketBaseClient();
