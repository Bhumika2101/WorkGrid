const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  url: String,
  mimetype: String,
  size: Number
}, { _id: false });

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: ''
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['feature', 'bug', 'enhancement', 'documentation', 'other'],
    default: 'feature'
  },
  column: {
    type: String,
    enum: ['todo', 'inprogress', 'done'],
    default: 'todo'
  },
  attachments: [attachmentSchema],
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create compound index for efficient querying
taskSchema.index({ userId: 1, column: 1 });

// Virtual for id (to match frontend expectations)
taskSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
taskSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
