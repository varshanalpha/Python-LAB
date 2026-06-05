const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

// Price database for dealers and products
const PRICING_DB = {
    "Headphones": {
        "Binglee": "$100",
        "DXC Electronics": "$95",
        "Bobay": "$105"
    },
    "Laptop": {
        "GH Computers": "$900",
        "Tech city": "$950",
        "Ez PC": "$920"
    },
    "Mouse": {
        "DXC Electronics": "$20",
        "Tech City": "$25"
    },
    "Printer": {
        "Binglee": "$150",
        "DXC Electronics": "$140",
        "Bobay": "$155",
        "GH Computers": "$145"
    }
};

// GET /price/:dealer/:product
app.get('/price/:dealer/:product', (req, res) => {
    const { dealer, product } = req.params;
    const productPrices = PRICING_DB[product];
    
    if (productPrices && productPrices[dealer]) {
        const price = productPrices[dealer];
        return res.json({
            message: `Price of ${product} at ${dealer} is ${price}`
        });
    } else {
        return res.status(404).json({
            message: `Price not found for product "${product}" at dealer "${dealer}"`
        });
    }
});

// GET /allprice/:product
app.get('/allprice/:product', (req, res) => {
    const { product } = req.params;
    const productPrices = PRICING_DB[product];
    
    if (productPrices) {
        const pricesArray = Object.keys(productPrices).map(dealer => ({
            key: dealer,
            value: productPrices[dealer]
        }));
        return res.json({ prices: pricesArray });
    } else {
        return res.status(404).json({
            prices: []
        });
    }
});

const PORT = 8082;
app.listen(PORT, () => {
    console.log(`Dealer Pricing Service running on port ${PORT}`);
});
