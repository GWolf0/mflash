import z from "zod";
import { DOE, JSONType } from "./common";

// form
export type FormOptionType = {label: string, value: string | number};
export type FormItemType = "text" | "text-lg" | "checkbox" | "number" | "options" | "custom";

export interface FormItem {
    name: string,
    type: FormItemType,
    inputProps?: JSONType,
    meta?: {
        options?: FormOptionType[],
        customElement?: React.ReactNode,
    }
}

export interface FormDef {
    id: string,
    title?: string,
    items: FormItem[],
    validations?: z.ZodObject,
    onJson: (json: JSONType) => Promise<DOE>,
    data?: JSONType,
    options?: {
        submitLabel?: string,
        showReset?: boolean,
    }
}