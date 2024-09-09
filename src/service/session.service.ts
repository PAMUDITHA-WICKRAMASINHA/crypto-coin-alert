import config from "config";
import {get} from 'lodash'
import { FilterQuery, UpdateQuery } from "mongoose";
import SessionModel, { SchemaDocument } from "../model/session.mode";
import { verifyJwt } from "../utils/jwt.utils";
import {findUser} from '../service/user.service'
import { signJwt } from "../utils/jwt.utils";

export async function createSession(userId: string, userAgent: string) {
    const session = await SessionModel.create({ user: userId, userAgent })
    return session.toJSON();
}

export async function findSessions(query: FilterQuery<SchemaDocument>) {
    return SessionModel.find(query).lean();
}

export async function updateSessions(
    query: FilterQuery<SchemaDocument>,
    update: UpdateQuery<SchemaDocument>
) {
    return SessionModel.updateOne(query, update);
}

export async function reIssueAccessToken({
    refreshToken,
  }: {
    refreshToken: string;
  }) {
    const {decoded} = verifyJwt(refreshToken);

    console.log(decoded);
    

    if(!decoded || !get(decoded, '_id')) return false

    const session = await SessionModel.findById(get(decoded, "_id"));

    if (!session || !session.valid) return false;

    const user = await findUser({_id: session.user});

    if(!user) return false;

    const accessToken = signJwt(
        {...user, session: session._id},
        {expiresIn: config.get('accessTokenTtl')} // 15 minutes
    );

    return accessToken;
}