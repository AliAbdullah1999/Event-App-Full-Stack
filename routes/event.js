const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/',async(req,res)=>{
    try {
        const response = await axios.get('./views/events.ejs');
        const events = response.data;
        res.render('events',{events});
    } catch (err) {
        console.error(err);
            res.status(500).send('Internal Server Error');
     
        
    }
});

module.exports = router;