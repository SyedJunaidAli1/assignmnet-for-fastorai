import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;
const { ObjectId } = Types;

const leadSchema = new Schema(
  {
    // Enquiry form data (submitted by prospective client)
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 120 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: { type: String, trim: true, maxlength: 20 },
    courseInterest: { type: String, required: [true, 'Course interest is required'], trim: true, maxlength: 120 },
    message: { type: String, trim: true, maxlength: 1000 },

    // Claim state
    status: {
      type: String,
      enum: { values: ['unclaimed', 'claimed'], message: '{VALUE} is not a valid status' },
      default: 'unclaimed',
      index: true,
    },
    claimedBy: { type: ObjectId, ref: 'User', default: null, index: true },
    claimedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Body of an enquiry card: everything a counselor needs at a glance
leadSchema.index({ name: 'text', email: 'text', courseInterest: 'text' });

/** Public enquiry shape - never exposes claim internals to end clients. */
leadSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    _id: this._id,
    name: this.name,
    courseInterest: this.courseInterest,
  };
};

leadSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export default model('Lead', leadSchema);
