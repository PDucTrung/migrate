#!/bin/bash

FILE_LIST="import_list.txt"
IMPORT_DIR="./dumps"

while IFS= read -r file || [ -n "$file" ]; do
  FILE_PATH="$IMPORT_DIR/$file"

  if [ -f "$FILE_PATH" ]; then
    echo "⏳ Importing $file..."
    yarn import-user "$FILE_PATH"
    
    if [ $? -eq 0 ]; then
      echo "✅ Imported $file, removing from list..."

      sed -i "/^$file$/d" "$FILE_LIST"
    else
      echo "❌ Failed to import $file, skipping..."
    fi
  else
    echo "⚠️ File $file not found, skipping..."
    # sed -i "/^$file$/d" "$FILE_LIST"
  fi

  echo "-------------------------"
done < "$FILE_LIST"
