import { DeckModel, DeckModelServer, DeckProgressModel, DeckProgressModelServer, UserModel, UserModelServer } from "@/types/models";

export function convertUserServerToUserClient({ _id, ...rest }: UserModelServer): UserModel {
    return {
        ...rest,
        id: _id.toString(),
    };
}

export function convertDeckServerToDeckClient({ _id, user_id, ...rest }: DeckModelServer): DeckModel {
    return {
        ...rest,
        id: _id.toString(),
        user_id: user_id.toString()
    };
}

export function convertDeckProgressServerToDeckProgressClient({ _id, user_id, deck_id, ...rest }: DeckProgressModelServer): DeckProgressModel {
    return {
        ...rest,
        id: _id.toString(),
        user_id: user_id.toString(),
        deck_id: deck_id.toString(),
    };
}