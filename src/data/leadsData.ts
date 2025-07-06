
import { Lead } from "@/types/crm";
import { generateSampleLeads } from "./leadsSampleData";

export const getSharedLeads = (): Lead[] => {
  return generateSampleLeads();
};
