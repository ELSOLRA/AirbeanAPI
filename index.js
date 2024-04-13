
const express = require("express");
const Datastore = require("nedb-promise");
const jwt = require('jsonwebtoken');
// const menu = require("./menu");
const app = express();
const PORT = process.env.PORT || 3000;
const { v4: uuidv4} = require('uuid');
const { log } = require("console");
const fs = require('fs').promises;

//Databas
const db = new Datastore({ filename: "database.db", autoload: true });
const menuDb = new Datastore ({ filename: "menu.db", autoload: true })
const userId = uuidv4();
app.use(express.json());



/* async function initializeDatabase() {
  try {
    // Check if any documents exist in the database
    const count = await menuDb.count({});
    if (count === 0) {
      // Default menu data object
      const defaultMenuData = {
        menu: [
          {
            id: 1,
            title: 'Bryggkaffe',
            desc: 'Bryggd på månadens bönor.',
            price: 39,
          },
          {
            id: 2,
            title: 'Caffè Doppio',
            desc: 'Bryggd på månadens bönor.',
            price: 49,
          },
          {
            id: 3,
            title: 'Caffè ADD',
            desc: 'Bryggd på månadens bönor.',
            price: 49,
          },
          // Add other menu items here
        ],
      };

      // Insert default menu data into the database
      await menuDb.insert(defaultMenuData.menu);
      console.log('Default data inserted into the database.');
    } else {
      console.log('Database already contains data. Skipping initialization.');
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

// Call the initialization function before starting the server
initializeDatabase().then(() => {
  // GET MENU
  app.get('/api/beans', async (req, res) => {
    try {
      // Fetch all documents from the 'menu' collection
      const docs = await menuDb.find({});
      res.status(200).json({ success: true, menu: docs });
    } catch (err) {
      res.status(500).json({ success: false, message: err });
    }
  }); */

 







//   ###########################################################################################################



async function initializeDatabase() {
    try {
        // Check if any documents exist in the database
        const count = await menuDb.count({});
        if (count === 0) {
            try {
                const data = await fs.readFile('menu.json', 'utf8');
                const jsonData = JSON.parse(data);
                const newDoc = await menuDb.insert(jsonData.menu);
                console.log('Inserted document:', newDoc);
            } catch (err) {
                console.error('Error reading JSON file or inserting document:', err);
            }
        } else {
            console.log('Database already contains data. Skipping initialization.');
        }
    } catch (err) {
        console.error('Error checking database count or initializing database:', err);
    }
}


// Call the initialization function before starting the server
initializeDatabase().then(() => {
  // GET MENU
  app.get('/api/beans', async (req, res) => {
    try {
      // Fetch all documents from the 'menu' collection
      const docs = await menuDb.find({});
      res.status(200).json({ success: true, menu: docs });
    } catch (err) {
      res.status(500).json({ success: false, message: err });
    }
  });
})

//---------------------------------------------------------------------------------------

//-----------!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

///----------------------------------------------------------------

// GET MENU
/* app.get("/api/beans", async (req, res) => {
    try {
    const docs = await db.find({});
    //    console.log(docs); 
       res.status(200).json(docs);

    } catch (err){
        res.status(500).json({ success: false, message: err });
    }
}); */

// GET STATUS/ Ordernummer
app.get("/api/beans/order/status/:orderNr", async (req, res) => {
  const orderNr = req.params.orderNr;
  try {
    const beans = await db.find({ orderNr: orderNr })
      if (error) {
        res.status(404).send("order not found");
      }

      if (!orderNr) {
        res.status(404).send("no order with that order num");
        return;
      }

      const { genEta } = beans[0];

      res.send(200).json({ eta: genEta });
    } catch (e) {
    res.status(500).send("server crashed");
  }
});


// POST Orders
app.post("/api/beans", async (req, res) => {

    // "order": [
    //   {
    //     "name": "string",
    //     "price": 0
    //   }
    // ]

    // res.status(200).json({
    //     eta: 0,
    //     orderNr: "string",
    //   });
})

// POST SIGNUP
app.post("/api/user/signup",  async (req, res) => {
    const { username,password} = req.body;
  

    const newSignup = {
       userId: userId,
       username: username,
       password: password
    }
    
    // Validera username

    try{
        await db.insert(newSignup)
        res.status(201).json({"success": true})
    }catch (e){
         res.status(500).send("server crashed")
    }
})

// POST Login
app.post("/api/user/login", async (req, res) => {
    const { username,password} = req.body;

    const newLogin = {
        username : username,
        password : password
    }
    
    // Validera username

    try{
        const loggedUser = await db.find( {username, password}) 
        console.log(loggedUser);
        
        console.log(newLogin)
        res.status(201).json({
            "success": true,
            // Generera token
            "token": "string"
            }
)
    }catch (e){
         res.status(500).send("server crashed")
    }
})

//GET Hämta en inloggad användares orderhistorik

app.get("/api/user/history", async (req, res) => {
    // Kolla ifall en token finns i headers:
    try {
        res.status(201).json({
  "success": true,
  "orderHistory": [
    {
      "total": 0,
      "orderNr": "string",
      "orderDate": "string"
    }
  ]
}
)
    } catch (error) {
    console.log(error); 
    }
})



//Generera tid vid  beställning
const genEta = () => {
    return Math.floor(Math.random()*55) + 5;
}
//Generera ordernummer vid beställning
function orderNr() {
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var digits = '0123456789';
    var result = '';
    
    for (var i = 0; i < 3; i++) {
        result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (var i = 0; i < 7; i++) {
        result += digits.charAt(Math.floor(Math.random() * digits.length));
    }

    return result;
}

//Starta servern
// const server = app.listen(PORT, () => console.log(`Server listening at port ${PORT}...`));

const server = app.listen(PORT, () =>
console.log(`Server listening at port ${PORT}...`)
);