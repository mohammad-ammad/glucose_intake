const { Router } = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const Glucose = require("../models/Glucose");
const glucoseRouter = Router();

glucoseRouter.post("/add", authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { blood_glucose_level, carb_intake, medication_dose } = req.body;

    if (!blood_glucose_level || !carb_intake || !medication_dose) {
      return res.status(400).json({ msg: "Not all fields have been entered." });
    }

    // check Daily blood glucose level (measured in mg/dL).
    if (blood_glucose_level < 0 || blood_glucose_level > 1000) {
      return res.status(400).json({ msg: "Invalid blood glucose level." });
    }

    // check Daily carb intake (measured in grams).
    if (carb_intake < 0 || carb_intake > 1000) {
      return res.status(400).json({ msg: "Invalid carb intake." });
    }

    const newGlucose = new Glucose({
      user_id: req.userData?.id,
      blood_glucose_level,
      carb_intake,
      medication_dose,
    });

    const savedGlucose = newGlucose.save();

    if (!savedGlucose) {
      return res.status(400).json({ msg: "Glucose not saved." });
    }

    res.status(200).json({ msg: "Data saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

glucoseRouter.get("/", authMiddleware, async (req, res) => {
  try {
    let glucose = null;

    if (req.query?.id) {
      glucose = await Glucose.findById(req.query.id).select("-user_id -__v");
    } else {
      glucose = await Glucose.find().select("-user_id -__v");
    }
    res.status(200).json(glucose);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

glucoseRouter.put(
  "/update/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { blood_glucose_level, carb_intake, medication_dose } = req.body;

      if (!blood_glucose_level || !carb_intake || !medication_dose) {
        return res
          .status(400)
          .json({ msg: "Not all fields have been entered." });
      }

      // check Daily blood glucose level (measured in mg/dL).
      if (blood_glucose_level < 0 || blood_glucose_level > 1000) {
        return res.status(400).json({ msg: "Invalid blood glucose level." });
      }

      // check Daily carb intake (measured in grams).
      if (carb_intake < 0 || carb_intake > 1000) {
        return res.status(400).json({ msg: "Invalid carb intake." });
      }

      const updatedGlucose = await Glucose.findByIdAndUpdate(req.params.id, {
        blood_glucose_level,
        carb_intake,
        medication_dose,
      });

      if (!updatedGlucose) {
        return res.status(400).json({ msg: "Glucose not updated." });
      }

      res.status(200).json({ msg: "Data updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

glucoseRouter.delete(
  "/delete/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const deletedGlucose = await Glucose.findByIdAndDelete({
        _id: req.params.id,
      });

      if (deletedGlucose) {
        return res.status(200).json({ msg: "Data deleted successfully" });
      }

      res.status(400).json({ msg: "Data not deleted." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

glucoseRouter.get("/daily", authMiddleware, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const startDate = new Date(start_date + "T00:00:00.000Z");
    const endDate = new Date(end_date + "T23:59:59.999Z");

    const glucose = await Glucose.find({
      user_id: req.userData?.id,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).select("-user_id -__v");

    res.status(200).json(glucose);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = glucoseRouter;
