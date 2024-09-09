import mongoose from "mongoose";
import connection from "../database/connect";
import { UserDocument } from "./user.model";

export interface SchemaDocument extends mongoose.Document {
  user: UserDocument["_id"];
  valid: boolean;
  userAgent: string,
  createdAt: Date;
  updatedAt: Date;

}

const SessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    valid: { type: Boolean, default: true },
    userAgent: {type: String}
  },
  { timestamps: true }
);

// Used for logging in
// UserSchema.methods.comparePassword = async function (
//   candidatePassword: string
// ) {
//   const user = this as UserDocument;

//   return bcrypt.compare(candidatePassword, user.password).catch((e) => false);
// };

const SessionModel = connection.model<SchemaDocument>("Session", SessionSchema);

export default SessionModel;
