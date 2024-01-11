const mongoose = require("mongoose");

const GlucoseSchema = new mongoose.Schema(
  {
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    blood_glucose_level:{
        type: Number,
        required: true,
    },
    carb_intake:{
        type: Number,
        required: true,
    },
    medication_dose:{
        type: Number,
        required: true,
    }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Glucoses ||
  mongoose.model("Glucoses", GlucoseSchema);
