const express = require('express');
const CVModel = require('../models/CVModel');

const router = express.Router();

// PUT /api/cv/:id
router.put('/:id', async (req, res) => {
  try {
    const updatedCV = await CVModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCV) {
      return res.status(404).json({ error: 'CV not found' });
    }
    res.json(updatedCV);
  } catch (err) {
    console.error('Update Error:', err);
    res.status(500).json({ error: 'Failed to update CV' });
  }
});

module.exports = router;
