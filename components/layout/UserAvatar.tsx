import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { UserModel } from '@/types/models'

function UserAvatar({user}: {
    user: UserModel,
}) {


    return (
        <Avatar>
            <AvatarImage src={user.image ?? `/profile_pic.png`} />
            <AvatarFallback>{user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
    )

}

export default UserAvatar