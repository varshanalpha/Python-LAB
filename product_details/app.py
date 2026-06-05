from flask import Flask, jsonify
from flask_cors import CORS

app = Flask("Product Details Service")
CORS(app)

# Product to Dealer mapping from products.json
DEALERS_MAP = {
    "Headphones": ["Binglee", "DXC Electronics", "Bobay"],
    "Laptop": ["GH Computers", "Tech city", "Ez PC"],
    "Mouse": ["DXC Electronics", "Tech City"],
    "Printer": ["Binglee", "DXC Electronics", "Bobay", "GH Computers"]
}

@app.route('/products', methods=['GET'])
def get_products():
    """Returns the list of all available products."""
    products = list(DEALERS_MAP.keys())
    return jsonify({"products": products})

@app.route('/getdealers/<product>', methods=['GET'])
def get_dealers(product):
    """Returns the list of dealers supplying the given product."""
    dealers = DEALERS_MAP.get(product, [])
    return jsonify({"dealers": dealers})

if __name__ == "__main__":
    app.run(port=5005, host="0.0.0.0", debug=True)
