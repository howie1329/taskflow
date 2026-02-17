import { ValyuWebSearch } from "./webSearch";
import { ValyuFinanceSearch } from "./financeSearch";

// used to export the full tools
export const ValyuTools = {
    valyuWebSearch: ValyuWebSearch,
    valyuFinanceSearch: ValyuFinanceSearch,
}

// used to export the keys of the tools
export const ValyuToolsKeys = Object.keys(ValyuTools)