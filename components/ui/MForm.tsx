"use client"

import { DOE, ErrorType, JSONType } from '@/types/common'
import { FormDef, FormItem } from '@/types/ui'
import React, { useState } from 'react'
import { Input } from './input'
import { Textarea } from './textarea';
import { Label } from './label';
import { strFormName } from '@/helpers/formatingHelper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Button } from './button'
import { formatZodError } from '@/helpers/validationsHelper'
import ErrorComp from './ErrorComp'
import { Checkbox } from './checkbox'

function MForm({formDef}: {
    formDef: FormDef,
}) {
    const [loading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<ErrorType>();

    // render form item
    function renderFormItem(item: FormItem, data?: JSONType): React.ReactNode {
        switch(item.type) {
            case "text": return (
                <Input placeholder={strFormName(item.name)} name={item.name} defaultValue={data?.[item.name]} {...item.inputProps} />
            );
            case "text-lg": return (
                <Textarea placeholder={strFormName(item.name)} name={item.name} defaultValue={data?.[item.name]} {...item.inputProps} />
            );
            case "number": return (
                <Input placeholder={strFormName(item.name)} name={item.name} defaultValue={data?.[item.name]} {...item.inputProps} type='number' />
            );
            case "checkbox": return (
                <div className='flex gap-4'>
                    <Checkbox id={item.name} name={item.name} defaultChecked={data?.[item.name]} />
                    <Label htmlFor={item.name}>{strFormName(item.name)}</Label>
                    {/* <Input name={item.name} defaultChecked={data?.[item.name]} {...item.inputProps} type="checkbox" /> */}
                </div>
            );
            case "options": return (
                <Select name={item.name} {...item.inputProps} defaultValue={data?.[item.name]}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={strFormName(item.name)} />
                    </SelectTrigger>
                    <SelectContent>
                        {
                            item.meta?.options?.map((opt, i) => (
                                <SelectItem key={i} value={opt.value.toString()}>{opt.label}</SelectItem>
                            ))
                        }
                    </SelectContent>
                </Select>
            );
            case "custom": return (
                item.meta?.customElement
            );
        }
    }

    function renderFormItems(items: FormItem[], data?: JSONType): React.ReactNode {
        return (
            <div className='flex flex-col gap-4'>
                {
                    items.map((item, i) => (
                        <div key={i} className='flex flex-col gap-2'>
                            <ErrorComp error={error} errorKey={item.name} />
                            {renderFormItem(item, data)}
                        </div>
                    ))
                }
            </div>
        )
    }

    // on submit
    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();

        // get form data
        const formData = new FormData(e.currentTarget as HTMLFormElement);

        // get json data from form data
        let json: JSONType = Object.fromEntries(formData.entries());
        // make sure to append boolean fields with unchecked status
        formDef.items.filter((item) => item.type === "checkbox").forEach((item) => {
            if(!formData.has(item.name)) json[item.name] = false;
        });

        // validate if validation exists
        const validatedJson = formDef.validations ? formDef.validations.safeParse(json) : {data: json, error: null};

        if(validatedJson.error) {
            const errorStr: string = formatZodError(validatedJson.error);
            setError({message: errorStr});
        } else {
            setIsLoading(true);
            
            const resDoe: DOE = await formDef.onJson(validatedJson.data);
            if(resDoe.error) setError(resDoe.error);
            else setError(undefined);

            setIsLoading(false);
        }
    }

    return (
        <form className='flex flex-col gap-4' onSubmit={onSubmit}>
            {/* // error message */}
            <ErrorComp error={error} />

            {/* // title */}
            {formDef.title && <p>{formDef.title}</p>}

            {/* // form items */}
            {renderFormItems(formDef.items, formDef.data)}

            {/* // submit */}
            <div className='flex gap-4 justify-end'>
                {formDef.options?.showReset && 
                    <Button type="reset" variant={"secondary"}>Reset</Button>
                }
                <Button type='submit'>{formDef.options?.submitLabel ?? "Submit"}</Button>
            </div>

        </form>
    )

}

export default MForm