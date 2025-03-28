import os
import shutil
from PIL import Image

def convert_folders():
    # Get the current directory (where the script is)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Process folders 0 through 5
    for folder_num in range(6):
        source_folder = os.path.join(base_dir, f'folder_{folder_num}')
        target_folder = os.path.join(base_dir, f'folder_{folder_num} copy')
        
        # Skip if source folder doesn't exist
        if not os.path.exists(source_folder):
            print(f"Skipping folder_{folder_num} - not found")
            continue
            
        # Create copy of folder
        if os.path.exists(target_folder):
            shutil.rmtree(target_folder)
        shutil.copytree(source_folder, target_folder)
        
        # Convert webp files in copied folder
        for filename in os.listdir(target_folder):
            if filename.endswith('.webp'):
                webp_path = os.path.join(target_folder, filename)
                jpg_path = os.path.join(target_folder, filename.replace('.webp', '.jpg'))
                
                try:
                    # Open and convert webp to jpg
                    image = Image.open(webp_path)
                    image.convert('RGB').save(jpg_path, 'JPEG', quality=95)
                    
                    # Remove original webp file
                    os.remove(webp_path)
                    print(f"Converted: {filename} -> {filename.replace('.webp', '.jpg')}")
                except Exception as e:
                    print(f"Error converting {filename}: {str(e)}")

if __name__ == "__main__":
    print("Starting folder copy and conversion process...")
    convert_folders()
    print("Process complete!")