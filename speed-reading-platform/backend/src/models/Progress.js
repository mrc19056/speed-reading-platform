const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  session: {
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    duration: {
      type: Number, // saniye cinsinden
      required: true
    }
  },
  performance: {
    wpm: {
      type: Number,
      required: true
    },
    comprehensionScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    totalWords: {
      type: Number,
      required: true
    },
    correctAnswers: {
      type: Number,
      default: 0
    },
    totalQuestions: {
      type: Number,
      default: 0
    }
  },
  settings: {
    wpmSetting: {
      type: Number,
      required: true
    },
    wordsPerGroup: {
      type: Number,
      default: 1
    },
    theme: {
      type: String,
      default: 'light'
    }
  },
  completed: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Composite index for efficient queries
progressSchema.index({ user: 1, activity: 1, createdAt: -1 });
progressSchema.index({ user: 1, course: 1 });

module.exports = mongoose.model('Progress', progressSchema);