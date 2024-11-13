from pymongo import MongoClient


def get_database(uri, dbname):
    """ Connect to MongoDB and return a database object. """
    client = MongoClient(uri)
    return client[dbname]


def fetch_products(db):
    """ Fetch all products from the database. """
    return db.products.find({})

def update_product_images(db, product_id, new_images):
    """ Update the image paths for a given product. """
    db.products.update_one(
        {"_id": product_id},
        {"$set": {"images": new_images}}
    )


def convert_paths_to_webp(images):
    """ Convert image paths from .jpeg to .webp. """
    return [img.replace('.jpeg', '.webp') for img in images if img.endswith('.jpeg')]


def main():
    # Database connection details
    uri = "mongodb://admin:initPass123@10.100.101.12:27017/DentistStore?authSource=admin"
    dbname = 'DentistStore'
    
    # Connect to the database
    db = get_database(uri, dbname)
    
    # Fetch all products
    products = fetch_products(db)
    print(products)
    # Update image paths for each product
    for product in products:
        new_images = convert_paths_to_webp(product.get('images', []))
        if new_images:
            update_product_images(db, product['_id'], new_images)
            print(f"Updated images for product {product['productCode']} to: {new_images}")

if __name__ == "__main__":
    main()
