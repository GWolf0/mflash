"use client"

/**
 * Dialog trigger for handling profile edit
 */

import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import MForm from '../ui/MForm'
import { DOE, JSONType } from '@/types/common'
import { AuthUser, UserModel } from '@/types/models'
import { VALIDATION_USER, VALIDATION_USER_PARTIAL } from '@/lib/validations'
import { requestUpdateUser } from '@/services/requests/userRequests'
import { toast } from 'sonner'

function ProfileEditButton({authUser}: {
    authUser: AuthUser,
}) {

    async function onJson(json: JSONType): Promise<DOE> {
        if(!authUser) return {error: {message: "No auth user"}};

        const {id, ...data} = {...authUser, name: json.name} as UserModel;

        const res: DOE<UserModel> = await requestUpdateUser(authUser.id, authUser.id, data);

        if(!res.data) {
            toast(`Error updating user profile details`);
        }

        return res;
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <i className='bi bi-pencil-fill'></i> Edit
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Profile Details</DialogTitle>
                </DialogHeader>

                <div className='w-full'>
                    <MForm 
                        formDef={{
                            id: "profile-edit-form",
                            items: [
                                {name: "name", type: "text", inputProps: {required: true, minLength: 3, maxLength: 48}},
                            ],
                            onJson: onJson,
                            data: {name: authUser?.name},
                            validations: VALIDATION_USER_PARTIAL,
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )

}

export default ProfileEditButton