import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { FormOptionType } from '@/types/ui'
import { JSONType } from '@/types/common'

function MSelect({items, name, defaultValue, placeholder, props}: {
    items: FormOptionType[], name: string, defaultValue?: string | number, placeholder?: string, props?: JSONType,
}) {

    return (
        <Select name={name} {...props} defaultValue={defaultValue?.toString()}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {
                    items.map((opt, i) => (
                        <SelectItem key={i} value={opt.value.toString()}>{opt.label}</SelectItem>
                    ))
                }
            </SelectContent>
        </Select>
    )

}

export default MSelect