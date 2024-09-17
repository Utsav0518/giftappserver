const express = require('express');
var cors = require('cors');
const app = express();
const port = 3000;

// These lines will be explained in detail later in the unit
app.use(express.json());// process json
app.use(express.urlencoded({ extended: true })); 
app.use(cors());
// These lines will be explained in detail later in the unit

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://ubrahmbhatt:s180197@giftdelivery.d0fif.mongodb.net/?retryWrites=true&w=majority&appName=giftdelivery";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// Global for general use
var userCollection;
var orderCollection;

client.connect(err => {
   userCollection = client.db("giftdelivery").collection("users");
   orderCollection = client.db("giftdelivery").collection("orders");
   
  // perform actions on the collection object
  console.log ('Database up!\n')
 
});


app.get('/', (req, res) => {
  res.send('<h3>Welcome to Gift Delivery server app!</h3>')
})

 
app.get('/getUserDataTest', (req, res) => {

	console.log("GET request received\n"); 

	userCollection.find({}, {projection:{_id:0}}).toArray( function(err, docs) {
		if(err) {
			console.log("Some error.. " + err + "\n");
			res.send(err); 
		} else {
			console.log( JSON.stringify(docs) + " have been retrieved.\n");
			res.status(200).send("<h1>" + JSON.stringify(docs) + "</h1>"); 
		}

	});

});


app.get('/getOrderDataTest', (req, res) => {

	console.log("GET request received\n"); 

	orderCollection.find({},{projection:{_id:0}}).toArray( function(err, docs) {
		if(err) {
		  	console.log("Some error.. " + err + "\n");
			res.send(err); 
		} else {
			console.log( JSON.stringify(docs) + " have been retrieved.\n");
			res.status(200).send("<h1>" + JSON.stringify(docs) + "</h1>"); 
		}

	});

});

app.post('/registerUser', (req, res) => {

    console.log("POST request received for user registration: " + JSON.stringify(req.body) + "\n");

    const userData = req.body;

    // Insert the new user record into the users collection
    userCollection.insertOne(userData, function (err, result) {
        if (err) {
            console.log("Error inserting user data: " + err + "\n");
            res.send({ success: false, message: "Failed to register user. Please try again later." });
        } else {
            console.log("New user registered with ID " + result.insertedId + "\n");
            res.status(200).send({ success: true, message: "User registered successfully." });
        }
    });

});

app.post('/verifyUser', (req, res) => {

	console.log("POST request received : " + JSON.stringify(req.body) + "\n"); 

	loginData = req.body;

	userCollection.find({email:loginData.email, password:loginData.password}, {projection:{_id:0}}).toArray( function(err, docs) {
		if(err) {
		  	console.log("Some error.. " + err + "\n");
			res.send(err);
		} else {
		    console.log(JSON.stringify(docs) + " have been retrieved.\n");
		   	res.status(200).send(docs);
		}	   
		
	  });

});


app.post('/postOrderData', function (req, res) {
    console.log("POST request received: " + JSON.stringify(req.body) + "\n");

    const orderData = req.body;

    // Validate that all necessary fields are present
    if (!orderData.itemName || !orderData.itemPrice || !orderData.itemImage || !orderData.date || !orderData.customerEmail) {
        res.send({ success: false, message: "Missing order details." });
        return;
    }

    // Insert the new order record into the orders collection
    orderCollection.insertOne(orderData, function (err, result) {
        if (err) {
            console.log("Error inserting order data: " + err + "\n");
            res.send({ success: false, message: "Failed to insert order." });
        } else {
            console.log("Order record with ID " + result.insertedId + " inserted successfully.\n");
            res.status(200).send({ success: true, insertedId: result.insertedId });
        }
    });
});

app.post('/getPastOrders', (req, res) => {
    console.log("POST request received for past orders: " + JSON.stringify(req.body) + "\n");

    const userEmail = req.body.email;

    // Check if email is provided
    if (!userEmail) {
        res.status(400).send({ success: false, message: "Email is required to fetch past orders." });
        return;
    }

    // Retrieve all orders for the logged-in user from the orders collection
    orderCollection.find({ customerEmail: userEmail }).toArray(function (err, orders) {
        if (err) {
            console.log("Error retrieving orders: " + err + "\n");
            res.status(500).send({ success: false, message: "Failed to retrieve past orders." });
        } else {
            console.log("Orders retrieved successfully: " + JSON.stringify(orders) + "\n");
            res.status(200).send({ success: true, orders: orders });
        }
    });
});

app.post('/deleteOrders', (req, res) => {
    console.log("POST request received to delete orders: " + JSON.stringify(req.body) + "\n");

    const orderNos = req.body.orderNos; // Directly use req.body to get the parsed JSON

    orderCollection.deleteMany({ orderNo: { $in: orderNos } }, (err, result) => {
        if (err) {
            console.error("Error deleting orders: " + err + "\n");
            res.status(500).send({ success: false, message: 'Failed to delete orders.' });
        } else {
            console.log(result.deletedCount + " orders deleted.\n");
            res.status(200).send({ success: true, deletedCount: result.deletedCount });
        }
    });
});

app.delete('/deleteOrders', (req, res) => {
    console.log("DELETE request received to delete orders: " + JSON.stringify(req.body) + "\n");
    const { orderNos } = req.body;

    orderCollection.deleteMany({ orderNo: { $in: orderNos } }, (err, result) => {
        if (err) {
            console.error("Error deleting orders: " + err + "\n");
            res.status(500).send({ success: false, message: 'Failed to delete orders.' });
        } else {
            console.log(result.deletedCount + " orders deleted.\n");
            res.status(200).send({ success: true, deletedCount: result.deletedCount });
        }
    });
});

app.listen(port, () => {
  console.log(`Gift Delivery server app listening at http://localhost:${port}`) 
});
