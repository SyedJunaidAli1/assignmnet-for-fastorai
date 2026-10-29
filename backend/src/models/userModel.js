import mongoose from 'mongoose';
import crypto from 'node:crypto';

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 120 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

/**
 * Password hashing with Node's built-in crypto (scrypt). Stored format:
 * "<64-char hex salt>:<128-char hex scrypt hash>". Verified with
 * timingSafeEqual to avoid leaking timing information.
 */
userSchema.statics.hashPassword = function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(plain, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

userSchema.methods.comparePassword = function comparePassword(plain) {
  const [salt, key] = String(this.passwordHash).split(':');
  if (!salt || !key) return false;
  const attempt = crypto.scryptSync(plain, salt, 64);
  const stored = Buffer.from(key, 'hex');
  return stored.length === attempt.length && crypto.timingSafeEqual(stored, attempt);
};

userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

export default model('User', userSchema);
