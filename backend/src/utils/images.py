# util functions to manage images
from time import sleep
from PIL import Image
import catalog
import db_updates
import requests
import os


def download_image(image_url, path_to_save, retries=3, delay=1):
    """
    Function to download and save an image with error handling and retry logic
    """
    for attempt in range(retries):
        try:
            response = requests.get(image_url, timeout=10)  # Added timeout
            if response.status_code == 200:
                with open(path_to_save, 'wb') as f:
                    f.write(response.content)
                return True  # Indicate success
            else:
                print(f"Error downloading {image_url}: Status code {response.status_code}")
        except requests.RequestException as e:
            print(f"Error downloading {image_url}: {e}")
            sleep(delay)  # Wait before retrying
    print(f"Failed to download {image_url} after {retries} attempts.")
    return False  # Indicate failure


def download_all_products_images(df, base_directory="data/product_images/", no_image_file_path='../no_image.webp'):
    """
        Downloads all images for each product in product catalog.
        Saves images in a base_directory under productCode folder for each product
            df: product catalog dataframe. The following columns are required:
                productCode: the unique product code
                images: comma separated list of image URLs
        
            Returns: list of failed to download productCodes
    """
    failed_to_download_codes = []
    # Iterate through the dataframe (ensure 'combined' is your DataFrame)
    for index, row in df.iterrows():
        code = str(row['productCode']).replace('/', '_')
        image_urls = str(row['images']).replace('\n', ',').split(',')
        image_urls = [url.strip() for url in image_urls if url.strip()]

        # Create a unique directory for each product using its code
        product_directory = os.path.join(base_directory, code)
        if not os.path.exists(product_directory):
            os.makedirs(product_directory)
        
        images_downloaded = False  # Flag to check if any image was successfully downloaded
        for idx, image_url in enumerate(image_urls):
            filename = f"{idx}.jpeg"  # Name the file based on its index
            path_to_save = os.path.join(product_directory, filename)  # Save it in the product's directory
            if download_image(image_url, path_to_save):
                images_downloaded = True
        # Check if no image was downloaded (folder is empty) and then add no_image.jpg
        if not images_downloaded:
            failed_to_download_codes.append(code)
            no_image_destination = os.path.join(product_directory, '0.webp')
            if not os.path.exists(no_image_file_path):
                # Create a blank image or handle the absence of the no_image.jpg file
                # For now, just printing an error message
                print(f"No image available at {no_image_file_path}. Please provide a valid path.")
            else:
                # Copy the no_image.jpg to the product directory
                with open(no_image_file_path, 'rb') as src, open(no_image_destination, 'wb') as dst:
                    dst.write(src.read())
    print("Download complete.")
    return failed_to_download_codes


def convert_all_product_images_to_webp(directory):
    # Walk through all directories and files in the specified directory
    # print(os.listdir(directory))
    for root, dirs, files in os.walk(directory):
        print(root, dirs, files)
        for file in files:
            if file.lower().endswith('.jpeg') or file.lower().endswith('.jpg'):
                # Construct the full path to the image
                full_path = os.path.join(root, file)
                # Define the new filename with the .webp extension
                webp_path = full_path.rsplit('.', 1)[0] + '.webp'
                
                # Open the image and convert it
                try:
                    with Image.open(full_path) as img:
                        img.save(webp_path, 'WEBP')
                        print(f"Converted {full_path} to {webp_path}")
                except Exception as e:
                    print(f"Failed to convert {full_path}: {e}")




if __name__ == '__main__':
    path_to_catalog = '/Users/cyxf/Documents/projects/stomatologia/docs/productsV2024-04-26updatedPhotos.xlsx'
    df = catalog.read_catalog_from_xlsx(path_to_catalog)
    base_directory = '/Users/cyxf/Documents/projects/stomatologia/m-stom-be/public/images/products/'
    no_image_path = '/Users/cyxf/Documents/projects/stomatologia/m-stom-be/public/images/no_image.webp'
    failed_to_download = download_all_products_images(df, base_directory=base_directory, no_image_file_path=no_image_path)
    print(failed_to_download)
    convert_all_product_images_to_webp(base_directory)

