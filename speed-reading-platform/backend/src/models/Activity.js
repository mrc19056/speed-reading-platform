const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['rsvp', 'group_reading', 'eye_exercise', 'comprehension_test', 'word_recognition', 'focus_training'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true
  },
  content: {
    text: {
      type: String,
      required: true
    },
    wordCount: {
      type: Number,
      required: true
    },
    questions: [{
      question: {
        type: String,
        required: true
      },
      options: [{
        type: String
      }],
      correctAnswer: {
        type: Number,
        required: true
      },
      explanation: {
        type: String
      }
    }]
  },
  settings: {
    defaultWPM: {
      type: Number,
      default: 200
    },
    minWPM: {
      type: Number,
      default: 100
    },
    maxWPM: {
      type: Number,
      default: 1000
    },
    wordsPerGroup: {
      type: Number,
      default: 1
    },
    pauseDuration: {
      type: Number,
      default: 0
    }
  },
  category: {
    type: String,
    enum: ['literature', 'science', 'history', 'news', 'general'],
    default: 'general'
  },
  tags: [{
    type: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);